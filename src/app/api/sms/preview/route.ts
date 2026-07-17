// ====================================================================
// /api/sms/preview — استرجاع عينة من الناخبين المطابقين للفلاتر للمعاينة
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";

async function getHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district") || undefined;
    const tribeId = searchParams.get("tribeId") || undefined;
    const supportDegreesStr = searchParams.get("supportDegrees") || "";
    const votedStr = searchParams.get("voted") || "";

    const where: any = {
      deletedAt: null,
    };

    if (district) {
      where.district = district;
    }
    if (tribeId) {
      where.tribeId = tribeId;
    }

    if (supportDegreesStr) {
      const degrees = supportDegreesStr
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => !isNaN(n));
      if (degrees.length > 0) {
        where.supportDegree = { in: degrees };
      }
    }

    if (votedStr === "true") {
      where.votedOnDay = true;
    } else if (votedStr === "false") {
      where.votedOnDay = false;
    }

    // 1. حساب إجمالي عدد المستهدفين المطابقين
    const totalCount = await prisma.voter.count({
      where: {
        ...where,
        phone: { not: null },
      },
    });

    // 2. جلب عينة من 5 ناخبين للمعاينة
    const voters = await prisma.voter.findMany({
      where: {
        ...where,
        phone: { not: null },
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        fatherName: true,
        grandfatherName: true,
        fourthName: true,
        phone: true,
        district: true,
        pollingCenter: true,
        tribe: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedVoters = voters.map((v) => {
      const fullName = [v.firstName, v.fatherName, v.grandfatherName, v.fourthName]
        .filter(Boolean)
        .join(" ");

      // إخفاء أرقام الهاتف بشكل جزئي للأمن
      let formattedPhone = v.phone || "";
      if (formattedPhone.length > 6) {
        formattedPhone = formattedPhone.substring(0, 4) + " *** " + formattedPhone.substring(formattedPhone.length - 3);
      }

      return {
        id: v.id,
        fullName,
        phone: formattedPhone,
        district: v.district,
        pollingCenter: v.pollingCenter,
        tribeName: v.tribe?.name || "غير محدد",
      };
    });

    return NextResponse.json({
      totalCount,
      voters: formattedVoters,
    });
  } catch (error) {
    return handleApiError(error, "sms-preview-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER"],
});

