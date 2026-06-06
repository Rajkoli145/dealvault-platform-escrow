const mongoose = require('mongoose');

const ISSUE_STATUS = ['open', 'assigned', 'completed', 'closed'];

const issueSchema = new mongoose.Schema(
  {
    // ── GitHub References ─────────────────────────────────────────────────────
    githubIssueNumber: {
      type: Number,
      required: [true, 'GitHub issue number is required'],
    },

    githubIssueUrl: {
      type: String,
      required: [true, 'GitHub issue URL is required'],
      trim: true,
    },

    githubRepoFullName: {
      type: String,
      required: [true, 'Repository full name is required'],
      trim: true,
      // e.g. "DealVaultHQ/dealvault-platform-escrow"
    },

    // ── Issue Content ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },

    body: {
      type: String,
      trim: true,
      default: '',
    },

    labels: {
      type: [String],
      default: [],
    },

    // ── Platform Metadata ─────────────────────────────────────────────────────
    addedBy: {
      type: String,
      trim: true,
      // GitHub username of the maintainer who labeled it
    },

    status: {
      type: String,
      enum: {
        values: ISSUE_STATUS,
        message: `Status must be one of: ${ISSUE_STATUS.join(', ')}`,
      },
      default: 'open',
    },

    assignedTo: {
      type: String,
      trim: true,
      default: null,
      // GitHub username of the assigned contributor
    },

    // ── Funding ───────────────────────────────────────────────────────────────
    funding: {
      type: Number,
      default: 0,
      min: [0, 'Funding must be non-negative'],
      // Dollar amount set by maintainer
    },

    fundingCurrency: {
      type: String,
      enum: ['USD', 'INR', 'USDC'],
      default: 'USD',
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Unique constraint: one issue per repo
issueSchema.index({ githubRepoFullName: 1, githubIssueNumber: 1 }, { unique: true });
issueSchema.index({ status: 1 });
issueSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Issue', issueSchema);
