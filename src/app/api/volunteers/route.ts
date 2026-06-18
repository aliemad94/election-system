import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/volunteers - Returns all volunteers
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(volunteers);
  } catch (error) {
    console.error("[volunteers-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve volunteers" }, { status: 500 });
  }
}

// POST /api/volunteers - Creates a new volunteer
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { fullName, phone, email, role, district, area, notes } = body;

    if (!fullName || !phone || !role) {
      return NextResponse.json({ error: "الاسم الكامل والهاتف والدور حقول مطلوبة" }, { status: 400 });
    }

    // Check if phone number is already registered to avoid duplication
    const existing = await prisma.volunteer.findUnique({
      where: { phone },
    });
    if (existing) {
      return NextResponse.json({ error: "رقم الهاتف مسجل لمتطوع آخر مسبقاً" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        fullName,
        phone,
        email: email || null,
        role,
        district: district || null,
        area: area || null,
        notes: notes || null,
        efficiencyScore: 100, // New volunteers start with 100% efficiency
      },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("[volunteers-post] failed:", error);
    return NextResponse.json({ error: "Failed to create volunteer" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
