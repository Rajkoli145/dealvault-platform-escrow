const { body, param, query, validationResult } = require('express-validator');

/**
 * Reusable middleware: runs after all validators and returns 400 if any failed.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────

exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),

  body('role')
    .optional()
    .isIn(['buyer', 'seller']).withMessage('Role must be either buyer or seller'),

  handleValidationErrors,
];

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// ─── Deal Validators ──────────────────────────────────────────────────────────

exports.validateCreateDeal = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be 5–100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => parseFloat(value) > 0).withMessage('Amount must be greater than 0'),

  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'SOL', 'USDC']).withMessage('Currency must be one of: INR, USD, SOL, USDC'),

  body('sellerId')
    .notEmpty().withMessage('Seller ID is required')
    .isMongoId().withMessage('Invalid seller ID format'),

  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid ISO 8601 date')
    .custom((value) => new Date(value) > new Date()).withMessage('Deadline must be in the future'),

  handleValidationErrors,
];

exports.validateUpdateDealStatus = [
  param('id')
    .isMongoId().withMessage('Invalid deal ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['ACCEPTED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'RELEASED', 'CANCELLED'])
    .withMessage('Invalid status value'),

  handleValidationErrors,
];

exports.validateDealId = [
  param('id')
    .isMongoId().withMessage('Invalid deal ID'),

  handleValidationErrors,
];

exports.validateListDeals = [
  query('status')
    .optional()
    .isIn(['CREATED', 'ACCEPTED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'RELEASED', 'DISPUTED', 'REFUNDED', 'CANCELLED'])
    .withMessage('Invalid status filter'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  handleValidationErrors,
];
