import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ sent: 0, pending: 0 });
}
export async function POST() {
  return NextResponse.json({ success: true });
}
