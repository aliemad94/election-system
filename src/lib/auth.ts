// ====================================================================
// المصادقة — JWT عبر jose (متوافق مع Edge Runtime في middleware)
// ====================================================================

import { SignJWT, jwtVerify } from "jose";

// سر JWT — يجب ضبطه في .env ولا يوجد fallback للأمان
let _cachedSecret: Uint8Array | null = null;

const getJwtSecret = (): Uint8Array => {
  if (_cachedSecret) return _cachedSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable must be set and at least 32 characters long. " +
        "Generate one with: openssl rand -base64 48"
    );
  }
  _cachedSecret = new TextEncoder().encode(secret);
  return _cachedSecret;
};

export interface AuthPayload {
  userId: string;
  username: string;
  role: string; // ADMIN | KEY_USER | OBSERVER
  isOwner: boolean;
}

const TOKEN_EXPIRY = "8h";
const ISSUER = "electoral-system";
const AUDIENCE = "electoral-system-users";

/**
 * إنشاء JWT موقّع للمستخدم المصادق عليه
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(getJwtSecret());
}

/**
 * التحقق من وفك تشفير JWT
 * يرجع payload إن صالح، null إن منتهٍ أو تالف
 */
export async function verifyToken(
  token: string
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
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
    // التوكن غير صالح أو منتهي
    return null;
  }
}

