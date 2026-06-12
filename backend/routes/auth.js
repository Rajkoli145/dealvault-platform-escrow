const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateLinkWallet } = require('../validators');

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', ...validateRegister, authController.register);
router.post('/login', ...validateLogin, authController.login);
router.post('/logout', authController.logout);

// ─── GitHub OAuth (browser-redirect, no JWT needed) ───────────────────────
router.get('/github',          authController.githubRedirect);
router.get('/github/callback', authController.githubCallback);

// ─── Discord OAuth (browser-redirect, no JWT needed) ──────────────────────
router.get('/discord',          authController.discordRedirect);
router.get('/discord/callback', authController.discordCallback);

// ─── Protected Routes ──────────────────────────────────────────────────────────
router.use(protect); // All routes below require authentication

router.get('/me', authController.getMe);
router.patch('/change-password', authController.changePassword);
router.post('/wallet', ...validateLinkWallet, authController.linkWallet);
router.post('/discord/unlink', authController.unlinkDiscord);
// SECURITY: PATCH /role removed — self-service role escalation (any user → maintainer)
// was a privilege-escalation vector. A role change must be an explicit admin-only flow.
router.patch('/profile', authController.updateProfile);

module.exports = router;
