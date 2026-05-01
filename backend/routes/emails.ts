import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/emails ──────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM email_signups ORDER BY subscribed_at DESC',
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch email signups', details: err.message });
  }
});

// ── POST /api/emails/subscribe ───────────────────────────────────────────────
router.post('/subscribe', async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  try {
    await pool.query(
      `INSERT INTO email_signups (email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING`,
      [email],
    );
    return res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to subscribe', details: err.message });
  }
});

// ── DELETE /api/emails/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM email_signups WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Email signup not found' });
    return res.status(200).json({ message: 'Email signup removed' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete email signup', details: err.message });
  }
});

export default router;
