const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateLinkWallet } = require('../validators');

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', ...validateRegister, authController.register);
router.post('/login', ...validateLogin, authController.login);
router.post('/logout', authController.logout);

// ─── Protected Routes ──────────────────────────────────────────────────────────
router.use(protect); // All routes below require authentication

router.get('/me', authController.getMe);
router.patch('/change-password', authController.changePassword);
router.post('/wallet', ...validateLinkWallet, authController.linkWallet);

module.exports = router;
