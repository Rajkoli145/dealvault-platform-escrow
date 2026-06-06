const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { protect, restrictTo } = require('../middleware/auth');

// ── Public Routes ─────────────────────────────────────────────────────────────

// List all platform issues (public)
router.get('/', issueController.getIssues);

// Get a single issue with applications (public)
router.get('/:repoOwner/:repoName/:issueNumber', issueController.getIssue);

// ── Protected Routes ──────────────────────────────────────────────────────────

// Update funding for an issue (maintainer/admin only)
router.patch(
  '/:id/funding',
  protect,
  restrictTo('admin', 'maintainer'),
  issueController.updateFunding
);

module.exports = router;
