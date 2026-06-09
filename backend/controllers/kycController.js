const User = require('../models/User');
const { createAccessToken, verifyWebhookDigest } = require('../utils/sumsub');
const AppError = require('../utils/AppError');

const TOKEN_TTL_SECONDS = 600; // 10 minutes — matches token creation

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mapSumsubStatus(reviewStatus) {
  switch (reviewStatus) {
    case 'completed':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

// ─── Handlers ──────────────────────────────────────────────────────────────────

/**
 * POST /api/kyc/token
 * Returns a Sumsub SDK access token for the authenticated user.
 * On first call, sets kyc.status = 'pending' and kyc.submittedAt.
 */
exports.getToken = async (req, res, next) => {
  try {
    const { levelName } = req.body || {};
    const targetLevel = levelName || process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level';
    const userId = req.user._id.toString();

    const token = await createAccessToken(userId, targetLevel, userId);

    await User.findByIdAndUpdate(userId, {
      $set: {
        'kyc.status': 'pending',
        'kyc.sumsubApplicantId': userId,
        'kyc.submittedAt': new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      token,
      expiresIn: TOKEN_TTL_SECONDS,
    });
  } catch (err) {
    console.error('KYC token error:', err.message);
    return next(new AppError('Failed to initialise verification session.', 500));
  }
};

/**
 * GET /api/kyc/status
 * Returns the current KYC status for the authenticated user.
 */
exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('kyc');
    if (!user) return next(new AppError('User not found.', 404));

    return res.status(200).json({
      success: true,
      data: {
        status: user.kyc?.status || 'not_submitted',
        submittedAt: user.kyc?.submittedAt || null,
        reviewedAt: user.kyc?.reviewedAt || null,
        verifiedAt: user.kyc?.verifiedAt || null,
        reviewNote: user.kyc?.reviewNote || null,
      },
    });
  } catch (err) {
    console.error('KYC status error:', err.message);
    return next(new AppError('Failed to fetch KYC status.', 500));
  }
};

/**
 * POST /api/kyc/webhook
 * Processes Sumsub applicantReviewed events.
 * Protected by HMAC digest; no JWT required.
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const rawBody = req.body;
    const digest = req.headers['x-sumsub-signature'] || req.headers['X-Sumsub-Signature'];

    if (!verifyWebhookDigest(rawBody, digest)) {
      console.warn('⚠️  Sumsub webhook HMAC verification failed');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf-8'));
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
    }

    const eventType = payload?.type || payload?.eventType || '';
    if (eventType !== 'applicantReviewed') {
      return res.status(200).json({ success: true, message: 'Event ignored (not applicantReviewed).' });
    }

    const applicant = payload?.applicant || {};
    const externalUserId = applicant?.externalUserId; // we stored userId here
    const reviewStatus = applicant?.reviewResult?.reviewStatus || applicant?.reviewStatus;
    const rejectLabels = applicant?.reviewResult?.rejectLabels || [];

    if (!externalUserId) {
      return res.status(200).json({ success: true, message: 'No externalUserId; skipped.' });
    }

    const newStatus = mapSumsubStatus(reviewStatus);
    const update = {
      'kyc.status': newStatus,
      'kyc.reviewedAt': new Date(),
    };

    if (newStatus === 'approved') {
      update['kyc.verifiedAt'] = new Date();
      update['kyc.reviewNote'] = '';
    } else if (newStatus === 'rejected') {
      update['kyc.reviewNote'] = Array.isArray(rejectLabels) ? rejectLabels.join(', ') : '';
    }

    await User.findByIdAndUpdate(externalUserId, { $set: update });

    console.log(`✅ Sumsub KYC updated: userId=${externalUserId}, status=${newStatus}`);

    return res.status(200).json({ success: true, message: 'Webhook processed.' });
  } catch (err) {
    console.error('❌ Sumsub webhook error:', err.message);
    return res.status(200).json({ success: true, message: 'Webhook received (with errors).' });
  }
};
