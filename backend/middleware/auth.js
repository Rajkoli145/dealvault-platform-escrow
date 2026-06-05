const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * protect – Verifies JWT and attaches the authenticated user to req.user.
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Check token exists in Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check user account is active
    if (user.accountStatus !== 'active' && user.accountStatus !== 'pending_verification') {
      return next(new AppError('Your account has been suspended or deactivated. Please contact support.', 403));
    }

    // 5) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * restrictTo – Restricts access to specific roles.
 * Usage: router.delete('/deal/:id', protect, restrictTo('admin'), ...)
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

/**
 * optionalAuth – Attaches the authenticated user to req.user if a valid JWT is present.
 * Never blocks the request — unauthenticated users simply have req.user = null.
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
    next();
  } catch {
    // Invalid token — just continue without attaching user
    next();
  }
};
