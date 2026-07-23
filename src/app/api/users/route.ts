import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedUser } from "@/lib/auth-guard";
import {
  handleApiError,
  validatePassword,
  writeAuditLog,
} from "@/lib/security";

const roleSchema = z.enum(["ADMIN", "KEY_USER", "OBSERVER"]);
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9._-]{3,64}$/,
    "اسم المستخدم يجب أن يكون 3-64 محرفًا لاتينيًا أو رقمًا"
  );

const createUserSchema = z
  .object({
    username: usernameSchema,
    password: z.string().min(1).max(128),
    role: roleSchema,
    electionKeyId: z.string().trim().min(1).nullable().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.role === "KEY_USER" && !value.electionKeyId) {
      ctx.addIssue({
        code: "custom",
        path: ["electionKeyId"],
        message: "ربط المفتاح مطلوب لمستخدم المفتاح",
      });
    }
    if (value.role !== "KEY_USER" && value.electionKeyId) {
      ctx.addIssue({
        code: "custom",
        path: ["electionKeyId"],
        message: "ربط المفتاح متاح لدور KEY_USER فقط",
      });
    }
  });

const updateUserSchema = z
  .object({
    id: z.string().trim().min(1),
    role: roleSchema.optional(),
    isActive: z.boolean().optional(),
    electionKeyId: z.string().trim().min(1).nullable().optional(),
    newPassword: z.string().min(1).max(128).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.role !== undefined ||
      value.isActive !== undefined ||
      value.electionKeyId !== undefined ||
      value.newPassword !== undefined,
    { message: "لا توجد حقول للتحديث" }
  );

class LastActiveAdminError extends Error {}

function isUniqueAccountConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function accountConflictResponse() {
  return NextResponse.json(
    { error: "اسم المستخدم مستخدم أو المفتاح مرتبط بحساب آخر" },
    { status: 409 }
  );
}

async function assertKeyAvailable(
  keyId: string | null,
  excludedUserId?: string
): Promise<boolean> {
  if (!keyId) return false;
  const [key, conflictingUser] = await Promise.all([
    prisma.electionKey.findFirst({
      where: { id: keyId, deletedAt: null },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: {
        electionKeyId: keyId,
        ...(excludedUserId ? { id: { not: excludedUserId } } : {}),
      },
      select: { id: true },
    }),
  ]);
  return Boolean(key) && !conflictingUser;
}

async function getHandler(
  _request: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { username: "asc" }],
      take: 500,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        mustChangePwd: true,
        electionKeyId: true,
        createdAt: true,
        updatedAt: true,
        electionKey: {
          select: {
            keyCode: true,
            firstName: true,
            fatherName: true,
          },
        },
      },
    });
    return NextResponse.json({
      users: users.map((account) => ({
        ...account,
        isCurrent: account.id === user.userId,
      })),
    });
  } catch (error) {
    return handleApiError(error, "users-get");
  }
}

async function postHandler(
  request: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  try {
    const parsed = createUserSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات الحساب غير صالحة" },
        { status: 400 }
      );
    }
    const input = parsed.data;
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join("، ") },
        { status: 400 }
      );
    }
    if (
      input.role === "KEY_USER" &&
      !(await assertKeyAvailable(input.electionKeyId || null))
    ) {
      return NextResponse.json(
        { error: "المفتاح غير موجود أو مرتبط بحساب آخر" },
        { status: 409 }
      );
    }

    const password = await bcrypt.hash(input.password, 12);
    const created = await prisma.$transaction(async (tx) => {
      const record = await tx.user.create({
        data: {
          username: input.username,
          password,
          role: input.role,
          electionKeyId:
            input.role === "KEY_USER" ? input.electionKeyId : null,
          isActive: true,
          mustChangePwd: true,
          tokenIssuedBefore: new Date(),
        },
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
          mustChangePwd: true,
          electionKeyId: true,
        },
      });
      await writeAuditLog(tx, {
        userId: user.userId,
        username: user.username,
        action: "CREATE",
        entity: "User",
        entityId: record.id,
        details: {
          createdUsername: record.username,
          role: record.role,
          electionKeyId: record.electionKeyId,
        },
      });
      return record;
    });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    if (isUniqueAccountConflict(error)) return accountConflictResponse();
    return handleApiError(error, "users-post");
  }
}

async function patchHandler(
  request: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  try {
    const parsed = updateUserSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات الحساب غير صالحة" },
        { status: 400 }
      );
    }
    const input = parsed.data;
    if (input.id === user.userId) {
      return NextResponse.json(
        { error: "استخدم إعدادات الحساب لتغيير حسابك الحالي" },
        { status: 409 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: input.id },
      select: { role: true, electionKeyId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });
    }

    const effectiveRole = input.role ?? existing.role;
    const effectiveKeyId =
      input.electionKeyId !== undefined
        ? input.electionKeyId
        : existing.electionKeyId;
    if (effectiveRole === "KEY_USER") {
      if (
        !effectiveKeyId ||
        !(await assertKeyAvailable(effectiveKeyId, input.id))
      ) {
        return NextResponse.json(
          { error: "يجب ربط مستخدم المفتاح بمفتاح متاح" },
          { status: 409 }
        );
      }
    } else if (effectiveKeyId) {
      return NextResponse.json(
        { error: "أزل ربط المفتاح قبل تغيير الدور" },
        { status: 400 }
      );
    }

    const data: {
      role?: string;
      isActive?: boolean;
      electionKeyId?: string | null;
      password?: string;
      mustChangePwd?: boolean;
      tokenIssuedBefore: Date;
    } = { tokenIssuedBefore: new Date() };
    if (input.role !== undefined) data.role = input.role;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.electionKeyId !== undefined) {
      data.electionKeyId = input.electionKeyId;
    }
    if (input.newPassword !== undefined) {
      const validation = validatePassword(input.newPassword);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.errors.join("، ") },
          { status: 400 }
        );
      }
      data.password = await bcrypt.hash(input.newPassword, 12);
      data.mustChangePwd = true;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Serialize every operation that could change the active-admin set.
      // Serializable isolation alone does not make a count-then-update
      // invariant safe against write skew, so use one transaction advisory lock.
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext('active-admin-invariant'))
      `;
      const currentTarget = await tx.user.findUnique({
        where: { id: input.id },
        select: { role: true, isActive: true },
      });
      if (!currentTarget) {
        throw new Error("USER_NOT_FOUND_DURING_UPDATE");
      }
      const removesActiveAdmin =
        currentTarget.role === "ADMIN" &&
        currentTarget.isActive &&
        ((data.role !== undefined && data.role !== "ADMIN") ||
          data.isActive === false);
      if (removesActiveAdmin) {
        const remainingActiveAdmins = await tx.user.count({
          where: {
            id: { not: input.id },
            role: "ADMIN",
            isActive: true,
          },
        });
        if (remainingActiveAdmins === 0) {
          throw new LastActiveAdminError();
        }
      }

      const record = await tx.user.update({
        where: { id: input.id },
        data,
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
          mustChangePwd: true,
          electionKeyId: true,
        },
      });
      await writeAuditLog(tx, {
        userId: user.userId,
        username: user.username,
        action: "UPDATE",
        entity: "User",
        entityId: record.id,
        details: {
          changedFields: Object.keys(input).filter(
            (field) => field !== "id" && field !== "newPassword"
          ),
          passwordReset: input.newPassword !== undefined,
        },
      });
      return record;
    }, { isolationLevel: "Serializable", maxWait: 10_000, timeout: 20_000 });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof LastActiveAdminError) {
      return NextResponse.json(
        { error: "لا يمكن تعطيل أو خفض صلاحية آخر مدير نشط" },
        { status: 409 }
      );
    }
    if (isUniqueAccountConflict(error)) return accountConflictResponse();
    return handleApiError(error, "users-patch");
  }
}

export const GET = withAuth(getHandler, { GET: ["ADMIN"] });
export const POST = withAuth(postHandler, { POST: ["ADMIN"] });
export const PATCH = withAuth(patchHandler, { PATCH: ["ADMIN"] });
