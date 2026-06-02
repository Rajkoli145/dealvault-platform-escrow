const Deal = require('../models/Deal');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildFilter = (query, userId, role) => {
  const filter = {};

  if (role === 'buyer') filter.buyerId = userId;
  else if (role === 'seller') filter.sellerId = userId;
  else {
    // admin sees all; optionally filter by participant
    if (query.userId) {
      filter.$or = [{ buyerId: query.userId }, { sellerId: query.userId }];
    }
  }

  if (query.status) filter.status = query.status;

  return filter;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/deals
 * Create a new deal (buyer only)
 */
exports.createDeal = async (req, res, next) => {
  try {
    const { title, description, amount, currency, sellerId, deadline } = req.body;

    // Ensure the buyer is not setting themselves as seller
    if (sellerId === String(req.user._id)) {
      return next(new AppError('You cannot create a deal with yourself as the seller.', 400));
    }

    // Validate seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return next(new AppError('Seller not found.', 404));
    }

    const deal = await Deal.create({
      title,
      description,
      amount,
      currency: currency || 'INR',
      buyerId: req.user._id,
      sellerId,
      deadline: new Date(deadline),
      status: 'CREATED',
    });

    // Keep track of deals on user documents
    await User.findByIdAndUpdate(req.user._id, { $push: { dealsAsbuyer: deal._id } });
    await User.findByIdAndUpdate(sellerId, { $push: { dealsAsSeller: deal._id } });

    res.status(201).json({
      success: true,
      data: { deal },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/deals
 * List deals for current user (paginated)
 */
exports.getDeals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query, req.user._id, req.user.role);

    const [deals, total] = await Promise.all([
      Deal.find(filter)
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Deal.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        deals,
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
 * GET /api/deals/:id
 * Get a single deal by ID
 */
exports.getDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyerId', 'name email walletAddress')
      .populate('sellerId', 'name email walletAddress')
      .lean()
      .exec();

    if (!deal) {
      return next(new AppError('Deal not found.', 404));
    }

    // Non-admins can only view deals they are part of
    const isParticipant =
      String(deal.buyerId._id) === String(req.user._id) ||
      String(deal.sellerId._id) === String(req.user._id);

    if (!isParticipant && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to view this deal.', 403));
    }

    res.status(200).json({
      success: true,
      data: { deal },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/deals/:id/status
 * Update deal status (with role-based rules)
 */
exports.updateDealStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return next(new AppError('Deal not found.', 404));
    }

    const userId = String(req.user._id);
    const isBuyer = String(deal.buyerId) === userId;
    const isSeller = String(deal.sellerId) === userId;
    const isAdmin = req.user.role === 'admin';

    // Role-based status transition rules
    const allowedTransitions = {
      CREATED:     { ACCEPTED: isSeller, CANCELLED: isBuyer || isAdmin },
      ACCEPTED:    { FUNDED: isBuyer, CANCELLED: isBuyer || isAdmin },
      FUNDED:      { IN_PROGRESS: isSeller },
      IN_PROGRESS: { SUBMITTED: isSeller },
      SUBMITTED:   { APPROVED: isBuyer, DISPUTED: isBuyer },
      APPROVED:    { RELEASED: isBuyer || isAdmin },
      DISPUTED:    { RELEASED: isAdmin, REFUNDED: isAdmin },
    };

    const allowed = allowedTransitions[deal.status]?.[status];

    if (allowed === undefined) {
      return next(new AppError(`Cannot transition from ${deal.status} to ${status}.`, 400));
    }

    if (!allowed) {
      return next(new AppError('You are not authorized to perform this status transition.', 403));
    }

    deal.status = status;
    await deal.save();

    res.status(200).json({
      success: true,
      data: { deal },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/deals/:id/deliver
 * Seller submits delivery files
 */
exports.submitDelivery = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) return next(new AppError('Deal not found.', 404));
    if (String(deal.sellerId) !== String(req.user._id)) {
      return next(new AppError('Only the seller can submit delivery files.', 403));
    }
    if (deal.status !== 'IN_PROGRESS') {
      return next(new AppError('Delivery can only be submitted when the deal is IN_PROGRESS.', 400));
    }

    if (!req.files || req.files.length === 0) {
      return next(new AppError('At least one file must be uploaded.', 400));
    }

    const files = req.files.map((f) => ({
      filename: f.originalname,
      url: f.path || f.location, // local path or S3 URL
      uploadedAt: new Date(),
    }));

    deal.deliveryFiles.push(...files);
    deal.status = 'SUBMITTED';
    await deal.save();

    res.status(200).json({
      success: true,
      message: 'Delivery submitted successfully.',
      data: { deal },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/deals/:id/dispute
 * Buyer raises a dispute
 */
exports.raiseDispute = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) return next(new AppError('Deal not found.', 404));
    if (String(deal.buyerId) !== String(req.user._id)) {
      return next(new AppError('Only the buyer can raise a dispute.', 403));
    }
    if (!['IN_PROGRESS', 'SUBMITTED'].includes(deal.status)) {
      return next(new AppError('Disputes can only be raised on active deals.', 400));
    }

    deal.status = 'DISPUTED';
    await deal.save();

    res.status(200).json({
      success: true,
      message: 'Dispute raised. Our team will review the case.',
      data: { deal },
    });
  } catch (err) {
    next(err);
  }
};
