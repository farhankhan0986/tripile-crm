import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * @param {string} plaintext
 * @returns {{ encryptedValue: string, iv: string }}
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store: authTag (16 bytes) + encrypted — both as hex
  const combined = Buffer.concat([authTag, encrypted]);
  return {
    encryptedValue: combined.toString('hex'),
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypts a value produced by `encrypt`.
 * @param {string} encryptedValue — hex string
 * @param {string} iv — hex string
 * @returns {string} plaintext
 */
export function decrypt(encryptedValue, iv) {
  const key = getKey();
  const combined = Buffer.from(encryptedValue, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');

  // First 16 bytes = auth tag
  const authTag = combined.subarray(0, 16);
  const encrypted = combined.subarray(16);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
