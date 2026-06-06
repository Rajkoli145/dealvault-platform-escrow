/**
 * GitHub Bot Service
 *
 * Handles all GitHub API interactions for the DealVault Bot.
 * Authenticates as a GitHub App and uses installation access tokens
 * to post comments, assign users, and fetch issue details.
 *
 * IMPORTANT: Octokit is loaded lazily (on first API call) because
 * @octokit/rest and @octokit/auth-app are ESM-only packages that
 * would break Jest if loaded at require() time.
 */

const crypto = require('crypto');

// ── Lazy-loaded Octokit ───────────────────────────────────────────────────────

let _Octokit = null;
let _createAppAuth = null;
let installationOctokit = null;

/**
 * Lazily load Octokit and auth-app to avoid ESM import issues in Jest tests.
 */
async function loadOctokit() {
  if (!_Octokit) {
    const octokitModule = await import('@octokit/rest');
    _Octokit = octokitModule.Octokit;
  }
  if (!_createAppAuth) {
    const authModule = await import('@octokit/auth-app');
    _createAppAuth = authModule.createAppAuth;
  }
}

/**
 * Decode the private key from base64 if needed.
 * @param {string} key
 * @returns {string}
 */
function decodePrivateKey(key) {
  if (!key) return '';
  if (key.startsWith('-----BEGIN')) return key;
  return Buffer.from(key, 'base64').toString('utf-8');
}

/**
 * Get an authenticated Octokit instance for the GitHub App installation.
 * Uses installation access tokens that auto-refresh.
 * @param {string|number} [installationId] – defaults to GITHUB_APP_INSTALLATION_ID env var
 * @returns {Promise<Octokit>}
 */
async function getInstallationOctokit(installationId) {
  if (installationOctokit) return installationOctokit;

  await loadOctokit();

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const instId = installationId || process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !privateKey || !instId) {
    throw new Error(
      'GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_INSTALLATION_ID must be set.'
    );
  }

  installationOctokit = new _Octokit({
    authStrategy: _createAppAuth,
    auth: {
      appId: Number(appId),
      privateKey: decodePrivateKey(privateKey),
      installationId: Number(instId),
    },
  });

  return installationOctokit;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Post a comment on a GitHub issue.
 * @param {string} repoFullName – e.g. "DealVaultHQ/dealvault-platform-escrow"
 * @param {number} issueNumber
 * @param {string} body – Markdown content for the comment
 * @returns {Promise<object>} The created comment data
 */
async function postIssueComment(repoFullName, issueNumber, body) {
  const octokit = await getInstallationOctokit();
  const [owner, repo] = repoFullName.split('/');

  const { data } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });

  return data;
}

/**
 * Assign a GitHub user to an issue.
 * @param {string} repoFullName
 * @param {number} issueNumber
 * @param {string} username – GitHub username to assign
 * @returns {Promise<object>}
 */
async function assignIssue(repoFullName, issueNumber, username) {
  const octokit = await getInstallationOctokit();
  const [owner, repo] = repoFullName.split('/');

  const { data } = await octokit.rest.issues.addAssignees({
    owner,
    repo,
    issue_number: issueNumber,
    assignees: [username],
  });

  return data;
}

/**
 * Fetch details of a GitHub issue.
 * @param {string} repoFullName
 * @param {number} issueNumber
 * @returns {Promise<object>}
 */
async function getIssueDetails(repoFullName, issueNumber) {
  const octokit = await getInstallationOctokit();
  const [owner, repo] = repoFullName.split('/');

  const { data } = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  return data;
}

/**
 * Verify a GitHub webhook signature.
 * @param {Buffer|string} payload – Raw request body
 * @param {string} signature – The X-Hub-Signature-256 header value
 * @returns {boolean}
 */
function verifyWebhookSignature(payload, signature) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️  GITHUB_WEBHOOK_SECRET not set — skipping signature verification');
    return true;
  }

  if (!signature) return false;

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

/**
 * Reset the cached Octokit instance (useful for testing).
 */
function resetOctokit() {
  installationOctokit = null;
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  getInstallationOctokit,
  postIssueComment,
  assignIssue,
  getIssueDetails,
  verifyWebhookSignature,
  resetOctokit,
};
