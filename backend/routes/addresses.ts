import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/addresses ────────────────────────────────────────────────────────
// Get addresses for the logged in user (via email in cookie -> user.id)
router.get('/', async (req: Request, res: Response) => {
  const userEmail = req.cookies?.auth_session;
  if (!userEmail) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) return res.status(401).json({ message: 'User not found' });
    const userId = userRes.rows[0].id;

    const { rows } = await pool.query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch addresses', details: err.message });
  }
});

// ── POST /api/addresses ───────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const userEmail = req.cookies?.auth_session;
  if (!userEmail) return res.status(401).json({ message: 'Not authenticated' });

  const { address_line, city, state, pincode, country, is_default } = req.body;

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) return res.status(401).json({ message: 'User not found' });
    const userId = userRes.rows[0].id;

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const { rows } = await pool.query(
      `INSERT INTO addresses (user_id, address_line, city, state, pincode, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, address_line, city, state, pincode, country || 'India', is_default || false]
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create address', details: err.message });
  }
});

// ── PUT /api/addresses/:id ────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const userEmail = req.cookies?.auth_session;
  if (!userEmail) return res.status(401).json({ message: 'Not authenticated' });

  const { id } = req.params;
  const { address_line, city, state, pincode, country, is_default } = req.body;

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) return res.status(401).json({ message: 'User not found' });
    const userId = userRes.rows[0].id;

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const { rows } = await pool.query(
      `UPDATE addresses SET
        address_line = COALESCE($1, address_line),
        city         = COALESCE($2, city),
        state        = COALESCE($3, state),
        pincode      = COALESCE($4, pincode),
        country      = COALESCE($5, country),
        is_default   = COALESCE($6, is_default),
        updated_at   = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [address_line, city, state, pincode, country, is_default, id, userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Address not found or unauthorized' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update address', details: err.message });
  }
});

// ── DELETE /api/addresses/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const userEmail = req.cookies?.auth_session;
  if (!userEmail) return res.status(401).json({ message: 'Not authenticated' });

  const { id } = req.params;

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) return res.status(401).json({ message: 'User not found' });
    const userId = userRes.rows[0].id;

    const { rowCount } = await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rowCount === 0) return res.status(404).json({ message: 'Address not found or unauthorized' });
    
    return res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete address', details: err.message });
  }
});

export default router;
