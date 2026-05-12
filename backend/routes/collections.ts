import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/collections ─────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM collections ORDER BY name ASC',
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
  const { name, description } = req.body as { name: string; description?: string };

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO collections (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description ?? null],
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
  const { name, description } = req.body as { name?: string; description?: string };

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
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

    // 2️⃣  Rename the collection
    const { rows } = await client.query(
      `UPDATE collections
         SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, description ?? null, id],
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
