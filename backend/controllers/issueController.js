/**
 * Issue Controller
 *
 * Public-facing endpoints for listing issues registered on the DealVault platform.
 * Also includes maintainer endpoints for managing issue funding.
 */

const Issue = require('../models/Issue');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/issues
 * List all issues on the DealVault platform (public).
 */
exports.getIssues = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.repo) filter.githubRepoFullName = req.query.repo;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Issue.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        issues,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/issues/:repoOwner/:repoName/:issueNumber
 * Get a single issue with its applications (public).
 */
exports.getIssue = async (req, res, next) => {
  try {
    const { repoOwner, repoName, issueNumber } = req.params;
    const repoFullName = `${repoOwner}/${repoName}`;

    const issue = await Issue.findOne({
      githubRepoFullName: repoFullName,
      githubIssueNumber: Number(issueNumber),
    }).lean().exec();

    if (!issue) {
      return next(new AppError('Issue not found on the DealVault platform.', 404));
    }

    // Fetch applications for this issue
    const applications = await Application.find({
      githubRepoFullName: repoFullName,
      githubIssueNumber: Number(issueNumber),
    })
      .select('applicantGithubUsername applicationLetter status createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: {
        issue,
        applications,
        applicationCount: applications.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/issues/:id/funding
 * Update the funding amount for an issue. Maintainer/admin only.
 */
exports.updateFunding = async (req, res, next) => {
  try {
    const { funding, fundingCurrency } = req.body;

    if (funding === undefined || funding === null) {
      return next(new AppError('Funding amount is required.', 400));
    }

    if (typeof funding !== 'number' || funding < 0) {
      return next(new AppError('Funding must be a non-negative number.', 400));
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return next(new AppError('Issue not found.', 404));
    }

    // SECURITY: Only the maintainer who registered the issue (addedBy) or an admin may
    // change its funding — previously any "maintainer" could rewrite any repo's bounty.
    if (req.user.role !== 'admin' && (!req.user.githubUsername || issue.addedBy !== req.user.githubUsername)) {
      return next(new AppError('You are not authorized to change funding for this issue.', 403));
    }

    // SECURITY: Funding may only change while the issue is OPEN. Once it is assigned (or
    // completed/closed) the bounty is effectively committed — allowing edits enables a
    // bait-and-switch (advertise $500, get a contributor assigned, then drop it to $0).
    if (issue.status !== 'open') {
      return next(new AppError(`Funding can only be changed while the issue is open (current: ${issue.status}).`, 400));
    }

    issue.funding = funding;
    if (fundingCurrency) issue.fundingCurrency = fundingCurrency;
    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Funding updated successfully.',
      data: { issue },
    });
  } catch (err) {
    next(err);
  }
};
