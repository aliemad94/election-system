// ====================================================================
// /api/system-logs — استرداد سجلات التدقيق الإدارية (ADMIN فقط)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";

async function getHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        userId: true,
        username: true,
        action: true,
        entity: true,
        entityId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    const formattedLogs = logs.map(log => {
      let parsedDetails = null;
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {
          parsedDetails = log.details;
        }
      }
      return {
        ...log,
        details: parsedDetails,
      };
    });

    return NextResponse.json({ success: true, logs: formattedLogs });
  } catch (error) {
    return handleApiError(error, "system-logs-get");
  }
}

export const GET = withAuth(getHandler, { GET: ["ADMIN"] });
