// ====================================================================
// خدمة النطاق (Scope Service) — تحديد نطاق الوصول لـ KEY_USER
// دالة مركزية تُسحب صلاحياتها مباشرة من قاعدة البيانات
// ====================================================================

import { prisma } from "@/lib/prisma";

export interface KeyUserScope {
  keyId: string;
  voterWhere: { keyId: string };
  serviceWhere: { keyId: string };
  taskWhere: { electoralKeyId: string };
}

/**
 * تحديد نطاق الوصول لـ KEY_USER بناءً على userId (المعرف الفريد للمستخدم).
 * 
 * @returns KeyUserScope إذا وُجد المفتاح، أو null إذا لم يُربط.
 */
export async function getKeyUserScope(userId: string): Promise<KeyUserScope | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { electionKeyId: true },
    });

    if (!user || !user.electionKeyId) {
      return null;
    }

    return {
      keyId: user.electionKeyId,
      voterWhere: { keyId: user.electionKeyId },
      serviceWhere: { keyId: user.electionKeyId },
      taskWhere: { electoralKeyId: user.electionKeyId },
    };
  } catch (error) {
    console.error("getKeyUserScope: DB lookup failed:", error);
    return null;
  }
}

/**
 * تطبيق نطاق KEY_USER على شرط where.
 * يُرجع true إذا تم التقييد بنجاح، false إذا لم يُعثر على مفتاح.
 */
export async function applyKeyUserScope(
  where: Record<string, unknown>,
  user: { role: string; userId: string }
): Promise<boolean> {
  if (user.role !== "KEY_USER") return true;

  const scope = await getKeyUserScope(user.userId);
  if (!scope) {
    where.keyId = "none";
    return false;
  }

  where.keyId = scope.keyId;
  return true;
}

// ====================================================================
// دوال التحقق الصارم من الملكية (Ownership Assertions)
// ====================================================================

export async function assertOwnsKey(userId: string, keyId: string): Promise<void> {
  const scope = await getKeyUserScope(userId);
  if (!scope || scope.keyId !== keyId) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
}

export async function assertOwnsVoter(userId: string, voterId: string): Promise<void> {
  const scope = await getKeyUserScope(userId);
  if (!scope) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
  const voter = await prisma.voter.findUnique({
    where: { id: voterId },
    select: { keyId: true },
  });
  if (!voter || voter.keyId !== scope.keyId) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
}

export async function assertOwnsService(userId: string, serviceId: string): Promise<void> {
  const scope = await getKeyUserScope(userId);
  if (!scope) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { keyId: true },
  });
  if (!service || service.keyId !== scope.keyId) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
}

export async function assertOwnsTask(userId: string, taskId: string): Promise<void> {
  const scope = await getKeyUserScope(userId);
  if (!scope) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { electoralKeyId: true },
  });
  if (!task || task.electoralKeyId !== scope.keyId) {
    throw new Error("ACCESS_DENIED_SCOPE");
  }
}

/**
 * إبطال كاش النطاق (تم إلغاء الكاش، الدالة باقية للتوافق)
 */
export function invalidateScopeCache(username?: string): void {
  // لا يوجد كاش
}

