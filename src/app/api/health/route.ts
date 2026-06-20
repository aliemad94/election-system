// نقطة فحص الصحة العامة (تُستثنى من middleware)
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "electoral-machine",
    governorate: "ذي قار",
    timestamp: new Date().toISOString(),
    version: "0.1.0-foundation",
  });
}

