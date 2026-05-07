import pkg from 'pg';
const { Pool } = pkg;

// Create connection pool for Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const { active } = req.query;
      
      let query = 'SELECT * FROM public.sale_banners WHERE 1=1';
      let params = [];
      let paramIndex = 1;

      // Apply filters
      if (active !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(active === 'true');
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, params);
      
      // Transform data to match frontend expectations
      const banners = result.rows.map(banner => ({
        id: banner.id,
        title: banner.message,
        subtitle: '',
        buttonText: 'Shop Now',
        link: '/shop',
        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
        active: banner.is_active,
        created_at: banner.created_at,
        updated_at: banner.updated_at
      }));

      return res.status(200).json({
        data: banners,
        error: null,
        count: banners.length
      });

    } else if (req.method === 'POST') {
      // Handle banner creation
      const { message, is_active } = req.body;

      const query = `
        INSERT INTO public.sale_banners (message, is_active)
        VALUES ($1, $2)
        RETURNING *
      `;

      const result = await client.query(query, [message, is_active]);

      return res.status(201).json({
        data: result.rows[0],
        error: null
      });

    } else if (req.method === 'PUT') {
      // Handle banner updates
      const { id } = req.query;
      const updates = req.body;

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE public.sale_banners 
        SET ${setClause}, updated_at = now()
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...Object.values(updates)];
      const result = await client.query(query, values);

      return res.status(200).json({
        data: result.rows[0],
        error: null
      });

    } else if (req.method === 'DELETE') {
      // Handle banner deletion
      const { id } = req.query;

      const query = 'DELETE FROM public.sale_banners WHERE id = $1 RETURNING *';
      const result = await client.query(query, [id]);

      return res.status(200).json({
        data: result.rows[0],
        error: null
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      data: null,
      error: error.message,
      count: 0
    });

  } finally {
    client.release();
  }
}