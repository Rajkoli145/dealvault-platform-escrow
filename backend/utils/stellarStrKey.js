/**
 * Stellar StrKey validation (self-contained, no external SDK).
 *
 * A Stellar ed25519 public key ("G..." address) is base32(RFC 4648, no padding)
 * of: [1 version byte][32-byte ed25519 payload][2-byte CRC16-XModem checksum].
 * Validating the checksum (not just the charset) catches typos and truncations
 * that a plain regex silently accepts.
 *
 * Implemented locally rather than pulling in @stellar/stellar-sdk so the check
 * works offline (tests run without network) and adds no heavy dependency.
 */

const ED25519_PUBLIC_KEY_VERSION_BYTE = 6 << 3; // 0x30 → encodes to leading 'G'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input) {
  let bits = 0;
  let value = 0;
  const out = [];
  for (const char of input) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) return null; // invalid character
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(out);
}

function crc16xmodem(buffer) {
  let crc = 0x0000;
  for (const byte of buffer) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

/**
 * @param {string} address Candidate Stellar public key.
 * @returns {boolean} true only if charset, version byte, length, and CRC16 checksum all match.
 */
function isValidEd25519PublicKey(address) {
  if (typeof address !== 'string' || address.length !== 56 || address[0] !== 'G') {
    return false;
  }
  const decoded = base32Decode(address);
  // 1 version + 32 payload + 2 checksum = 35 bytes
  if (!decoded || decoded.length !== 35) return false;
  if (decoded[0] !== ED25519_PUBLIC_KEY_VERSION_BYTE) return false;

  const dataToChecksum = decoded.subarray(0, 33); // version + payload
  const expected = decoded[33] | (decoded[34] << 8); // checksum stored little-endian
  return crc16xmodem(dataToChecksum) === expected;
}

module.exports = { isValidEd25519PublicKey };
