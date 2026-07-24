// ====================================================================
// المصادقة — JWT عبر jose (متوافق مع Edge Runtime في middleware)
// يدعم تدوير JWT_SECRET عبر JWT_SECRET_PREVIOUS
// ====================================================================

import { SignJWT, jwtVerify } from "jose";

// سر JWT — يجب ضبطه في .env ولا يوجد fallback للأمان
let _cachedSecret: Uint8Array | null = null;
let _cachedPreviousSecret: Uint8Array | null = null;

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

/**
 * استرداد السر السابق لدعم تدوير JWT_SECRET.
 * للتدوير الروتيني فقط، يمكن وضع القيمة القديمة في JWT_SECRET_PREVIOUS
 * لمدة عمر التوكن ثم حذفها. عند الاشتباه بتسريب المفتاح يجب تركه فارغاً
 * لإجراء قطع صارم وإبطال كل التوكينات المزوّرة فوراً.
 */
const getPreviousJwtSecret = (): Uint8Array | null => {
  if (_cachedPreviousSecret) return _cachedPreviousSecret;
  const secret = process.env.JWT_SECRET_PREVIOUS;
  if (!secret || secret.length < 32) return null;
  _cachedPreviousSecret = new TextEncoder().encode(secret);
  return _cachedPreviousSecret;
};

export interface AuthPayload {
  userId: string;
  username: string;
  role: string; // ADMIN | KEY_USER | OBSERVER
  isOwner: boolean;
  iat?: number; // Unix timestamp — وقت إصدار التوكن (ثوانٍ)
  issuedAtMs?: number;
}

export const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60;
const TOKEN_EXPIRY = `${SESSION_MAX_AGE_SECONDS}s`;
const ISSUER = "electoral-system";
const AUDIENCE = "electoral-system-users";

/**
 * إنشاء JWT موقّع للمستخدم المصادق عليه
 * يستخدم دائماً JWT_SECRET الحالي (الجديد)
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload, issuedAtMs: Date.now() })
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
 * يحاول السر الحالي أولاً، ثم السر السابق (للتدوير)
 * يرجع payload إن صالح، null إن منتهٍ أو تالف
 */
export async function verifyToken(
  token: string
): Promise<AuthPayload | null> {
  // محاولة 1: السر الحالي
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.issuedAtMs !== "number") return null;

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      isOwner: payload.isOwner as boolean,
      iat: payload.iat as number | undefined,
      issuedAtMs: typeof payload.issuedAtMs === "number" ? payload.issuedAtMs : undefined,
    };
  } catch {
    // السر الحالي لم يعمل — نحاول السابق
  }

  // محاولة 2: السر السابق (تدوير JWT_SECRET)
  const previousSecret = getPreviousJwtSecret();
  if (previousSecret) {
    try {
      const { payload } = await jwtVerify(token, previousSecret, {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: AUDIENCE,
      });
      if (typeof payload.issuedAtMs !== "number") return null;

      return {
        userId: payload.userId as string,
        username: payload.username as string,
        role: payload.role as string,
        isOwner: payload.isOwner as boolean,
        iat: payload.iat as number | undefined,
        issuedAtMs: typeof payload.issuedAtMs === "number" ? payload.issuedAtMs : undefined,
      };
    } catch {
      // كلا السرين لم يعملا
    }
  }

  // التوكن غير صالح أو منتهي
  return null;
}
