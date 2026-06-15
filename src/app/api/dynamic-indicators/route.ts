import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ gsi: 0, edri: 0 });
}
