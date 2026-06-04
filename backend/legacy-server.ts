import express from 'express';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (from .env)
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:8081', // Your Vite frontend port
  credentials: true
}));

const PORT = process.env.PORT || 3000;

// Initialize Database & Seed Admin
async function initializeDatabase() {
  try {
    console.log('Connecting to Neon DB...');
    
    // Create the admin_users table if it doesn't already exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const adminEmail = 'admin@gmail.com';
    const adminPass = '12345678'; // In production, you would hash this with bcrypt!

    // Check if the admin user exists
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [adminEmail]);
    
    if (result.rows.length === 0) {
      await pool.query('INSERT INTO admin_users (email, password) VALUES ($1, $2)', [adminEmail, adminPass]);
      console.log(`✅ Admin seeded successfully: ${adminEmail}`);
    } else {
      // If they exist, optionally forcefully set their password so it matches your requested "12345678"
      await pool.query('UPDATE admin_users SET password = $1 WHERE email = $2', [adminPass, adminEmail]);
      console.log(`✅ Admin already exists. Password verified for: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
}

// --- Authentication Endpoints ---

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1 AND password = $2', 
      [email, password]
    );

    if (result.rows.length > 0) {
      // Set a simple mock cookie session
      res.cookie('auth_session', email, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('auth_role', 'admin', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      
      return res.status(200).json({ 
        message: 'Login successful', 
        isAdmin: true,
        user: { email: result.rows[0].email }
      });
    }

    return res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

// Check Session & Role (Used by Admin.tsx to verify access)
app.get('/api/auth/me', (req, res) => {
  const userEmail = req.cookies.auth_session;
  const userRole = req.cookies.auth_role;

  if (!userEmail) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.status(200).json({
    user: { email: userEmail },
    isAdmin: userRole === 'admin',
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_session');
  res.clearCookie('auth_role');
  return res.status(200).json({ message: 'Logged out successfully' });
});

// Start Server
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
