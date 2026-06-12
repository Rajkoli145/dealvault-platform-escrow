/**
 * Request Sanitization Middleware
 *
 * SECURITY: Strips MongoDB operator injection ($/dot keys) and XSS payloads
 * from req.body, req.params and req.query before any route handler runs.
 *
 * Why not app.use(mongoSanitize()) / app.use(xss()) directly?
 * Express 5 makes req.query a getter-only property, and both stock
 * middlewares assign `req.query = ...`, which throws
 * "Cannot set property query of #<IncomingMessage> which has only a getter".
 * This wrapper uses their underlying sanitizers and shadows req.query with
 * Object.defineProperty instead of plain assignment.
 */

const mongoSanitize = require('express-mongo-sanitize');
const { clean: xssClean } = require('xss-clean/lib/xss');

function sanitizeValue(value) {
  // mongoSanitize.sanitize mutates in place (drops $ / dotted keys);
  // xssClean returns a new, HTML-escaped structure.
  return xssClean(mongoSanitize.sanitize(value));
}

module.exports = function sanitizeRequest(req, res, next) {
  // Skip raw bodies (e.g. the GitHub webhook route uses express.raw();
  // its Buffer must stay byte-identical for signature verification).
  if (req.body && !Buffer.isBuffer(req.body) && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }

  if (req.query && Object.keys(req.query).length > 0) {
    const sanitized = sanitizeValue({ ...req.query });
    // SECURITY: Express 5 req.query is getter-only — shadow it with an own
    // property so downstream handlers see the sanitized version.
    Object.defineProperty(req, 'query', {
      value: sanitized,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  next();
};
