const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators');

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', ...validateRegister, authController.register);
router.post('/login', ...validateLogin, authController.login);
router.post('/logout', authController.logout);

// ─── GitHub OAuth (browser-redirect, no JWT needed) ───────────────────────
router.get('/github',          authController.githubRedirect);
router.get('/github/callback', authController.githubCallback);

// ─── Protected Routes ──────────────────────────────────────────────────────────
router.use(protect); // All routes below require authentication

router.get('/me', authController.getMe);
router.patch('/change-password', authController.changePassword);
router.patch('/role', authController.updateRole);
router.patch('/profile', authController.updateProfile);

module.exports = router;
