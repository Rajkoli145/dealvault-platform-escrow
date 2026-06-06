const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const app = require('../server');
const User = require('../models/User');
const Deal = require('../models/Deal');

let mongoServer;
let buyerToken, sellerToken;
let buyerId, sellerId;

const futureDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough';
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  if (fs.existsSync('uploads')) {
    const files = fs.readdirSync('uploads');
    for (const file of files) {
      fs.unlinkSync(`uploads/${file}`);
    }
  }
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

  it('should reject transition to FUNDED if either buyer or seller lacks a linked wallet address', async () => {
    // 1. Seller accepts the deal first
    await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'ACCEPTED' });

    // 2. Buyer tries to transition to FUNDED (should fail because neither has linked wallets)
    const failRes = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'FUNDED' });

    expect(failRes.statusCode).toBe(400);
    expect(failRes.body.message).toContain('wallet address before this action');
  });

  it('should allow transition to FUNDED if both buyer and seller have linked wallet addresses', async () => {
    // 1. Link buyer wallet
    await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ walletAddress: 'GA5W247FEJSIBI2LNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7' });

    // 2. Link seller wallet
    await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ walletAddress: 'GB2SIBIDLNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7XXXXXXX' });

    // 3. Seller accepts the deal
    await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'ACCEPTED' });

    // 4. Buyer transitions to FUNDED (should succeed now)
    const successRes = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'FUNDED' });

    expect(successRes.statusCode).toBe(200);
    expect(successRes.body.data.deal.status).toBe('FUNDED');
  });

  it('should go through the full lifecycle of a deal (ACCEPTED -> FUNDED -> IN_PROGRESS -> SUBMITTED (deliver) -> APPROVED -> RELEASED)', async () => {
    // 1. Link buyer wallet
    await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ walletAddress: 'GA5W247FEJSIBI2LNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7' });

    // 2. Link seller wallet
    await request(app)
      .post('/api/auth/wallet')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ walletAddress: 'GB2SIBIDLNITA4DIP3ESP3BYCXU6IX4K67HK26LODH6H7G2G7XXXXXXX' });

    // 3. Seller accepts the deal
    await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'ACCEPTED' });

    // 4. Buyer transitions to FUNDED
    await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'FUNDED' });

    // 5. Seller transitions to IN_PROGRESS
    const inProgressRes = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'IN_PROGRESS' });
    expect(inProgressRes.statusCode).toBe(200);
    expect(inProgressRes.body.data.deal.status).toBe('IN_PROGRESS');

    // 6. Seller submits delivery
    const deliverRes = await request(app)
      .post(`/api/deals/${dealId}/deliver`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .attach('files', Buffer.from('delivery content'), 'deliverable.zip');
    expect(deliverRes.statusCode).toBe(200);
    expect(deliverRes.body.data.deal.status).toBe('SUBMITTED');

    // 7. Buyer approves the delivery
    const approveRes = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'APPROVED' });
    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.data.deal.status).toBe('APPROVED');

    // 8. Buyer releases funds
    const releaseRes = await request(app)
      .patch(`/api/deals/${dealId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'RELEASED' });
    expect(releaseRes.statusCode).toBe(200);
    expect(releaseRes.body.data.deal.status).toBe('RELEASED');
  });
});

// ─── GET /api/deals/:id ───────────────────────────────────────────────────────

describe('GET /api/deals/:id', () => {
  let testDealId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Single Deal Title',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId,
        deadline: futureDate(),
      });
    testDealId = res.body.data.deal._id;
  });

  it('should return the deal detail for a participant', async () => {
    const res = await request(app)
      .get(`/api/deals/${testDealId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deal._id).toBe(String(testDealId));
  });

  it('should reject retrieval if user is not a participant', async () => {
    // Create another user
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'Other User', email: 'other@test.com', password: 'Secure@1234', role: 'buyer',
    });
    const otherToken = otherUser.body.token;

    const res = await request(app)
      .get(`/api/deals/${testDealId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should return 404 if deal not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/deals/${fakeId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── POST /api/deals/:id/dispute ──────────────────────────────────────────────

describe('POST /api/deals/:id/dispute', () => {
  let testDealId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Dispute Deal Title',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId,
        deadline: futureDate(),
      });
    testDealId = res.body.data.deal._id;
  });

  it('should reject if not the buyer', async () => {
    const res = await request(app)
      .post(`/api/deals/${testDealId}/dispute`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should reject if deal is not in progress or submitted', async () => {
    const res = await request(app)
      .post(`/api/deals/${testDealId}/dispute`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(400); // Because status is CREATED
  });

  it('should allow buyer to raise dispute on active deal', async () => {
    // Link wallets
    await User.findByIdAndUpdate(buyerId, { walletAddress: 'ga5w247fejsibi2lnita4dip3esp3bycxu6ix4k67hk26lodh6h7g2g7' });
    await User.findByIdAndUpdate(sellerId, { walletAddress: 'gb2sibidlnita4dip3esp3bycxu6ix4k67hk26lodh6h7g2g7xxxxxxx' });

    // Progress to IN_PROGRESS
    await request(app).patch(`/api/deals/${testDealId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'ACCEPTED' });
    await request(app).patch(`/api/deals/${testDealId}/status`).set('Authorization', `Bearer ${buyerToken}`).send({ status: 'FUNDED' });
    await request(app).patch(`/api/deals/${testDealId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'IN_PROGRESS' });

    const res = await request(app)
      .post(`/api/deals/${testDealId}/dispute`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deal.status).toBe('DISPUTED');
  });
});

// ─── POST /api/deals/:id/deliver ──────────────────────────────────────────────

describe('POST /api/deals/:id/deliver', () => {
  let testDealId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Delivery Deal Title',
        description: 'Design a professional logo for our startup company.',
        amount: 5000,
        sellerId,
        deadline: futureDate(),
      });
    testDealId = res.body.data.deal._id;
  });

  it('should reject delivery if not the seller', async () => {
    const res = await request(app)
      .post(`/api/deals/${testDealId}/deliver`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should reject delivery if status is not IN_PROGRESS', async () => {
    const res = await request(app)
      .post(`/api/deals/${testDealId}/deliver`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .attach('files', Buffer.from('hello'), 'test.zip');

    expect(res.statusCode).toBe(400);
  });

  it('should reject delivery if no files are uploaded', async () => {
    // Link wallets and progress to IN_PROGRESS
    await User.findByIdAndUpdate(buyerId, { walletAddress: 'ga5w247fejsibi2lnita4dip3esp3bycxu6ix4k67hk26lodh6h7g2g7' });
    await User.findByIdAndUpdate(sellerId, { walletAddress: 'gb2sibidlnita4dip3esp3bycxu6ix4k67hk26lodh6h7g2g7xxxxxxx' });
    await request(app).patch(`/api/deals/${testDealId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'ACCEPTED' });
    await request(app).patch(`/api/deals/${testDealId}/status`).set('Authorization', `Bearer ${buyerToken}`).send({ status: 'FUNDED' });
    await request(app).patch(`/api/deals/${testDealId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'IN_PROGRESS' });

    const res = await request(app)
      .post(`/api/deals/${testDealId}/deliver`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.statusCode).toBe(400);
  });
});
