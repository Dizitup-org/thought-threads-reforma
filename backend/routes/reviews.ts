import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/reviews ──────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM reviews WHERE is_approved = true ORDER BY created_at DESC`
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch reviews', details: err.message });
  }
});

// ── POST /api/reviews ─────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const { name, location, rating, comment } = req.body;

  if (!name || !comment) {
    return res.status(400).json({ message: 'Name and comment are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO reviews (name, location, rating, comment, is_approved)
       VALUES ($1, $2, $3, $4, false)
       RETURNING *`,
      [name, location, rating || 5, comment]
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to submit review', details: err.message });
  }
});

export default router;
