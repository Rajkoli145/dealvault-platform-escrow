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
