import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/orders ──────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC',
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch orders', details: err.message });
  }
});

// ── GET /api/orders/my-orders ────────────────────────────────────────────────
router.get('/my-orders', async (req: Request, res: Response) => {
  const userEmail = req.cookies?.auth_session;
  if (!userEmail) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) return res.status(401).json({ message: 'User not found' });
    const userId = userRes.rows[0].id;

    const { rows } = await pool.query(
      `SELECT * FROM orders
       WHERE customer_email = $1
       ORDER BY created_at DESC`,
      [userEmail]
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch your orders', details: err.message });
  }
});

// ── GET /api/orders/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch order', details: err.message });
  }
});

// ── POST /api/orders ─────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const {
    product_id,
    product_name,
    size,
    collection,
    customer_email,
    customer_phone,
    status,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO orders
        (product_id, product_name, size, collection, customer_email, customer_phone, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        product_id ?? null,
        product_name,
        size,
        collection,
        customer_email ?? null,
        customer_phone ?? null,
        status ?? 'pending',
      ],
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create order', details: err.message });
  }
});

// ── PATCH /api/orders/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  if (!status) {
    return res.status(400).json({ message: 'status field is required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update order status', details: err.message });
  }
});

// ── DELETE /api/orders/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete order', details: err.message });
  }
});

export default router;
