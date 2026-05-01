import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/banners ─────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sale_banners ORDER BY created_at DESC',
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch banners', details: err.message });
  }
});

// ── POST /api/banners ────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const { message, is_active } = req.body as { message: string; is_active?: boolean };

  if (!message) {
    return res.status(400).json({ message: 'message is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO sale_banners (message, is_active)
       VALUES ($1, $2)
       RETURNING *`,
      [message, is_active ?? true],
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create banner', details: err.message });
  }
});

// ── PATCH /api/banners/:id/toggle ────────────────────────────────────────────
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `UPDATE sale_banners
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Banner not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to toggle banner', details: err.message });
  }
});

// ── DELETE /api/banners/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM sale_banners WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Banner not found' });
    return res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete banner', details: err.message });
  }
});

export default router;
