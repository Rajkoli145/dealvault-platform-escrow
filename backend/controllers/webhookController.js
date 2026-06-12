/**
 * Webhook Controller
 *
 * Handles incoming GitHub webhooks for the DealVault Bot.
 * Verifies signatures and processes issue label events.
 */

const Issue = require('../models/Issue');
const { verifyWebhookSignature, postIssueComment } = require('../services/githubBot');
const { issueAddedMessage } = require('../services/botMessages');

// ── Configuration ─────────────────────────────────────────────────────────────

const TRIGGER_LABEL = 'dealvault';

// SECURITY: GitHub redelivers webhooks on timeout/retry — without dedup a
// replayed delivery re-runs side effects (issue creation, bot comments).
// Short-TTL in-memory cache of processed X-GitHub-Delivery IDs.
// NOTE: per-process only; a multi-instance deployment needs a shared store.
const DELIVERY_TTL_MS = 10 * 60 * 1000; // 10 minutes
const processedDeliveries = new Map(); // deliveryId -> expiry timestamp

function isDuplicateDelivery(deliveryId) {
  if (!deliveryId) return false; // no header — cannot dedupe, process normally

  const now = Date.now();

  // Evict expired entries so the map cannot grow unboundedly
  for (const [id, expiresAt] of processedDeliveries) {
    if (expiresAt <= now) processedDeliveries.delete(id);
  }

  if (processedDeliveries.has(deliveryId)) return true;

  processedDeliveries.set(deliveryId, now + DELIVERY_TTL_MS);
  return false;
}

// Exported for tests
exports._clearProcessedDeliveries = () => processedDeliveries.clear();

// ── Handlers ──────────────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/github
 * Main GitHub webhook endpoint.
 *
 * The request body must be raw (Buffer) for signature verification.
 * This is handled by express.raw() middleware on this route.
 */
exports.handleGitHubWebhook = async (req, res, next) => {
  try {
    // ── 1. Verify webhook signature ─────────────────────────────────────────
    const signature = req.headers['x-hub-signature-256'];
    const rawBody = req.body; // Buffer, thanks to express.raw()

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('⚠️  Webhook signature verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature.',
      });
    }

    // ── 2. Deduplicate deliveries ───────────────────────────────────────────
    // SECURITY: checked AFTER signature verification so unauthenticated
    // requests cannot poison the dedup cache. Duplicates get 200 so GitHub
    // stops retrying.
    const deliveryId = req.headers['x-github-delivery'];
    if (isDuplicateDelivery(deliveryId)) {
      console.log(`ℹ️  Duplicate webhook delivery ${deliveryId} ignored.`);
      return res.status(200).json({ success: true, message: 'Duplicate delivery ignored.' });
    }

    // ── 3. Parse the payload ────────────────────────────────────────────────
    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf-8'));
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON payload.',
      });
    }

    const event = req.headers['x-github-event'];
    const action = payload.action;

    console.log(`📩 Webhook received: event=${event}, action=${action}`);

    // ── 4. Route to the appropriate handler ─────────────────────────────────

    // Handle issue labeled event
    if (event === 'issues' && action === 'labeled') {
      await handleIssueLabeled(payload);
    }

    // Acknowledge the webhook (GitHub expects a 2xx response quickly)
    return res.status(200).json({ success: true, message: 'Webhook processed.' });
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
    // Still return 200 to GitHub to prevent retries on application errors
    return res.status(200).json({ success: true, message: 'Webhook received (with errors).' });
  }
};

// ── Internal Handlers ─────────────────────────────────────────────────────────

/**
 * Handle the `issues.labeled` event.
 * When the `dealvault` label is added, register the issue on the platform
 * and post the bot comment.
 */
async function handleIssueLabeled(payload) {
  const label = payload.label;
  const issue = payload.issue;
  const repo = payload.repository;
  const sender = payload.sender;

  // Only act on the trigger label
  if (!label || label.name.toLowerCase() !== TRIGGER_LABEL) {
    console.log(`ℹ️  Ignoring label "${label?.name}" (not "${TRIGGER_LABEL}")`);
    return;
  }

  const repoFullName = repo.full_name;
  const issueNumber = issue.number;
  const issueUrl = issue.html_url;

  console.log(`🏷️  Label "${TRIGGER_LABEL}" added to ${repoFullName}#${issueNumber} by ${sender.login}`);

  // ── Check if issue is already tracked ───────────────────────────────────
  const existing = await Issue.findOne({
    githubRepoFullName: repoFullName,
    githubIssueNumber: issueNumber,
  });

  if (existing) {
    console.log(`ℹ️  Issue ${repoFullName}#${issueNumber} is already tracked on the platform.`);
    return;
  }

  // ── Create the Issue record ─────────────────────────────────────────────
  const platformIssue = await Issue.create({
    githubIssueNumber: issueNumber,
    githubIssueUrl: issueUrl,
    githubRepoFullName: repoFullName,
    title: issue.title,
    body: issue.body || '',
    labels: issue.labels.map((l) => l.name),
    addedBy: sender.login,
    status: 'open',
    funding: 0,          // Maintainer sets this via the platform dashboard
    fundingCurrency: 'USD',
  });

  console.log(`✅ Issue ${repoFullName}#${issueNumber} added to DealVault platform.`);

  // ── Post the bot comment on GitHub ──────────────────────────────────────
  const comment = issueAddedMessage({
    issueNumber,
    repoFullName,
    funding: platformIssue.funding,
    fundingCurrency: platformIssue.fundingCurrency,
  });

  await postIssueComment(repoFullName, issueNumber, comment);
  console.log(`💬 Bot comment posted on ${repoFullName}#${issueNumber}`);
}

// Export for testing
exports._handleIssueLabeled = handleIssueLabeled;
