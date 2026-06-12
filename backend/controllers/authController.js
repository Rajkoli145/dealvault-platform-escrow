const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const AppError = require('../utils/AppError');

// ─── Token Helper ─────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'strict',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: user.toSafeObject(),
    },
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
    });

    // Mark account as active (skip email verification flow for now)
    user.accountStatus = 'active';
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('CAUGHT IN REGISTER:', err);
    res.status(500).json({ error: err.message, stack: err.stack, typeofNext: typeof next });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field (excluded by default)
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check account status
    if (user.accountStatus === 'suspended' || user.accountStatus === 'deactivated') {
      return next(new AppError('Your account has been suspended. Please contact support.', 403));
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/role
 */
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['maintainer', 'contributor'].includes(role)) {
      return next(new AppError('Invalid role selection.', 400));
    }
    const user = await User.findById(req.user._id);
    user.role = role;
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      data: { user: user.toSafeObject() }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { linkedinUrl, twitterUrl, portfolioUrl, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found.', 404));

    if (linkedinUrl  !== undefined) user.linkedinUrl  = linkedinUrl;
    if (twitterUrl   !== undefined) user.twitterUrl   = twitterUrl;
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
    if (bio          !== undefined) user.bio          = bio;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: { user: user.toSafeObject() }
    });
  } catch (err) {
    next(err);
  }
};

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

/**
 * GET /api/auth/github
 * Redirects the browser to GitHub's OAuth authorization page.
 */
exports.githubRedirect = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

/**
 * GET /api/auth/github/callback
 * GitHub redirects here with ?code=. Exchange → fetch profile → upsert user → issue JWT.
 */
exports.githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return next(new AppError('GitHub OAuth code missing.', 400));

    // 1) Exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:  process.env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token, error } = tokenRes.data;
    if (error || !access_token) {
      return next(new AppError('Failed to obtain GitHub access token.', 502));
    }

    // 2) Fetch GitHub user profile
    const [profileRes, emailsRes] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'DealVault' },
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'DealVault' },
      }),
    ]);

    const githubProfile = profileRes.data;
    const emails       = emailsRes.data;

    // Pick primary verified email, fall back to profile email
    const primaryEmail =
      (emails.find((e) => e.primary && e.verified) ||
       emails.find((e) => e.primary) ||
       emails[0])?.email ||
      githubProfile.email;

    if (!primaryEmail) {
      return next(new AppError('Could not retrieve a verified email from GitHub. Please make sure your GitHub account has a public or verified email.', 400));
    }

    // 3) Upsert user (find by githubId first, then email)
    let user = await User.findByGithubId(String(githubProfile.id));

    if (!user) {
      // Check if an email-based account already exists — link it
      user = await User.findOne({ email: primaryEmail.toLowerCase().trim() });
    }

    if (user) {
      // Existing user — update GitHub fields
      user.githubId       = String(githubProfile.id);
      user.githubUsername = githubProfile.login;
      user.githubAvatar   = githubProfile.avatar_url;
      if (!user.avatar) user.avatar = githubProfile.avatar_url;
      user.lastLoginAt    = new Date();
      user.accountStatus  = 'active';
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      // New user — create from GitHub profile
      user = await User.create({
        name:           githubProfile.name || githubProfile.login,
        email:          primaryEmail.toLowerCase().trim(),
        githubId:       String(githubProfile.id),
        githubUsername: githubProfile.login,
        githubAvatar:   githubProfile.avatar_url,
        avatar:         githubProfile.avatar_url,
        bio:            githubProfile.bio || null,
        role:           'buyer',
        accountStatus:  'active',
        isEmailVerified: true,
        lastLoginAt:    new Date(),
      });
    }

    // 4) Sign JWT and redirect back to frontend
    const token = signToken(user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('GitHub OAuth Error:', err);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/?auth=error&msg=${encodeURIComponent('Database connection failed. Please try again.')}`);
  }
};

// ─── Discord OAuth ────────────────────────────────────────────────────────────

/**
 * GET /api/auth/discord
 * Redirects the browser to Discord's OAuth authorization page.
 * We expect the frontend to pass `?token=...` so we can link the Discord account
 * to the currently logged in user.
 */
exports.discordRedirect = (req, res) => {
  const { token } = req.query;
  
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_CALLBACK_URL,
    response_type: 'code',
    scope: 'identify',
    state: token || '', // Pass the JWT token in the state param to persist it across redirect
  });
  
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
};

/**
 * GET /api/auth/discord/callback
 * Discord redirects here with ?code= and ?state= (which contains our JWT token).
 */
exports.discordCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) return next(new AppError('Discord OAuth code missing.', 400));
    
    // We need the token to know which user is linking their Discord account
    const token = state;
    if (!token) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?error=NoAuthToken`);
    }

    // Verify token to get the user ID
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?error=InvalidToken`);
    }

    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?error=UserNotFound`);
    }

    // 1) Exchange code for access token
    const data = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_CALLBACK_URL
    });

    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      data.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;
    if (!access_token) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?error=DiscordTokenFailed`);
    }

    // 2) Fetch Discord user profile
    const profileRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const discordProfile = profileRes.data;

    // 3) Update the user with their Discord info
    user.discordId = discordProfile.id;
    user.discordUsername = discordProfile.username;
    await user.save({ validateBeforeSave: false });

    // 4) Redirect back to profile page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/profile?discordLinked=true`);
  } catch (err) {
    console.error('Discord OAuth Error:', err.response?.data || err.message);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/profile?error=DiscordLinkingFailed`);
  }
};

/**
 * POST /api/auth/discord/unlink
 */
exports.unlinkDiscord = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found.', 404));

    user.discordId = undefined;
    user.discordUsername = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: { user: user.toSafeObject() }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * POST /api/auth/wallet
 */
exports.linkWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (!walletAddress || walletAddress.trim() === '') {
      user.walletAddress = undefined;
    } else {
      user.walletAddress = walletAddress.toLowerCase().trim();
    }
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('This wallet address is already linked to another account.', 400));
    }
    next(err);
  }
};
