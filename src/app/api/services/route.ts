import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/services - Returns all service requests
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = services.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      serviceType: s.category,
      priority: s.priority,
      status: s.status,
      assignedTo: s.assignedTo || "",
      estimatedCost: s.cost,
      estimatedVotesImpact: s.estimatedVotesImpact,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[services-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve services" }, { status: 500 });
  }
}

// POST /api/services - Creates a new service request
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { title, description, serviceType, priority, status, assignedTo, estimatedCost, estimatedVotesImpact } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان الطلب الخدمي حقل مطلوب" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description: description || "",
        category: serviceType || "MUNICIPAL",
        priority: priority || "NORMAL",
        status: status || "PENDING",
        assignedTo: assignedTo || null,
        cost: parseFloat(estimatedCost) || 0.0,
        estimatedVotesImpact: parseInt(estimatedVotesImpact) || 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[services-post] failed:", error);
    return NextResponse.json({ error: "Failed to create service request" }, { status: 500 });
  }
}

// PUT /api/services - Updates a service request's status
async function putHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "معرف الخدمة والحالة حقول مطلوبة" }, { status: 400 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[services-put] failed:", error);
    return NextResponse.json({ error: "Failed to update service status" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
export const PUT = withAuth(putHandler, { PUT: ["admin", "operator"] });
