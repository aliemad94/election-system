// ====================================================================
// /api/electoral-keys — المفاتيح الانتخابية (GET + POST مع كود تلقائي)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { createElectionKeySchema, formatZodError } from "@/lib/validators";

// GET /api/electoral-keys — قائمة المفاتيح مع فلترة وبحث
async function getHandler(req: NextRequest, { user }: any) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const search = searchParams.get("search");
    const tribeId = searchParams.get("tribeId");

    const where: Record<string, unknown> = {};

    if (district && district !== "all") {
      where.district = district;
    }
    if (tribeId) {
      where.tribeId = tribeId;
    }

    // KEY_USER يرى مفتاحه فقط
    if (user.role === "KEY_USER") {
      where.phone = user.username;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { fatherName: { contains: q, mode: "insensitive" } },
        { grandfatherName: { contains: q, mode: "insensitive" } },
        { fourthName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { keyCode: { contains: q, mode: "insensitive" } },
      ];
    }

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? parseInt(pageParam, 10) : null;
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    const findOptions: any = {
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tribe: { select: { name: true } },
        _count: { select: { voters: true } },
      },
    };

    if (page && limit) {
      findOptions.skip = (page - 1) * limit;
      findOptions.take = limit;
    }

    const [keys, total] = await Promise.all([
      prisma.electionKey.findMany(findOptions),
      page && limit ? prisma.electionKey.count({ where }) : Promise.resolve(0),
    ]);

    const result = (keys as any[]).map((k) => ({
      id: k.id,
      keyCode: k.keyCode,
      fullName: [k.firstName, k.fatherName, k.grandfatherName, k.fourthName]
        .filter(Boolean)
        .join(" ")
        .trim(),
      firstName: k.firstName,
      fatherName: k.fatherName,
      grandfatherName: k.grandfatherName,
      fourthName: k.fourthName,
      gender: k.gender,
      phone: k.phone,
      district: k.district,
      subDistrict: k.subDistrict,
      pollingCenter: k.pollingCenter,
      expectedVotes: k.expectedVotes,
      influenceLevel: k.influenceLevel,
      mobilizationCap: k.mobilizationCap,
      loyaltyScore: k.loyaltyScore,
      riskLevel: k.riskLevel,
      tribeId: k.tribeId,
      tribeName: k.tribe?.name || "غير محدد",
      voterCount: k._count.voters,
      createdAt: k.createdAt.toISOString(),
      socialMedia: k.socialMedia || null,
    }));

    if (page && limit) {
      return NextResponse.json({ keys: result, total, page, limit });
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "electoral-keys-get");
  }
}

// POST /api/electoral-keys — إنشاء مفتاح مع توليد كود تلقائي (retry لمنع التضارب)
async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const parsed = createElectionKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const birthDate = d.dateOfBirth
      ? new Date(d.dateOfBirth)
      : new Date("1980-01-01");

    // توليد كود تلقائي متسلسل مع retry
    let key = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const maxKey = await prisma.electionKey.aggregate({
        _max: { keyCode: true },
      });
      const maxCodeStr = maxKey._max.keyCode;
      let maxSeq = 0;
      if (maxCodeStr) {
        const num = parseInt(maxCodeStr, 10);
        if (!isNaN(num)) maxSeq = num;
      }
      const generatedCode = String(maxSeq + 1);

      try {
        key = await prisma.electionKey.create({
          data: {
            keyCode: generatedCode,
            firstName: d.firstName,
            fatherName: d.fatherName,
            grandfatherName: d.grandfatherName,
            fourthName: d.fourthName,
            gender: d.gender,
            birthDate,
            education: d.education,
            profession: d.profession,
            phone: d.phone,
            province: "ذي قار",
            district: d.district,
            subDistrict: d.subDistrict,
            pollingCenter: d.pollingCenter,
            expectedVotes: d.expectedVotes,
            influenceLevel: d.influenceLevel,
            mobilizationCap: d.mobilizationCap,
            loyaltyScore: d.loyaltyScore,
            riskLevel: d.riskLevel,
            tribeId: d.tribeId || null,
            socialMedia: d.socialMedia || null,
          },
        });
        break;
      } catch {
        attempts++;
      }
    }

    if (!key) {
      return NextResponse.json(
        { error: "فشل توليد كود فريد للمفتاح" },
        { status: 500 }
      );
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "ElectionKey",
      entityId: key.id,
      details: { keyCode: key.keyCode, name: key.firstName },
    });

    return NextResponse.json(key, { status: 201 });
  } catch (error) {
    return handleApiError(error, "electoral-keys-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

