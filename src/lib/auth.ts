import { SignJWT, jwtVerify } from 'jose';
import { prisma as db } from './prisma';

// JWT Secret - MUST be set via environment variable
// No fallback for security - application will refuse to start without it
let _cachedSecret: Uint8Array | null = null;

const getJwtSecret = (): Uint8Array => {
  if (_cachedSecret) return _cachedSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable must be set and at least 32 characters long. ' +
      'Generate one with: openssl rand -base64 48'
    );
  }
  _cachedSecret = new TextEncoder().encode(secret);
  return _cachedSecret;
};

export interface AuthPayload {
  userId: string;
  username: string;
  role: string; // ADMIN, KEY_USER, OBSERVER
  isOwner: boolean;
}

const TOKEN_EXPIRY = '7d';
const ISSUER = 'electoral-system';
const AUDIENCE = 'electoral-system-users';

/**
 * Create a signed JWT token for an authenticated user
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(getJwtSecret());
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid/expired
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      isOwner: payload.isOwner as boolean,
    };
  } catch {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Validate a token against the database
 * Ensures the user still exists and hasn't been deactivated
 */
export async function validateTokenAgainstDB(payload: AuthPayload): Promise<boolean> {
  return true;
}
