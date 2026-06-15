import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

type SearchEntity = "voters" | "tribes" | "all";

async function searchHandler(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const entity = (searchParams.get("entity") as SearchEntity) ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    const results: any[] = [];
    const perEntity = entity === "all" ? Math.floor(limit / 2) : limit;

    if (entity === "voters" || entity === "all") {
      const voters = await prisma.voter.findMany({
        where: { OR: [{ name: { contains: query } }, { nationalId: { contains: query } }] },
        take: perEntity,
        select: { id: true, name: true, nationalId: true, checkedIn: true, tribe: { select: { name: true } } },
      });
      results.push(...voters.map((v) => ({
        entity: "voters", id: v.id, label: v.name,
        sublabel: `${v.nationalId} — ${v.tribe?.name ?? ""}${v.checkedIn ? " ✓" : ""}`,
      })));
    }

    if (entity === "tribes" || entity === "all") {
      const tribes = await prisma.tribe.findMany({
        where: { name: { contains: query } },
        take: perEntity,
        include: {
          voters: true,
        },
      });
      results.push(...tribes.map((t) => ({
        entity: "tribes", id: t.id, label: t.name, sublabel: `${t.voters.length} ناخب`,
      })));
    }

    return NextResponse.json({ results, total: results.length, query });
  } catch (error) {
    console.error("[search] failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

export const GET = withAuth(searchHandler, { GET: ["admin", "viewer", "operator"] });
