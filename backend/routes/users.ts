import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/users ────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, username, avatar_url, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`,
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch users', details: err.message });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, username, avatar_url, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch user', details: err.message });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, username, avatar_url } = req.body as {
    name?: string;
    phone?: string;
    username?: string;
    avatar_url?: string;
  };

  try {
    const { rows } = await pool.query(
      `UPDATE users SET
        name       = COALESCE($1, name),
        phone      = COALESCE($2, phone),
        username   = COALESCE($3, username),
        avatar_url = COALESCE($4, avatar_url),
        updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, username, avatar_url, updated_at`,
      [name ?? null, phone ?? null, username ?? null, avatar_url ?? null, id],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    // Unique constraint on username
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Username already taken' });
    }
    return res.status(500).json({ message: 'Failed to update user', details: err.message });
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete user', details: err.message });
  }
});

export default router;
