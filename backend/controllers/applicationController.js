/**
 * Application Controller
 *
 * Handles contributor applications to work on GitHub issues.
 * Includes submission, listing, confirmation, and rejection flows.
 */

const Application = require('../models/Application');
const Issue = require('../models/Issue');
const AppError = require('../utils/AppError');
const { postIssueComment, assignIssue } = require('../services/githubBot');
const {
  applicationReceivedMessage,
  applicationConfirmedMessage,
  applicationRejectedMessage,
} = require('../services/botMessages');

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/applications
 * Submit an application to work on an issue.
 * Requires authentication.
 */
exports.submitApplication = async (req, res, next) => {
  try {
    const { githubIssueNumber, githubRepoFullName, applicationLetter } = req.body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!githubIssueNumber || !githubRepoFullName || !applicationLetter) {
      return next(
        new AppError('githubIssueNumber, githubRepoFullName, and applicationLetter are required.', 400)
      );
    }

    // ── Check the issue exists on the platform ────────────────────────────
    const issue = await Issue.findOne({
      githubRepoFullName,
      githubIssueNumber,
    });

    if (!issue) {
      return next(
        new AppError('This issue is not registered on the DealVault platform.', 404)
      );
    }

    if (issue.status !== 'open') {
      return next(
        new AppError(`This issue is already ${issue.status} and not accepting applications.`, 400)
      );
    }

    // ── Get applicant's GitHub username ────────────────────────────────────
    const applicantGithubUsername = req.user.githubUsername || req.user.name;
    if (!applicantGithubUsername) {
      return next(
        new AppError('Your profile must have a GitHub username linked to apply.', 400)
      );
    }

    // ── Check for duplicate applications ──────────────────────────────────
    const existingApp = await Application.findOne({
      githubRepoFullName,
      githubIssueNumber,
      applicantGithubUsername,
    });

    if (existingApp) {
      return next(
        new AppError('You have already applied for this issue.', 409)
      );
    }

    // ── Create the application ────────────────────────────────────────────
    const application = await Application.create({
      githubIssueNumber,
      githubIssueUrl: issue.githubIssueUrl,
      githubRepoFullName,
      applicantGithubUsername,
      applicantGithubId: req.user.githubId || null,
      applicantUserId: req.user._id,
      applicationLetter,
      status: 'pending',
      issue: issue._id,
    });

    // ── Post the application comment on GitHub ────────────────────────────
    try {
      const comment = applicationReceivedMessage({
        applicantUsername: applicantGithubUsername,
        applicationLetter,
        issueNumber: githubIssueNumber,
        repoFullName: githubRepoFullName,
      });

      await postIssueComment(githubRepoFullName, githubIssueNumber, comment);
      console.log(`💬 Application comment posted for @${applicantGithubUsername} on ${githubRepoFullName}#${githubIssueNumber}`);
    } catch (githubErr) {
      // Don't fail the application if the GitHub comment fails
      console.error('⚠️  Failed to post application comment on GitHub:', githubErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: { application },
    });
  } catch (err) {
    // Handle duplicate key error from MongoDB
    if (err.code === 11000) {
      return next(new AppError('You have already applied for this issue.', 409));
    }
    next(err);
  }
};

/**
 * GET /api/applications
 * List applications. Maintainers/admins see all; contributors see their own.
 */
exports.getApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Non-admin/maintainer users can only see their own applications
    if (!['admin', 'maintainer'].includes(req.user.role)) {
      filter.applicantUserId = req.user._id;
    }

    // Optional filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.issueNumber) filter.githubIssueNumber = Number(req.query.issueNumber);
    if (req.query.repo) filter.githubRepoFullName = req.query.repo;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('issue', 'title funding fundingCurrency status')
        .populate('applicantUserId', 'name email githubUsername')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
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
 * GET /api/applications/:id
 * Get a single application by ID.
 */
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('issue', 'title funding fundingCurrency status githubIssueUrl')
      .populate('applicantUserId', 'name email githubUsername avatar')
      .populate('confirmedBy', 'name email')
      .lean()
      .exec();

    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    // Non-admin/maintainer can only view their own
    if (
      !['admin', 'maintainer'].includes(req.user.role) &&
      String(application.applicantUserId?._id) !== String(req.user._id)
    ) {
      return next(new AppError('You are not authorized to view this application.', 403));
    }

    res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/applications/:id/confirm
 * Confirm/accept an application. Maintainer/admin only.
 */
exports.confirmApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    if (application.status !== 'pending') {
      return next(
        new AppError(`Application is already ${application.status}.`, 400)
      );
    }

    // ── Update application ────────────────────────────────────────────────
    application.status = 'confirmed';
    application.confirmedBy = req.user._id;
    application.confirmedAt = new Date();
    await application.save();

    // ── Update the issue status and assignment ────────────────────────────
    await Issue.findByIdAndUpdate(application.issue, {
      status: 'assigned',
      assignedTo: application.applicantGithubUsername,
    });

    // ── Reject all other pending applications for this issue ──────────────
    await Application.updateMany(
      {
        _id: { $ne: application._id },
        githubRepoFullName: application.githubRepoFullName,
        githubIssueNumber: application.githubIssueNumber,
        status: 'pending',
      },
      {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: 'Another applicant was selected for this issue.',
      }
    );

    // ── Post congratulations comment on GitHub ────────────────────────────
    try {
      const comment = applicationConfirmedMessage({
        applicantUsername: application.applicantGithubUsername,
        issueNumber: application.githubIssueNumber,
        repoFullName: application.githubRepoFullName,
        issueUrl: application.githubIssueUrl,
      });

      await postIssueComment(
        application.githubRepoFullName,
        application.githubIssueNumber,
        comment
      );

      // Assign the contributor on GitHub
      await assignIssue(
        application.githubRepoFullName,
        application.githubIssueNumber,
        application.applicantGithubUsername
      );

      console.log(
        `🎉 @${application.applicantGithubUsername} confirmed and assigned to ${application.githubRepoFullName}#${application.githubIssueNumber}`
      );
    } catch (githubErr) {
      console.error('⚠️  Failed to post confirmation on GitHub:', githubErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Application confirmed. Contributor has been assigned.',
      data: { application },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/applications/:id/reject
 * Reject an application. Maintainer/admin only.
 */
exports.rejectApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    if (application.status !== 'pending') {
      return next(
        new AppError(`Application is already ${application.status}.`, 400)
      );
    }

    const { reason } = req.body || {};

    application.status = 'rejected';
    application.rejectedAt = new Date();
    application.rejectionReason = reason || null;
    await application.save();

    // ── Post rejection comment on GitHub (optional, only if reason given) ──
    try {
      const comment = applicationRejectedMessage({
        applicantUsername: application.applicantGithubUsername,
        reason: reason || null,
      });

      await postIssueComment(
        application.githubRepoFullName,
        application.githubIssueNumber,
        comment
      );
    } catch (githubErr) {
      console.error('⚠️  Failed to post rejection on GitHub:', githubErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Application rejected.',
      data: { application },
    });
  } catch (err) {
    next(err);
  }
};
