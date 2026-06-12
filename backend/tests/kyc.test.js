/**
 * KYC Controller Tests
 *
 * Tests for the Sumsub-backed KYC flow: SDK token issuance,
 * status reads, and the HMAC-verified review webhook.
 */

const request = require('supertest');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

// ── Mock axios (Sumsub API calls) BEFORE requiring the app ────────────────────
jest.mock('axios', () => ({
  post: jest.fn(),
}));

const axios = require('axios');
const app = require('../server');
const User = require('../models/User');

// ── Test Setup ────────────────────────────────────────────────────────────────

let mongoServer;
let user, token;

const SUMSUB_WEBHOOK_SECRET = 'test_sumsub_webhook_secret';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough';
  process.env.SUMSUB_SECRET_KEY = 'test_sumsub_secret_key';
  process.env.SUMSUB_APP_TOKEN = 'test_sumsub_app_token';
  process.env.SUMSUB_WEBHOOK_SECRET = SUMSUB_WEBHOOK_SECRET;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});

  user = await User.create({
    name: 'KycTestUser',
    email: 'kyc@test.com',
    password: 'password123',
    role: 'contributor',
    accountStatus: 'active',
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  jest.clearAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function signWebhookBody(body) {
  return (
    'sha256=' +
    crypto.createHmac('sha256', SUMSUB_WEBHOOK_SECRET).update(body).digest('hex')
  );
}

function reviewedPayload({
  externalUserId,
  reviewStatus = 'completed',
  rejectLabels,
  type = 'applicantReviewed',
} = {}) {
  const applicant = { externalUserId };
  if (reviewStatus !== undefined) {
    applicant.reviewResult = { reviewStatus };
    if (rejectLabels) applicant.reviewResult.rejectLabels = rejectLabels;
  }
  return JSON.stringify({ type, applicant });
}

// ── POST /api/kyc/token ──────────────────────────────────────────────────────

describe('POST /api/kyc/token', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/kyc/token').send({});
    expect(res.status).toBe(401);
  });

  it('returns a Sumsub token and marks KYC pending', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'sumsub-sdk-token' } });

    const res = await request(app)
      .post('/api/kyc/token')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe('sumsub-sdk-token');
    expect(res.body.expiresIn).toBe(600);

    const updated = await User.findById(user._id);
    expect(updated.kyc.status).toBe('pending');
    expect(updated.kyc.sumsubApplicantId).toBe(user._id.toString());
    expect(updated.kyc.submittedAt).toBeTruthy();
  });

  it('passes a custom levelName through to Sumsub', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'tok' } });

    const res = await request(app)
      .post('/api/kyc/token')
      .set('Authorization', `Bearer ${token}`)
      .send({ levelName: 'enhanced-kyc-level' });

    expect(res.status).toBe(200);
    const sentBody = axios.post.mock.calls[0][1];
    expect(sentBody).toContain('enhanced-kyc-level');
  });

  it('returns 500 when Sumsub token creation fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('sumsub down'));

    const res = await request(app)
      .post('/api/kyc/token')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ── GET /api/kyc/status ──────────────────────────────────────────────────────

describe('GET /api/kyc/status', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/kyc/status');
    expect(res.status).toBe(401);
  });

  it('defaults to not_submitted for a fresh user', async () => {
    const res = await request(app)
      .get('/api/kyc/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('not_submitted');
    expect(res.body.data.submittedAt).toBeNull();
    expect(res.body.data.reviewNote).toBeNull();
  });

  it('returns stored KYC fields', async () => {
    const now = new Date();
    await User.findByIdAndUpdate(user._id, {
      $set: {
        'kyc.status': 'rejected',
        'kyc.submittedAt': now,
        'kyc.reviewedAt': now,
        'kyc.reviewNote': 'BLURRY_DOCUMENT',
      },
    });

    const res = await request(app)
      .get('/api/kyc/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
    expect(res.body.data.reviewNote).toBe('BLURRY_DOCUMENT');
    expect(res.body.data.submittedAt).toBeTruthy();
  });
});

// ── POST /api/kyc/webhook ────────────────────────────────────────────────────

describe('POST /api/kyc/webhook', () => {
  function postWebhook(body, signature) {
    const req = request(app)
      .post('/api/kyc/webhook')
      .set('Content-Type', 'application/json');
    if (signature !== undefined) req.set('x-sumsub-signature', signature);
    return req.send(body);
  }

  it('rejects a missing signature', async () => {
    const body = reviewedPayload({ externalUserId: user._id.toString() });
    const res = await postWebhook(body);
    expect(res.status).toBe(401);
  });

  it('rejects a wrong-secret signature', async () => {
    const body = reviewedPayload({ externalUserId: user._id.toString() });
    const badSig =
      'sha256=' +
      crypto.createHmac('sha256', 'wrong_secret').update(body).digest('hex');
    const res = await postWebhook(body, badSig);
    expect(res.status).toBe(401);
  });

  it('rejects a non-sha256 signature scheme', async () => {
    const body = reviewedPayload({ externalUserId: user._id.toString() });
    const res = await postWebhook(body, 'md5=abcdef');
    expect(res.status).toBe(401);
  });

  it('rejects a digest of the wrong length', async () => {
    const body = reviewedPayload({ externalUserId: user._id.toString() });
    const res = await postWebhook(body, 'sha256=deadbeef');
    expect(res.status).toBe(401);
  });

  it('rejects invalid JSON with a valid signature', async () => {
    const body = 'not-json{{{';
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(400);
  });

  it('ignores events other than applicantReviewed', async () => {
    const body = reviewedPayload({
      externalUserId: user._id.toString(),
      type: 'applicantCreated',
    });
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/ignored/i);

    const unchanged = await User.findById(user._id);
    expect(unchanged.kyc?.status ?? 'not_submitted').toBe('not_submitted');
  });

  it('skips payloads without an externalUserId', async () => {
    const body = reviewedPayload({});
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/skipped/i);
  });

  it('approves the user on a completed review', async () => {
    const body = reviewedPayload({
      externalUserId: user._id.toString(),
      reviewStatus: 'completed',
    });
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(200);

    const updated = await User.findById(user._id);
    expect(updated.kyc.status).toBe('approved');
    expect(updated.kyc.verifiedAt).toBeTruthy();
    expect(updated.kyc.reviewedAt).toBeTruthy();
  });

  it('rejects the user and records reject labels', async () => {
    const body = reviewedPayload({
      externalUserId: user._id.toString(),
      reviewStatus: 'rejected',
      rejectLabels: ['FORGERY', 'BLURRY'],
    });
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(200);

    const updated = await User.findById(user._id);
    expect(updated.kyc.status).toBe('rejected');
    expect(updated.kyc.reviewNote).toBe('FORGERY, BLURRY');
  });

  it('maps unknown review statuses to pending', async () => {
    const body = reviewedPayload({
      externalUserId: user._id.toString(),
      reviewStatus: 'onHold',
    });
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(200);

    const updated = await User.findById(user._id);
    expect(updated.kyc.status).toBe('pending');
  });

  it('returns 200 even when processing throws', async () => {
    const body = reviewedPayload({
      externalUserId: 'not-a-valid-objectid',
      reviewStatus: 'completed',
    });
    const res = await postWebhook(body, signWebhookBody(body));
    expect(res.status).toBe(200);
  });
});
