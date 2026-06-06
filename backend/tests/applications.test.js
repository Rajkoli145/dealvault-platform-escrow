/**
 * Application Controller Tests
 *
 * Tests for the contributor application submission,
 * listing, confirmation, and rejection flows.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Application = require('../models/Application');

// ── Test Setup ────────────────────────────────────────────────────────────────

let mongoServer;
let contributorToken, maintainerToken;
let contributor, maintainer;
let testIssue;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections
  await User.deleteMany({});
  await Issue.deleteMany({});
  await Application.deleteMany({});

  // Create test users
  contributor = await User.create({
    name: 'TestContributor',
    email: 'contributor@test.com',
    password: 'password123',
    role: 'contributor',
    githubUsername: 'test-contributor',
    accountStatus: 'active',
  });

  maintainer = await User.create({
    name: 'TestMaintainer',
    email: 'maintainer@test.com',
    password: 'password123',
    role: 'maintainer',
    githubUsername: 'test-maintainer',
    accountStatus: 'active',
  });

  // Generate tokens
  contributorToken = jwt.sign({ id: contributor._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  maintainerToken = jwt.sign({ id: maintainer._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  // Create a test issue on the platform
  testIssue = await Issue.create({
    githubIssueNumber: 100,
    githubIssueUrl: 'https://github.com/DealVaultHQ/dealvault-platform-escrow/issues/100',
    githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
    title: 'Test Issue for Applications',
    body: 'A test issue.',
    labels: ['dealvault'],
    addedBy: 'test-maintainer',
    status: 'open',
  });
});

// ── Mock GitHub API ───────────────────────────────────────────────────────────

// Mock the githubBot service to prevent real API calls
jest.mock('../services/githubBot', () => ({
  postIssueComment: jest.fn().mockResolvedValue({ id: 1 }),
  assignIssue: jest.fn().mockResolvedValue({}),
  getIssueDetails: jest.fn().mockResolvedValue({}),
  verifyWebhookSignature: jest.fn().mockReturnValue(true),
}));

// ── Tests: Submit Application ─────────────────────────────────────────────────

describe('POST /api/applications', () => {
  it('should submit an application successfully', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({
        githubIssueNumber: 100,
        githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
        applicationLetter: 'I would like to work on this issue. I have experience with Node.js and MongoDB.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.status).toBe('pending');
    expect(res.body.data.application.applicantGithubUsername).toBe('test-contributor');
  });

  it('should reject application without auth', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({
        githubIssueNumber: 100,
        githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
        applicationLetter: 'I want to work on this.',
      });

    expect(res.status).toBe(401);
  });

  it('should reject application for non-existent issue', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({
        githubIssueNumber: 999,
        githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
        applicationLetter: 'I want to work on this non-existent issue.',
      });

    expect(res.status).toBe(404);
  });

  it('should reject duplicate applications', async () => {
    // First application
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({
        githubIssueNumber: 100,
        githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
        applicationLetter: 'First application letter here.',
      });

    // Duplicate
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({
        githubIssueNumber: 100,
        githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
        applicationLetter: 'Trying to apply again with different letter.',
      });

    expect(res.status).toBe(409);
  });

  it('should reject application with missing fields', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({
        githubIssueNumber: 100,
        // missing githubRepoFullName and applicationLetter
      });

    expect(res.status).toBe(400);
  });
});

// ── Tests: List Applications ──────────────────────────────────────────────────

describe('GET /api/applications', () => {
  beforeEach(async () => {
    await Application.create({
      githubIssueNumber: 100,
      githubIssueUrl: testIssue.githubIssueUrl,
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      applicantGithubUsername: 'test-contributor',
      applicantUserId: contributor._id,
      applicationLetter: 'I want to work on this issue.',
      status: 'pending',
      issue: testIssue._id,
    });
  });

  it('should return applications for maintainer', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('should return only own applications for contributor', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${contributorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
  });

  it('should filter by status', async () => {
    const res = await request(app)
      .get('/api/applications?status=confirmed')
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.applications).toHaveLength(0);
  });
});

// ── Tests: Confirm Application ────────────────────────────────────────────────

describe('PATCH /api/applications/:id/confirm', () => {
  let application;

  beforeEach(async () => {
    application = await Application.create({
      githubIssueNumber: 100,
      githubIssueUrl: testIssue.githubIssueUrl,
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      applicantGithubUsername: 'test-contributor',
      applicantUserId: contributor._id,
      applicationLetter: 'I want to work on this issue.',
      status: 'pending',
      issue: testIssue._id,
    });
  });

  it('should confirm an application (maintainer)', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/confirm`)
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.application.status).toBe('confirmed');

    // Verify issue was updated
    const updatedIssue = await Issue.findById(testIssue._id);
    expect(updatedIssue.status).toBe('assigned');
    expect(updatedIssue.assignedTo).toBe('test-contributor');

    // Verify GitHub API was called
    const githubBot = require('../services/githubBot');
    expect(githubBot.postIssueComment).toHaveBeenCalled();
    expect(githubBot.assignIssue).toHaveBeenCalledWith(
      'DealVaultHQ/dealvault-platform-escrow',
      100,
      'test-contributor'
    );
  });

  it('should reject confirmation from non-maintainer', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/confirm`)
      .set('Authorization', `Bearer ${contributorToken}`);

    expect(res.status).toBe(403);
  });

  it('should auto-reject other pending applications when one is confirmed', async () => {
    // Create a second application from another user
    const otherUser = await User.create({
      name: 'OtherContributor',
      email: 'other@test.com',
      password: 'password123',
      role: 'contributor',
      githubUsername: 'other-contributor',
      accountStatus: 'active',
    });

    const otherApp = await Application.create({
      githubIssueNumber: 100,
      githubIssueUrl: testIssue.githubIssueUrl,
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      applicantGithubUsername: 'other-contributor',
      applicantUserId: otherUser._id,
      applicationLetter: 'I also want to work on this.',
      status: 'pending',
      issue: testIssue._id,
    });

    // Confirm the first application
    await request(app)
      .patch(`/api/applications/${application._id}/confirm`)
      .set('Authorization', `Bearer ${maintainerToken}`);

    // Check the second application was auto-rejected
    const rejectedApp = await Application.findById(otherApp._id);
    expect(rejectedApp.status).toBe('rejected');
    expect(rejectedApp.rejectionReason).toContain('Another applicant');
  });
});

// ── Tests: Reject Application ─────────────────────────────────────────────────

describe('PATCH /api/applications/:id/reject', () => {
  let application;

  beforeEach(async () => {
    application = await Application.create({
      githubIssueNumber: 100,
      githubIssueUrl: testIssue.githubIssueUrl,
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      applicantGithubUsername: 'test-contributor',
      applicantUserId: contributor._id,
      applicationLetter: 'I want to work on this.',
      status: 'pending',
      issue: testIssue._id,
    });
  });

  it('should reject an application with a reason', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/reject`)
      .set('Authorization', `Bearer ${maintainerToken}`)
      .send({ reason: 'Looking for someone with more experience.' });

    expect(res.status).toBe(200);
    expect(res.body.data.application.status).toBe('rejected');
    expect(res.body.data.application.rejectionReason).toBe(
      'Looking for someone with more experience.'
    );
  });

  it('should reject without a reason', async () => {
    const res = await request(app)
      .patch(`/api/applications/${application._id}/reject`)
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.application.status).toBe('rejected');
  });
});

// ── Tests: Get Issues ─────────────────────────────────────────────────────────

describe('GET /api/issues', () => {
  it('should list platform issues (public)', async () => {
    const res = await request(app).get('/api/issues');

    expect(res.status).toBe(200);
    expect(res.body.data.issues).toHaveLength(1);
    expect(res.body.data.issues[0].title).toBe('Test Issue for Applications');
  });

  it('should filter by status', async () => {
    const res = await request(app).get('/api/issues?status=assigned');

    expect(res.status).toBe(200);
    expect(res.body.data.issues).toHaveLength(0);
  });
});

describe('GET /api/issues/:repoOwner/:repoName/:issueNumber', () => {
  it('should return issue details with applications', async () => {
    // Add an application
    await Application.create({
      githubIssueNumber: 100,
      githubIssueUrl: testIssue.githubIssueUrl,
      githubRepoFullName: 'DealVaultHQ/dealvault-platform-escrow',
      applicantGithubUsername: 'test-contributor',
      applicantUserId: contributor._id,
      applicationLetter: 'I want to work on this.',
      status: 'pending',
      issue: testIssue._id,
    });

    const res = await request(app).get(
      '/api/issues/DealVaultHQ/dealvault-platform-escrow/100'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.issue.title).toBe('Test Issue for Applications');
    expect(res.body.data.applications).toHaveLength(1);
    expect(res.body.data.applicationCount).toBe(1);
  });

  it('should return 404 for non-existent issue', async () => {
    const res = await request(app).get(
      '/api/issues/DealVaultHQ/dealvault-platform-escrow/999'
    );

    expect(res.status).toBe(404);
  });
});
