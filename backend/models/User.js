const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES = ['buyer', 'seller', 'admin', 'escrow_agent', 'maintainer', 'contributor'];
const ACCOUNT_STATUS = ['active', 'suspended', 'pending_verification', 'deactivated'];
const KYC_STATUS = ['not_submitted', 'pending', 'approved', 'rejected'];

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const addressSchema = new mongoose.Schema(
  {
    street:  { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    zipCode: { type: String, trim: true },
  },
  { _id: false }
);

const kycSchema = new mongoose.Schema(
  {
    status:       { type: String, enum: KYC_STATUS, default: 'not_submitted' },
    documentType: { type: String, trim: true },      // e.g. 'aadhaar', 'passport'
    idType:       { type: String, trim: true },      // checklist field
    idNumber:     { type: String, trim: true },      // checklist field
    documentUrl:  { type: String, trim: true },      // stored file path / cloud URL
    submittedAt:  { type: Date },
    reviewedAt:   { type: Date },
    verifiedAt:   { type: Date },                    // checklist field
    reviewNote:   { type: String, trim: true },
  },
  { _id: false }
);

// ─── User Schema ──────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
      default: null,
    },

    // ── Auth ──────────────────────────────────────────────────────────────────
    password: {
      type: String,
      // Not required for GitHub OAuth users
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,   // never returned in queries by default
    },

    // ── GitHub OAuth ──────────────────────────────────────────────────────────
    githubId: {
      type: String,
      unique: true,
      sparse: true,   // allows multiple null values
      select: false,
    },

    githubUsername: {
      type: String,
      trim: true,
      default: null,
    },

    githubAvatar: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      accountHolder: String,
      verified: { type: Boolean, default: false }
    },

    reputationScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    avatar: {
      type: String,
      trim: true,
      default: null,   // URL or relative path to uploaded image
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: null,
    },

    twitterUrl: {
      type: String,
      trim: true,
      default: null,
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: addressSchema,
      default: () => ({}),
    },

    // ── Role & Status ─────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: `Role must be one of: ${ROLES.join(', ')}`,
      },
      default: 'buyer',
    },

    accountStatus: {
      type: String,
      enum: {
        values: ACCOUNT_STATUS,
        message: `Account status must be one of: ${ACCOUNT_STATUS.join(', ')}`,
      },
      default: 'pending_verification',
    },

    // ── Verification ──────────────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null,
    },

    // ── Password Reset ────────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // ── KYC ───────────────────────────────────────────────────────────────────
    kyc: {
      type: kycSchema,
      default: () => ({}),
    },

    // ── Activity ──────────────────────────────────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },

    dealsAsbuyer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
      },
    ],

    dealsAsSeller: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
      },
    ],
  },
  {
    timestamps: true,               // adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ walletAddress: 1 });
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ 'kyc.status': 1 });
userSchema.index({ createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

userSchema.virtual('isKycVerified').get(function () {
  return this.kyc?.status === 'approved';
});

userSchema.virtual('displayName').get(function () {
  return this.name || this.email;
});

// ─── Pre-save Hooks ───────────────────────────────────────────────────────────

/** Hash password before saving if it was modified */
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Track when password was changed (skip on first save)
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // -1s buffer for JWT iat
  }
});

/** Normalise email to lowercase before saving */
userSchema.pre('save', function () {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain-text password with the hashed password stored on the document.
 * @param {string} candidatePassword  – plain-text password supplied by the user
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Returns true if the user changed their password AFTER the given JWT iat timestamp.
 * @param {number} jwtIssuedAt – Unix timestamp (seconds)
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTs = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedTs > jwtIssuedAt;
  }
  return false;
};

/**
 * Sanitise the user object before sending over the wire.
 * Removes sensitive fields.
 * @returns {object}
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// ─── Static Methods ───────────────────────────────────────────────────────────

/**
 * Find a user by email and include the password field (useful for auth).
 * @param {string} email
 * @returns {Promise<Document|null>}
 */
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

/**
 * Find a user by their GitHub ID.
 * @param {string} githubId
 * @returns {Promise<Document|null>}
 */
userSchema.statics.findByGithubId = function (githubId) {
  return this.findOne({ githubId }).select('+githubId');
};

// ─── Model Export ─────────────────────────────────────────────────────────────

const User = mongoose.model('User', userSchema);

module.exports = User;
