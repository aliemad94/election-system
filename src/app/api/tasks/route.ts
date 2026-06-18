import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/tasks - Returns all tasks matching filters, along with status counts
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const status = searchParams.get("status");

    const where: Record<string, any> = {};
    if (district) {
      where.district = district;
    }
    if (status) {
      where.status = status;
    }

    // Retrieve tasks with related voter and volunteer details
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
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            district: true,
          }
        }
      }
    });

    // Format tasks for the frontend mapping
    const mappedTasks = tasks.map(t => {
      const voterName = t.targetVoter 
        ? [t.targetVoter.firstName, t.targetVoter.fatherName, t.targetVoter.grandfatherName, t.targetVoter.fourthName].filter(Boolean).join(" ")
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
        targetVoter: t.targetVoter ? {
          id: t.targetVoter.id,
          fullName: voterName,
          phoneNumber: t.targetVoter.phone || "",
          confidenceScore: t.targetVoter.supportDegree,
        } : null,
        assignedTo: t.assignedTo ? {
          id: t.assignedTo.id,
          name: t.assignedTo.fullName,
          district: t.assignedTo.district,
        } : null,
        createdAt: t.createdAt.toISOString(),
      };
    });

    // Retrieve aggregate status counts
    const counts = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const statusCounts = counts.map(c => ({
      status: c.status,
      _count: { id: c._count.id }
    }));

    return NextResponse.json({
      tasks: mappedTasks,
      statusCounts,
    });
  } catch (error) {
    console.error("[tasks-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve tasks" }, { status: 500 });
  }
}

// POST /api/tasks - Creates a new task
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { title, description, priority, status, taskType, district, impactEstimate, targetVoterId, assignedToId } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان المهمة حقل مطلوب" }, { status: 400 });
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
      },
    });

    // Increment assigned task count for volunteer
    if (assignedToId) {
      await prisma.volunteer.update({
        where: { id: assignedToId },
        data: {
          totalAssignedTasks: { increment: 1 }
        }
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[tasks-post] failed:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
