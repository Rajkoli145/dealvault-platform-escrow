/**
 * Stellar StrKey validation (self-contained, no SDK).
 *
 * Mirrors backend/utils/stellarStrKey.js. A Stellar ed25519 public key ("G...")
 * is base32(RFC 4648, no padding) of [1 version byte][32-byte payload][2-byte
 * CRC16-XModem checksum]. Validating the checksum (not just the charset) rejects
 * typo'd/truncated addresses that a plain regex silently accepts.
 *
 * Implemented locally rather than adding @stellar/stellar-sdk (a large dependency)
 * for a single function — the frontend does no other SDK work.
 */

const ED25519_PUBLIC_KEY_VERSION_BYTE = 6 << 3; // 0x30 → leading 'G'
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): number[] | null {
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of input) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return out;
}

function crc16xmodem(bytes: number[]): number {
  let crc = 0x0000;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

/** True only if charset, version byte, length, and CRC16 checksum all match. */
export function isValidEd25519PublicKey(address: string): boolean {
  if (typeof address !== 'string' || address.length !== 56 || address[0] !== 'G') {
    return false;
  }
  const decoded = base32Decode(address);
  if (!decoded || decoded.length !== 35) return false; // 1 version + 32 payload + 2 checksum
  if (decoded[0] !== ED25519_PUBLIC_KEY_VERSION_BYTE) return false;

  const dataToChecksum = decoded.slice(0, 33);
  const expected = decoded[33] | (decoded[34] << 8); // little-endian
  return crc16xmodem(dataToChecksum) === expected;
}
