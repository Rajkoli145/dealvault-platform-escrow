const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;
let buyerToken;
let sellerToken;
let buyerId;
let sellerId;

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});

  // Create buyer
  const buyerRes = await request(app).post('/api/auth/register').send({
    name: 'Buyer User',
    email: 'buyer@test.com',
    password: 'Secure@1234',
    role: 'buyer',
  });
  buyerToken = buyerRes.body.token;
  buyerId = buyerRes.body.data.user._id;

  // Create seller
  const sellerRes = await request(app).post('/api/auth/register').send({
    name: 'Seller User',
    email: 'seller@test.com',
    password: 'Secure@1234',
    role: 'seller',
  });
  sellerToken = sellerRes.body.token;
  sellerId = sellerRes.body.data.user._id;
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('should register a new user and return a JWT', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: `unique.${Date.now()}@test.com`,
      password: 'Secure@1234',
      role: 'buyer',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should reject registration with missing name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'noname@test.com',
      password: 'Secure@1234',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Pass',
      email: 'weak@test.com',
      password: 'password',  // no uppercase or number
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate',
      email: 'buyer@test.com',  // already registered in beforeEach
      password: 'Secure@1234',
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('should login successfully and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'Secure@1234',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'WrongPassword1',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'Secure@1234',
    });

    expect(res.statusCode).toBe(401);
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('buyer@test.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  it('should reject requests with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.statusCode).toBe(401);
  });
});

// ─── POST /api/auth/wallet ────────────────────────────────────────────────────

describe('POST /api/auth/wallet', () => {
  it('should link a valid Stellar wallet address', async () => {
    const validAddress = 'GA5W247FEJSIBI2LNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7';
    const res = await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ walletAddress: validAddress });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.walletAddress).toBe(validAddress.toLowerCase());
  });

  it('should reject invalid Stellar wallet address format', async () => {
    const res = await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ walletAddress: 'GA5W247F_INVALID_FORMAT' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should reject linking a wallet address already in use by another user', async () => {
    const sharedAddress = 'GB2SIBIDLNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7XXXXXXX';

    // Link buyer
    await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ walletAddress: sharedAddress });

    // Attempt to link seller to the same wallet address
    const res = await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ walletAddress: sharedAddress });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already linked');
  });
});

// ─── PATCH /api/auth/role ─────────────────────────────────────────────────────

describe('PATCH /api/auth/role', () => {
  it('should update the user role to contributor or maintainer', async () => {
    const res = await request(app)
      .patch('/api/auth/role')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ role: 'contributor' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('contributor');
  });

  it('should reject invalid role selection', async () => {
    const res = await request(app)
      .patch('/api/auth/role')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ role: 'invalid_role' });

    expect(res.statusCode).toBe(400);
  });
});

// ─── PATCH /api/auth/profile ──────────────────────────────────────────────────

describe('PATCH /api/auth/profile', () => {
  it('should update user profile links and bio', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        linkedinUrl: 'https://linkedin.com/in/test',
        twitterUrl: 'https://twitter.com/test',
        portfolioUrl: 'https://test.com',
        bio: 'This is my bio.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.bio).toBe('This is my bio.');
    expect(res.body.data.user.linkedinUrl).toBe('https://linkedin.com/in/test');
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('should logout and clear jwt cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── PATCH /api/auth/change-password ──────────────────────────────────────────

describe('PATCH /api/auth/change-password', () => {
  it('should change password successfully', async () => {
    const res = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ currentPassword: 'Secure@1234', newPassword: 'NewSecure@1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject incorrect current password', async () => {
    const res = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ currentPassword: 'WrongPassword', newPassword: 'NewSecure@1234' });

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/login - Suspended User', () => {
  it('should reject login for a suspended account', async () => {
    const email = 'suspended@test.com';
    await User.create({ name: 'Suspended User', email, password: 'Secure@1234', role: 'buyer', accountStatus: 'suspended' });

    const res = await request(app).post('/api/auth/login').send({
      email, password: 'Secure@1234',
    });
    expect(res.statusCode).toBe(403);
  });
});
