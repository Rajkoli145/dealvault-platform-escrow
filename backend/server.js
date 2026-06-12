require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { assertWebhookSecretConfigured } = require('./services/githubBot');

// SECURITY: Fail fast if the webhook secret is missing (outside tests), so the
// webhook endpoint can never run in its fail-open state.
if (process.env.NODE_ENV !== 'test') {
  assertWebhookSecretConfigured();
}

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

// SECURITY: brute-force protection on credential login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// SECURITY: wallet linking is a high-value mutation — keep attempts rare
const walletLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many wallet update attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// SECURITY: throttle OAuth callback to blunt code-replay / enumeration attempts
const githubCallbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many OAuth attempts. Please try again after an hour.',
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

// Raw body for GitHub webhook signature verification (must be before json parser)
app.use('/api/webhooks/github', express.raw({ type: 'application/json' }));
// Raw body for Sumsub KYC webhook signature verification
app.use('/api/kyc/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10kb' }));         // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// SECURITY: strip Mongo operator injection + XSS payloads from all request
// input (body/params/query) before any route handler runs. Express 5-safe
// wrapper around express-mongo-sanitize + xss-clean — see middleware/sanitize.js.
app.use(require('./middleware/sanitize'));

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
  app.use('/api/auth/login', loginLimiter);                    // SECURITY: 10 req / 15 min
  app.use('/api/auth/register', authLimiter);                  // SECURITY: 5 req / 15 min
  app.use('/api/auth/wallet', walletLimiter);                  // SECURITY: 5 req / hour
  app.use('/api/auth/github/callback', githubCallbackLimiter); // SECURITY: 20 req / hour
}

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/kyc', require('./routes/kyc'));

// DealVault Bot routes
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/issues', require('./routes/issues'));

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
