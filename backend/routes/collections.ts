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
    // Unique constraint violation
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Collection already exists' });
    }
    return res.status(500).json({ message: 'Failed to create collection', details: err.message });
  }
});

// ── DELETE /api/collections/:id ──────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Collection not found' });
    return res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete collection', details: err.message });
  }
});

export default router;
