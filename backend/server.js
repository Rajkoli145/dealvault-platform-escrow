require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// ─── Initialize App ───────────────────────────────────────────────────────────

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Set various security HTTP headers
app.use(helmet());

// Enable CORS (tighten origins in production via env vars)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Strict Transport Security
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Body Parsing & Sanitization ─────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));         // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── DB Connection ────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (no auth or rate limit needed)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Apply general rate limiter to all API routes
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', apiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deals', require('./routes/deals'));

// ─── Unmatched Routes ─────────────────────────────────────────────────────────

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM (e.g. from Docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated!');
    });
  } else {
    console.log('Process terminated!');
  }
});

module.exports = app;
