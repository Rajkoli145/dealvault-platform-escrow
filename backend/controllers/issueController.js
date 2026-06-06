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

    const updateData = { funding };
    if (fundingCurrency) updateData.fundingCurrency = fundingCurrency;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!issue) {
      return next(new AppError('Issue not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Funding updated successfully.',
      data: { issue },
    });
  } catch (err) {
    next(err);
  }
};
