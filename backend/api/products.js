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
      const { featured, category, type, limit, order } = req.query;
      
      let query = 'SELECT * FROM public.products WHERE 1=1';
      let params = [];
      let paramIndex = 1;

      // Apply filters
      if (featured !== undefined) {
        query += ` AND featured = $${paramIndex}`;
        params.push(featured === 'true');
        paramIndex++;
      }

      if (category) {
        query += ` AND collection = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (type) {
        query += ` AND collection = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      // Apply ordering
      if (order === 'created_at_desc') {
        query += ' ORDER BY created_at DESC';
      } else if (order === 'price_asc') {
        query += ' ORDER BY price ASC';
      } else if (order === 'price_desc') {
        query += ' ORDER BY price DESC';
      } else {
        query += ' ORDER BY created_at DESC';
      }

      // Apply limit
      if (limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(parseInt(limit));
      }

      const result = await client.query(query, params);
      
      // Transform data to match frontend expectations
      const products = result.rows.map(product => ({
        id: product.id,
        name: product.product_name,
        price: parseFloat(product.price),
        originalPrice: product.discount > 0 ? parseFloat(product.price) / (1 - product.discount/100) : null,
        discount: product.discount,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        images: product.images || [],
        category: product.collection,
        collection: product.collection,
        featured: product.featured,
        description: product.description,
        stock: product.stock,
        sizes: product.sizes || [],
        gsm: product.gsm_options || [],
        tags: product.tags || [],
        created_at: product.created_at,
        updated_at: product.updated_at
      }));

      return res.status(200).json({
        data: products,
        error: null,
        count: products.length
      });

    } else if (req.method === 'POST') {
      // Handle product creation
      const { 
        product_name, price, images, collection, stock, 
        sizes, gsm_options, tags, discount, description, featured 
      } = req.body;

      const query = `
        INSERT INTO public.products (
          product_name, price, images, collection, stock, sizes, 
          gsm_options, tags, discount, description, featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const result = await client.query(query, [
        product_name, price, images, collection, stock,
        sizes, gsm_options, tags, discount, description, featured
      ]);

      return res.status(201).json({
        data: result.rows[0],
        error: null
      });

    } else if (req.method === 'PUT') {
      // Handle product updates
      const { id } = req.query;
      const updates = req.body;

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE public.products 
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
      // Handle product deletion
      const { id } = req.query;

      const query = 'DELETE FROM public.products WHERE id = $1 RETURNING *';
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
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'GET':
        if (query.id) {
          // Get single product by ID
          const product = mockProducts.find(p => p.id === query.id);
          res.status(200).json({
            data: product || null,
            error: null,
            count: product ? 1 : 0
          });
        } else {
          // Get all products with filters
          let filteredProducts = [...mockProducts];

          if (query.featured === 'true') {
            filteredProducts = filteredProducts.filter(p => p.featured);
          }

          if (query.collection) {
            filteredProducts = filteredProducts.filter(p => 
              p.collection.toLowerCase() === query.collection.toLowerCase()
            );
          }

          if (query.search) {
            const searchTerm = query.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
              p.name.toLowerCase().includes(searchTerm) ||
              p.description.toLowerCase().includes(searchTerm) ||
              p.collection.toLowerCase().includes(searchTerm)
            );
          }

          // Sort by created_at descending
          filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          if (query.limit) {
            const limit = parseInt(query.limit);
            filteredProducts = filteredProducts.slice(0, limit);
          }

          res.status(200).json({
            data: filteredProducts,
            error: null,
            count: filteredProducts.length
          });
        }
        break;

      case 'POST':
        // Create new product (mock)
        const newProduct = {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          ...req.body
        };
        mockProducts.push(newProduct);

        res.status(201).json({
          data: newProduct,
          error: null,
          count: 1
        });
        break;

      case 'PUT':
        // Update product (mock)
        if (!query.id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const productIndex = mockProducts.findIndex(p => p.id === query.id);
        if (productIndex === -1) {
          return res.status(404).json({ error: 'Product not found' });
        }

        mockProducts[productIndex] = { ...mockProducts[productIndex], ...req.body };
        
        res.status(200).json({
          data: mockProducts[productIndex],
          error: null,
          count: 1
        });
        break;

      case 'DELETE':
        // Delete product (mock)
        if (!query.id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const deleteIndex = mockProducts.findIndex(p => p.id === query.id);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const deletedProduct = mockProducts.splice(deleteIndex, 1)[0];
        
        res.status(200).json({
          data: deletedProduct,
          error: null,
          count: 1
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      data: null,
      error: error.message,
      count: 0
    });
  }
}

// Real database version (uncomment and use when your Neon database has products):
/*
import pkg from "pg";
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'GET':
        if (query.id) {
          const result = await pool.query('SELECT * FROM products WHERE id = $1', [query.id]);
          res.status(200).json({
            data: result.rows[0] || null,
            error: null,
            count: result.rowCount
          });
        } else {
          let sql = 'SELECT * FROM products WHERE 1=1';
          const params = [];
          let paramIndex = 1;

          if (query.featured === 'true') {
            sql += ` AND featured = $${paramIndex}`;
            params.push(true);
            paramIndex++;
          }

          if (query.collection) {
            sql += ` AND collection = $${paramIndex}`;
            params.push(query.collection);
            paramIndex++;
          }

          if (query.search) {
            sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR collection ILIKE $${paramIndex})`;
            params.push(`%${query.search}%`);
            paramIndex++;
          }

          sql += ' ORDER BY created_at DESC';

          if (query.limit) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(parseInt(query.limit));
            paramIndex++;
          }

          const result = await pool.query(sql, params);
          res.status(200).json({
            data: result.rows,
            error: null,
            count: result.rowCount
          });
        }
        break;

      case 'POST':
        const {
          id = crypto.randomUUID(),
          name,
          price,
          image_url,
          collection,
          stock,
          sizes,
          gsm,
          description,
          featured = false,
          tags,
          discount_percentage,
          discounted_price,
          is_on_sale = false
        } = req.body;

        const insertResult = await pool.query(`
          INSERT INTO products (
            id, name, price, image_url, collection, stock, sizes, gsm,
            description, featured, tags, discount_percentage, discounted_price, is_on_sale,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          RETURNING *
        `, [id, name, price, image_url, collection, stock, sizes, gsm, description, featured, tags, discount_percentage, discounted_price, is_on_sale]);

        res.status(201).json({
          data: insertResult.rows[0],
          error: null,
          count: insertResult.rowCount
        });
        break;

      case 'PUT':
        if (!query.id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const fields = Object.keys(req.body).filter(key => key !== 'id');
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = fields.map(field => req.body[field]);

        const updateResult = await pool.query(`
          UPDATE products 
          SET ${setClause}, updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [query.id, ...values]);

        res.status(200).json({
          data: updateResult.rows[0] || null,
          error: null,
          count: updateResult.rowCount
        });
        break;

      case 'DELETE':
        if (!query.id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const deleteResult = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [query.id]);
        res.status(200).json({
          data: deleteResult.rows[0] || null,
          error: null,
          count: deleteResult.rowCount
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      data: null,
      error: error.message,
      count: 0
    });
  }
}
*/