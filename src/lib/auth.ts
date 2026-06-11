import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';

// JWT Secret - must be set in environment variables
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('⚠️ JWT_SECRET not set! Using fallback - NOT SECURE FOR PRODUCTION');
    return new TextEncoder().encode('fallback-secret-change-me-in-production-please');
  }
  return new TextEncoder().encode(secret);
};

export interface AuthPayload {
  userId: string;
  username: string;
  role: string; // ADMIN, KEY_USER, OBSERVER
  isOwner: boolean;
}

const TOKEN_EXPIRY = '7d';

/**
 * Create a signed JWT token for an authenticated user
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setSubject(payload.userId)
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
  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, role: true },
    });
    return !!user && user.username === payload.username && user.role === payload.role;
  } catch {
    return false;
  }
}
