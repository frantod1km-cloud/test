import { createHash } from 'crypto';

/**
 * Simple password hashing for MVP scaffold.
 * TODO: Replace with argon2id (@node-rs/argon2) before production.
 *
 * For scaffold purposes we use PBKDF2 via crypto which is available everywhere.
 */

const ITERATIONS = 100_000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string): Promise<string> {
  const { pbkdf2, randomBytes } = await import('crypto');
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');
    pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, key) => {
      if (err) reject(err);
      resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const { pbkdf2 } = await import('crypto');
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === key);
    });
  });
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
