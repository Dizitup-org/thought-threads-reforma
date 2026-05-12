import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

// Debug: confirm env var is loaded
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set. Check your .env file.');
  process.exit(1);
}

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ─── Products ────────────────────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, featured, category, type, limit, order } = req.query;

    // Single product by ID
    if (id) {
      const result = await client.query(
        'SELECT * FROM public.products WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ data: null, error: 'Product not found' });
      }
      return res.status(200).json({ data: result.rows[0], error: null });
    }

    let query = 'SELECT * FROM public.products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (featured !== undefined) {
      query += ` AND featured = $${paramIndex++}`;
      params.push(featured === 'true');
    }
    if (category) {
      query += ` AND collection = $${paramIndex++}`;
      params.push(category);
    }
    if (type) {
      query += ` AND collection = $${paramIndex++}`;
      params.push(type);
    }

    if (order === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (order === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(limit, 10));
    }

    const result = await client.query(query, params);

    const products = result.rows.map(p => ({
      id: p.id,
      name: p.product_name,
      price: parseFloat(p.price),
      originalPrice: p.discount > 0 ? parseFloat(p.price) / (1 - p.discount / 100) : null,
      discount: p.discount,
      image: p.images && p.images.length > 0 ? p.images[0] : null,
      images: p.images || [],
      category: p.collection,
      collection: p.collection,
      featured: p.featured,
      description: p.description,
      stock: p.stock,
      sizes: p.sizes || [],
      gsm: p.gsm_options || [],
      tags: p.tags || [],
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return res.status(200).json({ data: products, error: null, count: products.length });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return res.status(500).json({ data: null, error: err.message, count: 0 });
  } finally {
    client.release();
  }
});

app.post('/api/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      product_name, price, images, collection, stock,
      sizes, gsm_options, tags, discount, description, featured,
    } = req.body;

    const result = await client.query(
      `INSERT INTO public.products
         (product_name, price, images, collection, stock, sizes, gsm_options, tags, discount, description, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [product_name, price, images, collection, stock, sizes, gsm_options, tags, discount, description, featured]
    );

    return res.status(201).json({ data: result.rows[0], error: null });
  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const updates = req.body;

    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');

    const result = await client.query(
      `UPDATE public.products SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );

    return res.status(200).json({ data: result.rows[0], error: null });
  } catch (err) {
    console.error('PUT /api/products error:', err);
    return res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const result = await client.query(
      'DELETE FROM public.products WHERE id = $1 RETURNING *',
      [id]
    );
    return res.status(200).json({ data: result.rows[0], error: null });
  } catch (err) {
    console.error('DELETE /api/products error:', err);
    return res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

// ─── Banners ─────────────────────────────────────────────────────────────────

app.get('/api/banners', async (req, res) => {
  const client = await pool.connect();
  try {
    const { active } = req.query;

    let query = 'SELECT * FROM public.sale_banners WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);

    const banners = result.rows.map(b => ({
      id: b.id,
      title: b.message,
      message: b.message,
      subtitle: '',
      buttonText: 'Shop Now',
      link: '/shop',
      background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
      active: b.is_active,
      is_active: b.is_active,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));

    return res.status(200).json({ data: banners, error: null, count: banners.length });
  } catch (err) {
    console.error('GET /api/banners error:', err);
    return res.status(500).json({ data: null, error: err.message, count: 0 });
  } finally {
    client.release();
  }
});

app.post('/api/banners', async (req, res) => {
  const client = await pool.connect();
  try {
    const { message, is_active } = req.body;
    const result = await client.query(
      'INSERT INTO public.sale_banners (message, is_active) VALUES ($1, $2) RETURNING *',
      [message, is_active]
    );
    return res.status(201).json({ data: result.rows[0], error: null });
  } catch (err) {
    console.error('POST /api/banners error:', err);
    return res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/banners', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const updates = req.body;

    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');

    const result = await client.query(
      `UPDATE public.sale_banners SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return res.status(200).json({ data: result.rows[0], error: null });
  } catch (err) {
    console.error('PUT /api/banners error:', err);
    return res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/banners', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const result = await client.query(
      'DELETE FROM public.sale_banners WHERE id = $1 RETURNING *',
      [id]
    );
    return res.status(200).json({ data: result.rows[0], error: null });
  } catch (err) {
    console.error('DELETE /api/banners error:', err);
    return res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

// ─── Auth ────────────────────────────────────────────────────────────────────

// Admin login — checks admin_users table with bcrypt password verification
app.post('/api/admin-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM public.admin_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    return res.status(200).json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name || null },
    });
  } catch (err) {
    console.error('POST /api/admin-login error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// User login — checks users table
app.post('/api/user-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM public.users WHERE email = $1 AND password = $2',
      [email.toLowerCase().trim(), password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name || null },
    });
  } catch (err) {
    console.error('POST /api/user-login error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// User registration
app.post('/api/user-register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const existing = await pool.query(
      'SELECT id FROM public.users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const result = await pool.query(
      'INSERT INTO public.users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email.toLowerCase().trim(), password, name || null]
    );

    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('POST /api/user-register error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Upload ───────────────────────────────────────────────────────────────────
// Placeholder endpoint — wire up multer or a storage SDK as needed.
app.post('/api/upload', (req, res) => {
  // TODO: integrate file storage (e.g. Supabase Storage, S3, Cloudinary)
  res.status(501).json({ data: null, error: 'Upload endpoint not yet implemented' });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
