import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter, { initializeDatabase } from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import collectionsRouter from './routes/collections.js';
import bannersRouter from './routes/banners.js';
import emailsRouter from './routes/emails.js';
import usersRouter from './routes/users.js';
import addressesRouter from './routes/addresses.js';
import settingsRouter from './routes/settings.js';
import reviewsRouter from './routes/reviews.js';

// ── Environment ──────────────────────────────────────────────────────────────
dotenv.config();

const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite default
  'http://localhost:8080',
  'http://localhost:8081',
];

// ── Express App ──────────────────────────────────────────────────────────────
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile) or whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/products',    productsRouter);
app.use('/api/orders',      ordersRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/banners',     bannersRouter);
app.use('/api/emails',      emailsRouter);
app.use('/api/users',       usersRouter);
app.use('/api/addresses',   addressesRouter);
app.use('/api/settings',    settingsRouter);
app.use('/api/reviews',     reviewsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Routes mounted:`);
  console.log(`   • /api/auth`);
  console.log(`   • /api/products`);
  console.log(`   • /api/orders`);
  console.log(`   • /api/collections`);
  console.log(`   • /api/banners`);
  console.log(`   • /api/emails`);
  console.log(`   • /api/users`);
  console.log(`   • /api/health`);
});
