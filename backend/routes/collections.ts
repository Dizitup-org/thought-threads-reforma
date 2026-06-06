import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

let collectionsSchemaReady: Promise<void> | null = null;

async function ensureCollectionsSchema() {
  if (!collectionsSchemaReady) {
    collectionsSchemaReady = (async () => {
      await pool.query(`
        ALTER TABLE collections
        ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES collections(id) ON DELETE SET NULL
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_collections_parent_id
        ON collections(parent_id)
      `);
    })().catch((error) => {
      collectionsSchemaReady = null;
      throw error;
    });
  }

  await collectionsSchemaReady;
}

/**
 * Walks up the ancestry chain starting at `ancestorCandidateId`.
 * Returns true if `targetId` is found anywhere in that chain,
 * which would mean making `targetId` a child of `ancestorCandidateId` creates a cycle.
 */
async function wouldCreateCycle(targetId: string, ancestorCandidateId: string): Promise<boolean> {
  let currentId: string | null = ancestorCandidateId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) break; // guard against corrupt data loops
    visited.add(currentId);

    if (currentId === targetId) return true; // cycle detected

    const { rows } = await pool.query(
      'SELECT parent_id FROM collections WHERE id = $1',
      [currentId],
    );
    currentId = rows.length > 0 ? (rows[0].parent_id ?? null) : null;
  }

  return false;
}

async function validateParentCollection(parentId?: string | null, childId?: string | null) {
  if (!parentId) {
    return { parentId: null as string | null };
  }

  const { rows } = await pool.query(
    'SELECT id FROM collections WHERE id = $1',
    [parentId],
  );

  if (rows.length === 0) {
    return { error: 'Parent collection not found' };
  }

  // Prevent circular references (unlimited depth is allowed otherwise)
  if (childId && await wouldCreateCycle(childId, parentId)) {
    return { error: 'Cannot assign a collection as its own ancestor (circular reference)' };
  }

  return { parentId };
}

router.use(async (_req, _res, next) => {
  try {
    await ensureCollectionsSchema();
    next();
  } catch (error) {
    next(error);
  }
});

// ── GET /api/collections ─────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         c.*,
         parent.name AS parent_name
       FROM collections c
       LEFT JOIN collections parent ON parent.id = c.parent_id
       ORDER BY
         CASE WHEN c.parent_id IS NULL THEN 0 ELSE 1 END,
         COALESCE(parent.name, c.name) ASC,
         c.name ASC`,
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch collections', details: err.message });
  }
});

// ── POST /api/collections/sync-products ──────────────────────────────────────
// One-time repair: clear the collection field on products whose collection
// string doesn't match any existing collection record (orphaned products).
router.post('/sync-products', async (_req: Request, res: Response) => {
  try {
    // Get all known collection names
    const { rows: colRows } = await pool.query('SELECT name FROM collections');
    const knownNames: string[] = colRows.map((r: any) => r.name);

    if (knownNames.length === 0) {
      // No collections at all — clear collection on all products that have one
      const { rowCount } = await pool.query(
        `UPDATE products SET collection = '' WHERE collection IS NOT NULL AND collection != ''`,
      );
      return res.status(200).json({ message: 'Cleared all product collections (no collections exist)', affected: rowCount });
    }

    // Clear collection on products that have a stale/mismatched collection name
    const placeholders = knownNames.map((_, i) => `$${i + 1}`).join(', ');
    const { rowCount } = await pool.query(
      `UPDATE products
         SET collection = ''
       WHERE collection != ''
         AND collection IS NOT NULL
         AND collection NOT IN (${placeholders})`,
      knownNames,
    );

    return res.status(200).json({
      message: 'Sync complete',
      affected: rowCount,
      knownCollections: knownNames,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Sync failed', details: err.message });
  }
});

// ── POST /api/collections ────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const { name, description, parentId } = req.body as {
    name: string;
    description?: string;
    parentId?: string | null;
  };

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  try {
    const parentValidation = await validateParentCollection(parentId, undefined);
    if (parentValidation.error) {
      return res.status(400).json({ message: parentValidation.error });
    }

    const { rows } = await pool.query(
      `INSERT INTO collections (name, description, parent_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description ?? null, parentValidation.parentId],
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Collection already exists' });
    }
    return res.status(500).json({ message: 'Failed to create collection', details: err.message });
  }
});

// ── PUT /api/collections/:id ─────────────────────────────────────────────────
// Also cascades the new name to all products that carried the old name.
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body as {
    name?: string;
    description?: string;
    parentId?: string | null;
  };

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  if (parentId === id) {
    return res.status(400).json({ message: 'Collection cannot be its own parent' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1️⃣  Fetch the current name so we can cascade the rename to products
    const { rows: existing } = await client.query(
      'SELECT name FROM collections WHERE id = $1',
      [id],
    );
    if (existing.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Collection not found' });
    }
    const oldName = existing[0].name;

    if (parentId) {
      const { rows: parentRows } = await client.query(
        'SELECT id FROM collections WHERE id = $1',
        [parentId],
      );

      if (parentRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Parent collection not found' });
      }

      // Only block actual circular references — unlimited nesting depth is supported
      if (await wouldCreateCycle(id, parentId)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Cannot assign a collection as its own ancestor (circular reference)' });
      }
    }

    // 2️⃣  Rename the collection
    const { rows } = await client.query(
      `UPDATE collections
         SET name = $1, description = $2, parent_id = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description ?? null, parentId ?? null, id],
    );

    // 3️⃣  Cascade: update all products that had the old collection name
    if (oldName !== name) {
      await client.query(
        `UPDATE products SET collection = $1 WHERE collection = $2`,
        [name, oldName],
      );
    }

    await client.query('COMMIT');
    return res.status(200).json({
      ...rows[0],
      _cascadeInfo: `Products with collection "${oldName}" updated to "${name}"`,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A collection with that name already exists' });
    }
    return res.status(500).json({ message: 'Failed to update collection', details: err.message });
  } finally {
    client.release();
  }
});

// ── DELETE /api/collections/:id ──────────────────────────────────────────────
// Also clears the collection field on all products that belonged to it.
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1️⃣  Fetch the collection name so we can clear it from products
    const { rows: existing } = await client.query(
      'SELECT name FROM collections WHERE id = $1',
      [id],
    );
    if (existing.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Collection not found' });
    }
    const colName = existing[0].name;

    const { rows: childRows } = await client.query(
      'SELECT COUNT(*)::int AS count FROM collections WHERE parent_id = $1',
      [id],
    );

    if (childRows[0].count > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Delete or move sub-collections before deleting this collection' });
    }

    // 2️⃣  Clear collection field on all affected products (set to empty string)
    const { rowCount: affectedProducts } = await client.query(
      `UPDATE products SET collection = '' WHERE collection = $1`,
      [colName],
    );

    // 3️⃣  Delete the collection record
    await client.query('DELETE FROM collections WHERE id = $1', [id]);

    await client.query('COMMIT');
    return res.status(200).json({
      message: 'Collection deleted successfully',
      _cascadeInfo: `${affectedProducts} product(s) had their collection cleared`,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Failed to delete collection', details: err.message });
  } finally {
    client.release();
  }
});

export default router;
