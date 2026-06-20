// نقطة جذر API — معلومات المنظومة
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    system: "منظومة الماكينة الانتخابية المركزية",
    governorate: "ذي قار",
    stage: "foundation",
    docs: "/api/health",
  });
}

