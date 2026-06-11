const { optionalAuth, restrictTo } = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough';

describe('OptionalAuth Middleware', () => {
  it('should proceed if no token is provided', async () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('should attach user if valid token is provided but user does not exist', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough');

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    const findSpy = jest.spyOn(User, 'findById').mockResolvedValue(null);

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    findSpy.mockRestore();
  });

  it('should attach user if valid token is provided and user exists', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough');

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    const mockUser = { _id: userId, name: 'Test User' };
    const findSpy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBe(mockUser);
    findSpy.mockRestore();
  });

  it('should ignore invalid token and proceed', async () => {
    const req = { headers: { authorization: 'Bearer invalid.jwt.format' } };
    const res = {};
    const next = jest.fn();

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});

describe('RestrictTo Middleware', () => {
  it('should allow access if role matches', () => {
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = jest.fn();

    restrictTo('admin', 'maintainer')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should block access with AppError if role does not match', () => {
    const req = { user: { role: 'buyer' } };
    const res = {};
    const next = jest.fn();

    restrictTo('admin')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('Global Error Handler Middleware', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should send developer formatted error in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = { statusCode: 500, status: 'error', message: 'Test error', stack: 'stacktrace' };
    const req = {};
    const next = jest.fn();

    errorHandler(err, req, res, next);

    process.env.NODE_ENV = originalEnv;

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Test error',
    }));
  });

  it('should format database CastError', () => {
    const err = { name: 'CastError', path: 'id', value: 'badval' };
    const req = {};
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid id: badval.',
    }));
  });

  it('should format database duplicate key error', () => {
    const err = { code: 11000, errmsg: 'duplicate key error index: email_1 dup key: { email: "test@test.com" }' };
    const req = {};
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Duplicate field value'),
    }));
  });

  it('should format database validation error', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        title: { message: 'Title is required.' },
      },
    };
    const req = {};
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid input data. Title is required.',
    }));
  });

  it('should format TokenExpiredError', () => {
    const err = { name: 'TokenExpiredError' };
    const req = {};
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should handle unoperational custom programming errors in production mode', () => {
    const err = { name: 'Error', isOperational: false };
    const req = {};
    const next = jest.fn();

    const originalConsoleError = console.error;
    console.error = jest.fn();

    errorHandler(err, req, res, next);

    console.error = originalConsoleError;

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Something went very wrong!',
    }));
  });
});

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth');

describe('Protect Middleware Edge Cases', () => {
  it('should reject with AppError if no token is provided', async () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();
    await protect(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should reject with AppError if user no longer exists', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    const findSpy = jest.spyOn(User, 'findById').mockResolvedValue(null);

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });

  it('should reject with AppError if user is suspended', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    const mockUser = {
      accountStatus: 'suspended',
      changedPasswordAfter: jest.fn().mockReturnValue(false),
    };
    const findSpy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });

  it('should reject with AppError if user changed password after token issuance', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    const mockUser = {
      accountStatus: 'active',
      changedPasswordAfter: jest.fn().mockReturnValue(true),
    };
    const findSpy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });
});

describe('AppError status checks', () => {
  it('should set status to fail for 4xx errors, and error for 5xx errors', () => {
    const err400 = new AppError('Fail', 400);
    expect(err400.status).toBe('fail');

    const err500 = new AppError('Error', 500);
    expect(err500.status).toBe('error');
  });
});

const authController = require('../controllers/authController');

describe('AuthController Edge Cases', () => {
  it('should call next with 404 in linkWallet if user is null', async () => {
    const req = { user: { _id: 'some-id' }, body: { walletAddress: 'GA5W247FEJSIBI2LNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7' } };
    const res = {};
    const next = jest.fn();
    
    const findSpy = jest.spyOn(User, 'findById').mockResolvedValue(null);
    await authController.linkWallet(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });

  // SECURITY: updateRole handler was removed (self-service role escalation). Assert
  // it is no longer exported so it cannot be reintroduced unguarded by accident.
  it('should no longer export an updateRole handler', () => {
    expect(authController.updateRole).toBeUndefined();
  });

  it('should call next with error in updateProfile if db fails', async () => {
    const req = { user: { _id: 'id' }, body: { bio: 'hello' } };
    const res = {};
    const next = jest.fn();
    const findSpy = jest.spyOn(User, 'findById').mockRejectedValue(new Error('DB error'));
    await authController.updateProfile(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });

  it('should call next with error in linkWallet if db fails', async () => {
    const req = { user: { _id: 'id' }, body: { walletAddress: 'GA5W247FEJSIBI2LNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7' } };
    const res = {};
    const next = jest.fn();
    const findSpy = jest.spyOn(User, 'findById').mockRejectedValue(new Error('DB error'));
    await authController.linkWallet(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });

  it('should call next with 404 in changePassword if user is null', async () => {
    const req = { user: { _id: 'id' }, body: { currentPassword: 'pw', newPassword: 'new' } };
    const res = {};
    const next = jest.fn();
    const findSpy = jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    await authController.changePassword(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    findSpy.mockRestore();
  });
});
