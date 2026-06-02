const express = require('express');
const router = express.Router();
const multer = require('multer');

const dealController = require('../controllers/dealController');
const { protect, restrictTo } = require('../middleware/auth');
const {
  validateCreateDeal,
  validateUpdateDealStatus,
  validateDealId,
  validateListDeals,
} = require('../validators');

// File upload config (disk storage; swap for S3 in production)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// ─── All deal routes require authentication ────────────────────────────────────
router.use(protect);

// ─── Deal CRUD ─────────────────────────────────────────────────────────────────
router.post('/', ...validateCreateDeal, dealController.createDeal);
router.get('/', ...validateListDeals, dealController.getDeals);
router.get('/:id', ...validateDealId, dealController.getDeal);

// ─── Deal Status Transitions ───────────────────────────────────────────────────
router.patch('/:id/status', ...validateUpdateDealStatus, dealController.updateDealStatus);

// ─── Delivery & Dispute ────────────────────────────────────────────────────────
router.post('/:id/deliver', ...validateDealId, upload.array('files', 5), dealController.submitDelivery);
router.post('/:id/dispute', ...validateDealId, dealController.raiseDispute);

module.exports = router;
