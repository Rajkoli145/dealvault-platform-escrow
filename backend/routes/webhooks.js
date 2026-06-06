const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// ── GitHub Webhook Endpoint ───────────────────────────────────────────────────
// Note: This route uses express.raw() middleware (configured in server.js)
// to receive the raw body buffer for webhook signature verification.

router.post('/github', webhookController.handleGitHubWebhook);

module.exports = router;
