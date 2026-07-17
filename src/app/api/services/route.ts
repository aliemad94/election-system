// ====================================================================
// /api/services — الخدمات (GET + POST + PUT)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import {
  createServiceSchema,
  updateServiceSchema,
  formatZodError,
} from "@/lib/validators";
import { getKeyUserScope, assertOwnsService, assertOwnsVoter } from "@/lib/scope-service";

// GET /api/services — قائمة الخدمات مع فلترة مع فرض نطاق الوصول
async function getHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    // تطبيق النطاق الصارم لـ KEY_USER
    if (user.role === "KEY_USER") {
      const scope = await getKeyUserScope(user.userId);
      if (!scope) {
        return NextResponse.json([], { status: 200 });
      }
      where.keyId = scope.keyId;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        electionKey: { select: { keyCode: true, firstName: true } },
        voter: {
          select: { firstName: true, fatherName: true },
        },
      },
    });

    const mapped = services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      status: s.status,
      priority: s.priority,
      cost: s.cost,
      estimatedVotesImpact: s.estimatedVotesImpact,
      assignedTo: s.assignedTo || "",
      keyId: s.keyId,
      keyCode: s.electionKey?.keyCode || "",
      voterId: s.voterId,
      voterName: s.voter
        ? `${s.voter.firstName} ${s.voter.fatherName}`
        : "",
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return handleApiError(error, "services-get");
  }
}

// POST /api/services — إنشاء خدمة
async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();

    if (user.role === "KEY_USER") {
      const scope = await getKeyUserScope(user.userId);
      if (!scope) {
        return NextResponse.json(
          { error: "غير مصرح - لا يملك صلاحية إنشاء خدمة لعدم وجود مفتاح مرتبط" },
          { status: 403 }
        );
      }
      body.keyId = scope.keyId;

      // التحقق من ملكية الناخب إن وُجد
      if (body.voterId) {
        try {
          await assertOwnsVoter(user.userId, body.voterId);
        } catch {
          return NextResponse.json(
            { error: "غير مصرح - الناخب المحدد لا ينتمي لنطاقك" },
            { status: 403 }
          );
        }
      }
    }

    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const service = await prisma.service.create({
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        status: d.status,
        priority: d.priority,
        cost: d.cost,
        estimatedVotesImpact: d.estimatedVotesImpact,
        assignedTo: d.assignedTo || null,
        keyId: d.keyId || null,
        voterId: d.voterId || null,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Service",
      entityId: service.id,
      details: { title: service.title, category: service.category },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return handleApiError(error, "services-post");
  }
}

// PUT /api/services — تحديث حالة/أولوية خدمة
async function putHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;
    const existing = await prisma.service.findUnique({
      where: { id },
      select: { id: true, title: true, keyId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "الخدمة غير موجودة" },
        { status: 404 }
      );
    }

    // التحقق من الملكية قبل التحديث لـ KEY_USER
    if (user.role === "KEY_USER") {
      try {
        await assertOwnsService(user.userId, id);
      } catch {
        return NextResponse.json(
          { error: "غير مصرح - لا تملك صلاحية تعديل هذه الخدمة" },
          { status: 403 }
        );
      }
      delete (updateData as any).keyId; // منع نقل الخدمة لمفتاح آخر
    }

    // إزالة الحقول الفارغة
    const cleanData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updateData)) {
      if (v !== undefined) cleanData[k] = v;
    }

    const updated = await prisma.service.update({
      where: { id },
      data: cleanData,
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Service",
      entityId: updated.id,
      details: { title: updated.title, changedFields: Object.keys(cleanData).join(", ") },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "services-put");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });
export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
