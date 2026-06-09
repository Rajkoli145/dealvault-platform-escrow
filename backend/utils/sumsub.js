const crypto = require('crypto');
const axios = require('axios');

const SUMSUB_BASE = process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com';

/**
 * Create a Sumsub SDK access token for the given user.
 * Tokens are short-lived (600s) and scoped to a verification level.
 *
 * @param {string} userId  - Our internal user ID
 * @param {string} levelName - Sumsub level name (e.g. 'basic-kyc-level')
 * @param {string} [externalUserId] - Optional external user identifier
 * @returns {Promise<string>} The signed access token
 */
async function createAccessToken(userId, levelName, externalUserId) {
  const payload = {
    userId,
    levelName,
    ttl: 600,
  };
  if (externalUserId) payload.externalUserId = externalUserId;

  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signature = crypto
    .createHmac('sha256', process.env.SUMSUB_SECRET_KEY)
    .update(timestamp + body)
    .digest('base64');

  const headers = {
    'Content-Type': 'application/json',
    'X-App-Access-Token': process.env.SUMSUB_APP_TOKEN,
    'X-App-Token-Signature': signature,
    'X-App-Access-Ts': timestamp,
  };

  const resp = await axios.post(
    `${SUMSUB_BASE}/resources/accessTokens/sumsub?type=access-token`,
    body,
    { headers }
  );

  return resp.data?.token;
}

/**
 * Verify the HMAC-SHA256 digest on a Sumsub webhook payload.
 *
 * Uses crypto.timingSafeEqual to prevent timing side-channel attacks.
 *
 * @param {Buffer} rawBody - Raw request body (Buffer from express.raw())
 * @param {string} digest  - X-Sumsub-Signature header value
 * @returns {boolean}
 */
function verifyWebhookDigest(rawBody, digest) {
  if (!digest || !rawBody) return false;

  const [scheme, receivedHex] = digest.split('=');
  if (scheme !== 'sha256' || !receivedHex) return false;

  const expected = crypto
    .createHmac('sha256', process.env.SUMSUB_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(receivedHex, 'hex');

  if (expectedBuf.length !== receivedBuf.length) return false;

  try {
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

module.exports = {
  createAccessToken,
  verifyWebhookDigest,
};
