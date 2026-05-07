import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const router = Router();

// ── Seed admin on startup ────────────────────────────────────────────────────
export async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to Neon DB...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const adminEmail = process.env.ADMIN_ID;
    const adminPass  = process.env.ADMIN_PASS;

    if (!adminEmail || !adminPass) {
      console.warn('⚠️  ADMIN_ID or ADMIN_PASS not set in .env — skipping admin seed');
      return;
    }

    const { rows } = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [adminEmail],
    );

    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO admin_users (email, password) VALUES ($1, $2)',
        [adminEmail, adminPass],
      );
      console.log(`✅ Admin seeded: ${adminEmail}`);
    } else {
      await pool.query(
        'UPDATE admin_users SET password = $1 WHERE email = $2',
        [adminPass, adminEmail],
      );
      console.log(`✅ Admin already exists, password synced: ${adminEmail}`);
    }
  } catch (err) {
    console.error('❌ Database initialisation failed:', err);
  }
}

// ── POST /api/auth/admin-login ───────────────────────────────────────────────
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }

    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminEmail = process.env.ADMIN_ID;
    const adminPass  = process.env.ADMIN_PASS;

    if (!adminEmail || !adminPass) {
      console.error('❌ ADMIN_ID or ADMIN_PASS not set in environment variables');
      return res.status(500).json({ message: 'Admin credentials not configured on server' });
    }

    // Compare directly against the .env credentials
    if (email === adminEmail && password === adminPass) {
      res.cookie('auth_session', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.cookie('auth_role', 'admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return res.status(200).json({
        message: 'Login successful',
        isAdmin: true,
        user: { email },
      });
    }

    return res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Internal server error', details: err.message });
  }
});

// ── POST /api/auth/login (regular user) ─────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'No account found with that email. Please sign up first.' });
    }

    const user = rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials. If you used an external provider previously, password login is not supported.' });
    }

    let isValidPassword = false;
    
    if (user.password_hash.startsWith('$2')) {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Temporary fallback for legacy plain-text passwords
      isValidPassword = password === user.password_hash;
      
      if (isValidPassword) {
        // Transparently upgrade the password hash in the background
        const saltRounds = 10;
        const newHash = await bcrypt.hash(password, saltRounds);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]).catch(console.error);
      }
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.cookie('auth_session', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.cookie('auth_role', 'user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Login successful',
      isAdmin: false,
      user: { id: rows[0].id, email: rows[0].email, name: rows[0].name },
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Internal server error', details: err.message });
  }
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req: Request, res: Response) => {
  const { email, name, password } = req.body as {
    email: string;
    password: string;
    name: string;
  };

  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash],
    );

    return res.status(201).json({
      message: 'Account created successfully',
      user: rows[0],
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal server error', details: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  const userEmail: string | undefined = req.cookies?.auth_session;
  const userRole: string | undefined  = req.cookies?.auth_role;

  if (!userEmail) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Admins are NOT stored in the users table — return their session info directly.
  if (userRole === 'admin') {
    return res.status(200).json({
      user: { email: userEmail, name: 'Admin' },
      isAdmin: true,
    });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, avatar_url, username, created_at FROM users WHERE email = $1',
      [userEmail]
    );

    if (rows.length === 0) {
      // Clear invalid cookie
      res.clearCookie('auth_session');
      res.clearCookie('auth_role');
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: rows[0],
      isAdmin: false,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('auth_session');
  res.clearCookie('auth_role');
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
