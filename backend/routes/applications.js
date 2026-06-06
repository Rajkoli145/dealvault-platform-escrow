const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');

// ── Application Routes ────────────────────────────────────────────────────────

// Submit a new application (authenticated contributors)
router.post('/', protect, applicationController.submitApplication);

// List applications (authenticated — role-based filtering in controller)
router.get('/', protect, applicationController.getApplications);

// Get a single application
router.get('/:id', protect, applicationController.getApplication);

// Confirm an application (maintainer/admin only)
router.patch(
  '/:id/confirm',
  protect,
  restrictTo('admin', 'maintainer'),
  applicationController.confirmApplication
);

// Reject an application (maintainer/admin only)
router.patch(
  '/:id/reject',
  protect,
  restrictTo('admin', 'maintainer'),
  applicationController.rejectApplication
);

module.exports = router;
