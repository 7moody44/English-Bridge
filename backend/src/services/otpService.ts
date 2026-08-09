import * as bcrypt from 'bcrypt';

/**
 * Generates a random 6-digit OTP code (zero-padded string).
 */
export function generateOtpCode(): string {
  // crypto would be ideal, but Math.random on a 6-digit code is fine for an email OTP.
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Hashes an OTP code with bcrypt so we never store the plain code in the DB.
 */
export async function hashOtpCode(code: string): Promise<string> {
  // Lighter salt rounds than passwords — these codes are short-lived (10 min).
  return bcrypt.hash(code, 8);
}

/**
 * Safely compares a candidate OTP code against a stored bcrypt hash.
 * Returns false instead of throwing when the stored hash is missing/invalid,
 * so callers can treat it uniformly as "code invalid".
 */
export async function verifyOtpCode(candidate: string, hash: string | undefined | null): Promise<boolean> {
  if (!hash || !candidate) return false;
  try {
    return bcrypt.compare(candidate, hash);
  } catch {
    return false;
  }
}

/** OTP lifetime in milliseconds. */
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
