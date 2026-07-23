import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAuth, type AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { handleApiError, writeAuditLog } from "@/lib/security";
import { parsePagination } from "@/lib/pagination";

const trendSchema = z
  .object({
    indicatorType: z.enum([
      "مزاج_شعبي",
      "قضايا_ساخنة",
      "اتجاه_رأي",
      "قوة_خصوم",
    ]),
    value: z.string().trim().min(1).max(2000),
    numericValue: z.coerce.number().min(0).max(100),
    severity: z.enum(["إيجابي", "عادي", "سلبي"]),
    source: z.string().trim().min(1).max(200),
    region: z.string().trim().min(1).max(100).default("ذي قار"),
  })
  .strict();

function directionToSentiment(direction: "إيجابي" | "عادي" | "سلبي") {
  if (direction === "إيجابي") return "POSITIVE";
  if (direction === "سلبي") return "NEGATIVE";
  return "NEUTRAL";
}

function sentimentToDirection(sentiment: string) {
  if (sentiment === "POSITIVE") return "إيجابي";
  if (sentiment === "NEGATIVE") return "سلبي";
  return "عادي";
}

function parseTrendDetails(keywords: string): {
  indicatorType: string;
  value: string;
} {
  try {
    const parsed = JSON.parse(keywords) as {
      category?: unknown;
      description?: unknown;
    };
    if (
      typeof parsed.category === "string" &&
      typeof parsed.description === "string"
    ) {
      return {
        indicatorType: parsed.category,
        value: parsed.description,
      };
    }
  } catch {
    // سجلات قديمة قد تحتوي نصاً بدلاً من JSON.
  }
  return { indicatorType: "مزاج_شعبي", value: keywords };
}

async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 50);
    if (!pagination) {
      return NextResponse.json(
        { error: "معاملات ترقيم الصفحات غير صالحة" },
        { status: 400 }
      );
    }
    const { page, limit } = pagination;
    const [records, total] = await Promise.all([
      prisma.sentimentTrend.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sentimentTrend.count(),
    ]);

    return NextResponse.json({
      indicators: records.map((record) => {
        const details = parseTrendDetails(record.keywords);
        return {
          id: record.id,
          indicatorType: details.indicatorType,
          value: details.value,
          numericValue: Math.round(record.score * 1000) / 10,
          severity: sentimentToDirection(record.sentiment),
          source: record.source,
          region: record.region,
          recordedAt: record.createdAt,
        };
      }),
      total,
      page,
      limit,
    });
  } catch (error) {
    return handleApiError(error, "sentiment-trends-get");
  }
}

async function postHandler(
  request: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  try {
    const parsed = trendSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات الرصد غير صالحة" },
        { status: 400 }
      );
    }
    const input = parsed.data;
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.sentimentTrend.create({
        data: {
          source: input.source,
          sentiment: directionToSentiment(input.severity),
          keywords: JSON.stringify({
            category: input.indicatorType,
            description: input.value,
          }),
          score: input.numericValue / 100,
          region: input.region,
        },
      });
      await writeAuditLog(tx, {
        userId: user.userId,
        username: user.username,
        action: "CREATE",
        entity: "SentimentTrend",
        entityId: created.id,
        details: {
          category: input.indicatorType,
          direction: input.severity,
          score: input.numericValue,
          region: input.region,
        },
      });
      return created;
    });

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "sentiment-trends-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN"] });
