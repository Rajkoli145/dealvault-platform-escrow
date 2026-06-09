const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const kycController = require('../controllers/kycController');

// Protected — requires JWT
router.post('/token', protect, kycController.getToken);
router.get('/status', protect, kycController.getStatus);

// Public — verified by HMAC digest (no JWT)
router.post('/webhook', kycController.handleWebhook);

module.exports = router;
