// ====================================================================
// /api/tasks — إدارة المهام الميدانية (GET + POST + PUT)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (district) where.district = district;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        targetVoter: {
          select: {
            id: true,
            firstName: true,
            fatherName: true,
            grandfatherName: true,
            fourthName: true,
            phone: true,
            supportDegree: true,
          },
        },
        assignedTo: {
          select: { id: true, fullName: true, district: true },
        },
      },
    });

    const mappedTasks = tasks.map((t) => {
      const voterName = t.targetVoter
        ? [
            t.targetVoter.firstName,
            t.targetVoter.fatherName,
            t.targetVoter.grandfatherName,
            t.targetVoter.fourthName,
          ]
          .filter(Boolean)
          .join(" ")
        : "";

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        taskType: t.taskType,
        district: t.district,
        impactEstimate: t.impactEstimate,
        dueDate: t.dueDate?.toISOString() || null,
        targetVoter: t.targetVoter
          ? {
              id: t.targetVoter.id,
              fullName: voterName,
              phoneNumber: t.targetVoter.phone || "",
              confidenceScore: t.targetVoter.supportDegree,
            }
          : null,
        assignedTo: t.assignedTo
          ? {
              id: t.assignedTo.id,
              name: t.assignedTo.fullName,
              district: t.assignedTo.district,
            }
          : null,
        createdAt: t.createdAt.toISOString(),
      };
    });

    const counts = await prisma.task.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusCounts = counts.map((c) => ({
      status: c.status,
      count: c._count.id,
    }));

    return NextResponse.json({ tasks: mappedTasks, statusCounts });
  } catch (error) {
    return handleApiError(error, "tasks-get");
  }
}

async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      priority,
      status,
      taskType,
      district,
      impactEstimate,
      targetVoterId,
      assignedToId,
      dueDate,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "عنوان المهمة حقل مطلوب" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "NORMAL",
        status: status || "PENDING",
        taskType: taskType || "FIELD",
        district: district || null,
        impactEstimate: impactEstimate || null,
        targetVoterId: targetVoterId || null,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    if (assignedToId) {
      await prisma.volunteer.update({
        where: { id: assignedToId },
        data: { totalAssignedTasks: { increment: 1 } },
      });
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Task",
      entityId: task.id,
      details: { title: task.title },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error, "tasks-post");
  }
}

async function putHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json(
        { error: "معرف المهمة مطلوب" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    // إذا اكتملت المهمة، نزيد عدّاد المهام المكتملة للمتطوع
    if (status === "COMPLETED") {
      const task = await prisma.task.findUnique({
        where: { id },
        select: { assignedToId: true },
      });
      if (task?.assignedToId) {
        await prisma.volunteer.update({
          where: { id: task.assignedToId },
          data: { totalCompletedTasks: { increment: 1 } },
        });
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Task",
      entityId: id,
      details: { fields: Object.keys(updateData).join(', ') },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "tasks-put");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });
export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });

