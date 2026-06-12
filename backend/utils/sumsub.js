const crypto = require('crypto');
const axios = require('axios');

const SUMSUB_BASE = process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com';

/**
 * Sign a Sumsub API request per their HMAC-SHA256 scheme.
 * IMPORTANT: each part must be passed as a separate .update() call — NOT concatenated.
 */
function sign(method, path, body, timestamp) {
  const hmac = crypto.createHmac('sha256', process.env.SUMSUB_SECRET_KEY);
  hmac.update(timestamp);
  hmac.update(method.toUpperCase());
  hmac.update(path);
  if (body) hmac.update(body);
  return hmac.digest('hex');
}

/**
 * Create a Sumsub SDK access token for the given user.
 * Uses native https to avoid axios mutating the request.
 *
 * @param {string} userId    - Our internal user ID (used as externalUserId)
 * @param {string} levelName - Sumsub level name (e.g. 'basic-kyc-level')
 * @returns {Promise<string>} The signed SDK access token
 */
async function createAccessToken(userId, levelName) {
  const https = require('https');

  const path = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(levelName)}&ttlInSecs=600`;
  const method = 'POST';
  const ts = Math.floor(Date.now() / 1000).toString();

  // Sign: ts → method → path (no body for this endpoint)
  const hmac = crypto.createHmac('sha256', process.env.SUMSUB_SECRET_KEY);
  hmac.update(ts);
  hmac.update(method);
  hmac.update(path);
  const sig = hmac.digest('hex');

  const options = {
    hostname: 'api.sumsub.com',
    path,
    method,
    headers: {
      'Content-Type':     'application/json',
      'Accept':           'application/json',
      'X-App-Token':      process.env.SUMSUB_APP_TOKEN,
      'X-App-Access-Sig': sig,
      'X-App-Access-Ts':  ts,
      'Content-Length':   0,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data).token);
          } catch (e) {
            reject(new Error('Failed to parse Sumsub response'));
          }
        } else {
          reject(new Error(`Sumsub API error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
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
