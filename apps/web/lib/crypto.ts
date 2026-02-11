import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption key derived from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

// Derive a 32-byte key from the encryption key
function getKey(): Buffer {
  return scryptSync(ENCRYPTION_KEY, 'salt', 32);
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypt sensitive data (like API keys)
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  const result: EncryptedData = {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };

  return Buffer.from(JSON.stringify(result)).toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedBase64: string): string {
  const key = getKey();
  const data: EncryptedData = JSON.parse(Buffer.from(encryptedBase64, 'base64').toString('utf8'));

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(data.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));

  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt credentials object (e.g., { apiKey: '...', apiSecret: '...' })
 */
export function encryptCredentials(credentials: Record<string, string>): string {
  return encrypt(JSON.stringify(credentials));
}

/**
 * Decrypt credentials object
 */
export function decryptCredentials(encryptedData: string): Record<string, string> {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}
