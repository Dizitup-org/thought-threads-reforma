import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/products ────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC',
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch products', details: err.message });
  }
});

// ── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch product', details: err.message });
  }
});

// ── POST /api/products ───────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const {
    product_name,
    price,
    collection,
    stock,
    sizes,
    gsm_options,
    description,
    featured,
    tags,
    discount,
    images,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO products
        (product_name, price, collection, stock, sizes, gsm_options,
         description, featured, tags, discount, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        product_name,
        price,
        collection,
        stock ?? 0,
        sizes ?? [],
        gsm_options ?? [],
        description ?? null,
        featured ?? false,
        tags ?? [],
        discount ?? 0,
        images ?? [],
      ],
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    console.error('Error creating product:', err);
    return res.status(500).json({ message: 'Failed to create product', details: err.message });
  }
});

// ── PUT /api/products/:id ────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    product_name,
    price,
    collection,
    stock,
    sizes,
    gsm_options,
    description,
    featured,
    tags,
    discount,
    images,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE products SET
        product_name = COALESCE($1, product_name),
        price        = COALESCE($2, price),
        collection   = COALESCE($3, collection),
        stock        = COALESCE($4, stock),
        sizes        = COALESCE($5, sizes),
        gsm_options  = COALESCE($6, gsm_options),
        description  = COALESCE($7, description),
        featured     = COALESCE($8, featured),
        tags         = COALESCE($9, tags),
        discount     = COALESCE($10, discount),
        images       = COALESCE($11, images)
       WHERE id = $12
       RETURNING *`,
      [
        product_name ?? null,
        price ?? null,
        collection ?? null,
        stock ?? null,
        sizes ?? null,
        gsm_options ?? null,
        description ?? null,
        featured ?? null,
        tags ?? null,
        discount ?? null,
        images ?? null,
        id,
      ],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    return res.status(200).json(rows[0]);
  } catch (err: any) {
    console.error('Error updating product:', err);
    return res.status(500).json({ message: 'Failed to update product', details: err.message });
  }
});

// ── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1',
      [id],
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Product not found' });
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete product', details: err.message });
  }
});

export default router;
