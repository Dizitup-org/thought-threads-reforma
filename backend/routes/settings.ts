import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/settings ──────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings'
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch settings', details: err.message });
  }
});

// ── POST /api/settings ─────────────────────────────────────────────────────────
// For admin updates
router.post('/', async (req: Request, res: Response) => {
  const { setting_key, setting_value } = req.body;
  if (!setting_key) return res.status(400).json({ message: 'setting_key is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
       RETURNING setting_key, setting_value`,
      [setting_key, setting_value]
    );
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to save settings', details: err.message });
  }
});

export default router;
