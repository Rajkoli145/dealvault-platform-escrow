const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Deal = require('../models/Deal');

let mongoServer;
let buyerToken, sellerToken, adminToken;
let buyerId, sellerId;

const futureDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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
  await Deal.deleteMany({});
  await User.deleteMany({});

  const buyerRes = await request(app).post('/api/auth/register').send({
    name: 'Buyer User', email: 'buyer@test.com', password: 'Secure@1234', role: 'buyer',
  });
  buyerToken = buyerRes.body.token;
  buyerId = buyerRes.body.data.user._id;

  const sellerRes = await request(app).post('/api/auth/register').send({
    name: 'Seller User', email: 'seller@test.com', password: 'Secure@1234', role: 'seller',
  });
  sellerToken = sellerRes.body.token;
  sellerId = sellerRes.body.data.user._id;
});

// ─── POST /api/deals ──────────────────────────────────────────────────────────

describe('POST /api/deals', () => {
  it('should create a deal with valid data', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Logo Design Project',
        description: 'Design a professional logo for our startup company.',
        amount: 10000,
        currency: 'INR',
        sellerId,
        deadline: futureDate(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deal.title).toBe('Logo Design Project');
    expect(res.body.data.deal.status).toBe('CREATED');
    expect(res.body.data.deal.currency).toBe('INR');
  });

  it('should reject deal with title too short', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Logo',  // < 5 chars
        description: 'Design a professional logo for our startup company.',
        amount: 10000,
        sellerId,
        deadline: futureDate(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('should reject deal with negative amount', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Valid Title',
        description: 'Design a professional logo for our startup company.',
        amount: -500,
        sellerId,
        deadline: futureDate(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'amount')).toBe(true);
  });

  it('should reject deal with past deadline', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Valid Title',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId,
        deadline: '2020-01-01T00:00:00.000Z',  // past date
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'deadline')).toBe(true);
  });

  it('should reject deal without authentication', async () => {
    const res = await request(app)
      .post('/api/deals')
      .send({ title: 'Test', description: 'Test deal description here', amount: 1000, sellerId, deadline: futureDate() });

    expect(res.statusCode).toBe(401);
  });

  it('should reject deal where buyer == seller', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Self Deal Attempt',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId: buyerId,   // same as buyer
        deadline: futureDate(),
      });

    expect(res.statusCode).toBe(400);
  });
});

// ─── GET /api/deals ───────────────────────────────────────────────────────────

describe('GET /api/deals', () => {
  let dealId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Existing Deal Title',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId,
        deadline: futureDate(),
      });
    dealId = res.body.data.deal._id;
  });

  it('should return paginated deals for buyer', async () => {
    const res = await request(app)
      .get('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deals).toHaveLength(1);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('should return deals for seller', async () => {
    const res = await request(app)
      .get('/api/deals')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deals).toHaveLength(1);
  });

  it('should support pagination query params', async () => {
    const res = await request(app)
      .get('/api/deals?page=1&limit=5')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.pagination.limit).toBe(5);
  });
});

// ─── PATCH /api/deals/:id/status ─────────────────────────────────────────────

describe('PATCH /api/deals/:id/status', () => {
  let dealId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Status Test Deal',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId,
        deadline: futureDate(),
      });
    dealId = res.body.data.deal._id;
  });

  it('seller should be able to accept a CREATED deal', async () => {
    const res = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'ACCEPTED' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deal.status).toBe('ACCEPTED');
  });

  it('buyer should NOT be able to accept their own deal', async () => {
    const res = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'ACCEPTED' });

    expect(res.statusCode).toBe(403);
  });

  it('should reject invalid status transition', async () => {
    const res = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'RELEASED' });  // Cannot jump from CREATED to RELEASED

    expect(res.statusCode).toBe(400);
  });

  it('should reject invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'BOGUS_STATUS' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});
