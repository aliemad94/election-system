// نقطة فحص الصحة العامة (تُستثنى من middleware)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Run a quick query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      system: "electoral-machine",
      governorate: "ذي قار",
      timestamp: new Date().toISOString(),
      version: "0.1.0-foundation",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

