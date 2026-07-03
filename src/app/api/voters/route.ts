// ====================================================================
// /api/voters — الناخبون (GET مع pagination + فلترة + POST)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { createVoterSchema, formatZodError } from "@/lib/validators";

// GET /api/voters — pagination + search + filters
async function getHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") ?? "50"))
    );
    const tribeId = searchParams.get("tribeId");
    const district = searchParams.get("district");
    const votedStatus = searchParams.get("votedStatus");
    const status = searchParams.get("status");
    const keyId = searchParams.get("keyId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (tribeId) where.tribeId = tribeId;
    if (district && district !== "all") where.district = district;
    if (keyId) where.keyId = keyId;
    if (status) where.status = status;
    if (votedStatus === "voted") where.votedOnDay = true;
    else if (votedStatus === "not_voted") where.votedOnDay = false;

    // KEY_USER يرى ناخبي مفتاحه فقط
    if (user.role === "KEY_USER") {
      const key = await prisma.electionKey.findFirst({
        where: { phone: user.username },
        select: { id: true },
      });
      where.keyId = key?.id || "none";
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { fatherName: { contains: q, mode: "insensitive" } },
        { grandfatherName: { contains: q, mode: "insensitive" } },
        { fourthName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { nationalId: { contains: q, mode: "insensitive" } },
      ];
    }

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tribe: { select: { name: true } },
          electionKey: { select: { keyCode: true, firstName: true } },
        },
      }),
      prisma.voter.count({ where }),
    ]);

    const mapped = voters.map((v) => ({
      id: v.id,
      fullName: [
        v.firstName,
        v.fatherName,
        v.grandfatherName,
        v.fourthName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
      firstName: v.firstName,
      fatherName: v.fatherName,
      grandfatherName: v.grandfatherName,
      fourthName: v.fourthName,
      gender: v.gender,
      phone: v.phone || "",
      nationalId: v.nationalId,
      district: v.district,
      subDistrict: v.subDistrict,
      pollingCenter: v.pollingCenter,
      ballotStation: v.ballotStation,
      status: v.status,
      supportDegree: v.supportDegree,
      supportReason: v.supportReason,
      votedOnDay: v.votedOnDay,
      checkedIn: v.checkedIn,
      checkedInAt: v.checkedInAt?.toISOString() || null,
      keyId: v.keyId,
      keyCode: v.electionKey?.keyCode || "",
      tribeId: v.tribeId,
      tribeName: v.tribe?.name || "غير محدد",
      relationship: v.relationship,
      influenceRate: v.influenceRate,
      lastContactDate: v.lastContactDate?.toISOString() || null,
      createdAt: v.createdAt.toISOString(),
      socialMedia: v.socialMedia || null,
      specialization: v.specialization,
    }));

    return NextResponse.json({ voters: mapped, total, page, limit });
  } catch (error) {
    return handleApiError(error, "voters-get");
  }
}

// POST /api/voters — إنشاء ناخب
async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();
    const parsed = createVoterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const birthDate = d.dateOfBirth ? new Date(d.dateOfBirth) : new Date("1990-01-01");

    // التحقق من تكرار الهاتف
    if (d.phone) {
      const phoneExists = await prisma.voter.findFirst({
        where: { phone: d.phone },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: `رقم الهاتف مسجل مسبقاً للناخب ${phoneExists.firstName} ${phoneExists.fatherName} تحت المفتاح ${phoneExists.electionKey?.firstName || "غير معروف"}` },
          { status: 400 }
        );
      }
    }

    // التحقق من تكرار الهوية الوطنية
    if (d.nationalId) {
      const nationalIdExists = await prisma.voter.findFirst({
        where: { nationalId: d.nationalId },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (nationalIdExists) {
        return NextResponse.json(
          { error: `رقم الهوية الوطنية مسجل مسبقاً للناخب ${nationalIdExists.firstName} ${nationalIdExists.fatherName} تحت المفتاح ${nationalIdExists.electionKey?.firstName || "غير معروف"}` },
          { status: 400 }
        );
      }
    }

    // التحقق من وجود المفتاح (اختياري الآن)
    if (d.keyId) {
      const keyExists = await prisma.electionKey.findUnique({
        where: { id: d.keyId },
        select: { id: true },
      });
      if (!keyExists) {
        return NextResponse.json(
          { error: "المفتاح الانتخابي المحدد غير موجود" },
          { status: 400 }
        );
      }
    }

    const voter = await prisma.voter.create({
      data: {
        firstName: d.firstName,
        fatherName: d.fatherName,
        grandfatherName: d.grandfatherName,
        fourthName: d.fourthName,
        gender: d.gender,
        birthDate,
        phone: d.phone ?? undefined,
        nationalId: d.nationalId || null,
        district: d.district,
        subDistrict: d.subDistrict,
        area: d.area || null,
        pollingCenter: d.pollingCenter,
        ballotStation: d.ballotStation,
        keyId: d.keyId ?? '',
        tribeId: d.tribeId || null,
        subTribeId: d.subTribeId || null,
        status: d.status,
        supportDegree: d.supportDegree,
        supportReason: d.supportReason || null,
        profession: d.profession || null,
        education: d.education || null,
        specialization: d.specialization || null,
        maritalStatus: d.maritalStatus || null,
        familySize: d.familySize || null,
        relationship: d.relationship || null,
        influenceRate: d.influenceRate,
        latitude: d.latitude || null,
        gpsVerified: d.gpsVerified,
        socialMedia: d.socialMedia || null,
        checkedIn: d.checkedIn,
        checkedInAt: d.checkedInAt ? new Date(d.checkedInAt) : null,
      },
      include: { tribe: { select: { name: true } } },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Voter",
      entityId: voter.id,
      details: { name: voter.firstName, keyId: voter.keyId },
    });

    const fullName = [
      voter.firstName,
      voter.fatherName,
      voter.grandfatherName,
      voter.fourthName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return NextResponse.json(
      { ...voter, fullName, tribeName: (voter as any).tribe?.name || "غير محدد" },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "voters-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

