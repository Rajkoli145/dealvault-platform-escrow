/**
 * Webhook Controller Tests
 *
 * Tests for the GitHub webhook endpoint that handles
 * issue label events for the DealVault Bot.
 */

const request = require('supertest');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// ── Mock GitHub Bot Service (MUST be before requiring app/server) ─────────────
jest.mock('../services/githubBot', () => ({
  postIssueComment: jest.fn().mockResolvedValue({ id: 123 }),
  assignIssue: jest.fn().mockResolvedValue({}),
  getIssueDetails: jest.fn().mockResolvedValue({}),
  verifyWebhookSignature: jest.fn(),
  getInstallationOctokit: jest.fn(),
  resetOctokit: jest.fn(),
}));

const app = require('../server');
const Issue = require('../models/Issue');
const githubBot = require('../services/githubBot');

// ── Test Setup ────────────────────────────────────────────────────────────────

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Issue.deleteMany({});
  jest.clearAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = 'test_webhook_secret';

function signPayload(payload) {
  const body = JSON.stringify(payload);
  const sig =
    'sha256=' +
    crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  return { body, sig };
}

function buildLabeledPayload({
  labelName = 'dealvault',
  issueNumber = 42,
  issueTitle = 'Test Issue',
  repoFullName = 'DealVaultHQ/dealvault-platform-escrow',
} = {}) {
  return {
    action: 'labeled',
    label: { id: 1, name: labelName },
    issue: {
      number: issueNumber,
      title: issueTitle,
      body: 'This is a test issue body.',
      html_url: `https://github.com/${repoFullName}/issues/${issueNumber}`,
      labels: [{ name: labelName }],
    },
    repository: {
      full_name: repoFullName,
    },
    sender: {
      login: 'testmaintainer',
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/webhooks/github', () => {
  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  it('should reject requests with invalid signature', async () => {
    // Make verifyWebhookSignature return false for invalid sig
    githubBot.verifyWebhookSignature.mockReturnValue(false);

    const payload = buildLabeledPayload();

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', 'sha256=invalid_signature')
      .send(JSON.stringify(payload));

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should accept valid webhook and create an Issue record for dealvault label', async () => {
    // Make verifyWebhookSignature return true
    githubBot.verifyWebhookSignature.mockReturnValue(true);

    const payload = buildLabeledPayload();
    const { body, sig } = signPayload(payload);

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', sig)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify Issue was created in the database
    const issue = await Issue.findOne({
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      githubIssueNumber: 42,
    });

    expect(issue).not.toBeNull();
    expect(issue.title).toBe('Test Issue');
    expect(issue.status).toBe('open');
    expect(issue.addedBy).toBe('testmaintainer');

    // Verify bot comment was called
    expect(githubBot.postIssueComment).toHaveBeenCalledWith(
      'DealVaultHQ/dealvault-platform-escrow',
      42,
      expect.stringContaining('DealVault Platform')
    );
  });

  it('should ignore non-dealvault labels', async () => {
    githubBot.verifyWebhookSignature.mockReturnValue(true);

    const payload = buildLabeledPayload({ labelName: 'bug' });
    const { body, sig } = signPayload(payload);

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', sig)
      .send(body);

    expect(res.status).toBe(200);

    // Verify NO Issue was created
    const count = await Issue.countDocuments();
    expect(count).toBe(0);
  });

  it('should not duplicate an Issue if the label is added again', async () => {
    githubBot.verifyWebhookSignature.mockReturnValue(true);

    // Pre-create the issue
    await Issue.create({
      githubIssueNumber: 42,
      githubIssueUrl: 'https://github.com/DealVaultHQ/dealvault-platform-escrow/issues/42',
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      title: 'Test Issue',
      addedBy: 'testmaintainer',
    });

    const payload = buildLabeledPayload();
    const { body, sig } = signPayload(payload);

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', sig)
      .send(body);

    expect(res.status).toBe(200);

    // Still only one Issue
    const count = await Issue.countDocuments();
    expect(count).toBe(1);

    // Bot should NOT have been called (already tracked)
    expect(githubBot.postIssueComment).not.toHaveBeenCalled();
  });

  it('should handle non-issues events gracefully', async () => {
    githubBot.verifyWebhookSignature.mockReturnValue(true);

    const payload = { action: 'opened', pull_request: {} };
    const { body, sig } = signPayload(payload);

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-Hub-Signature-256', sig)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── Delivery Deduplication Tests ──────────────────────────────────────────────

describe('Webhook delivery deduplication', () => {
  const { _clearProcessedDeliveries } = require('../controllers/webhookController');

  function sendWebhook(payload, deliveryId) {
    const { body, sig } = signPayload(payload);
    const req = request(app)
      .post('/api/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', sig);
    if (deliveryId) req.set('X-GitHub-Delivery', deliveryId);
    return req.send(body);
  }

  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
    githubBot.verifyWebhookSignature.mockReturnValue(true);
    _clearProcessedDeliveries();
  });

  it('should ignore a duplicate X-GitHub-Delivery with 200 and not process it twice', async () => {
    const first = await sendWebhook(buildLabeledPayload({ issueNumber: 101 }), 'dup-uuid-1');
    expect(first.status).toBe(200);

    // Same delivery ID, different payload — must be dropped, not processed
    const second = await sendWebhook(buildLabeledPayload({ issueNumber: 102 }), 'dup-uuid-1');
    expect(second.status).toBe(200);
    expect(second.body.message).toBe('Duplicate delivery ignored.');

    const count = await Issue.countDocuments();
    expect(count).toBe(1);
    expect(await Issue.findOne({ githubIssueNumber: 101 })).not.toBeNull();
    expect(await Issue.findOne({ githubIssueNumber: 102 })).toBeNull();
  });

  it('should process distinct delivery IDs independently', async () => {
    await sendWebhook(buildLabeledPayload({ issueNumber: 201 }), 'uuid-a');
    await sendWebhook(buildLabeledPayload({ issueNumber: 202 }), 'uuid-b');

    expect(await Issue.countDocuments()).toBe(2);
  });

  it('should process requests without an X-GitHub-Delivery header normally', async () => {
    await sendWebhook(buildLabeledPayload({ issueNumber: 301 }));
    await sendWebhook(buildLabeledPayload({ issueNumber: 302 }));

    // No header → no dedup possible → both processed
    expect(await Issue.countDocuments()).toBe(2);
  });

  it('should re-process a delivery ID after its TTL expires', async () => {
    const realNow = Date.now();
    const nowSpy = jest.spyOn(Date, 'now');

    try {
      nowSpy.mockReturnValue(realNow);
      await sendWebhook(buildLabeledPayload({ issueNumber: 401 }), 'ttl-uuid');

      // Advance past the 10-minute TTL — the stale entry must be evicted
      nowSpy.mockReturnValue(realNow + 11 * 60 * 1000);
      const res = await sendWebhook(buildLabeledPayload({ issueNumber: 402 }), 'ttl-uuid');

      expect(res.status).toBe(200);
      expect(res.body.message).not.toBe('Duplicate delivery ignored.');
      expect(await Issue.countDocuments()).toBe(2);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
