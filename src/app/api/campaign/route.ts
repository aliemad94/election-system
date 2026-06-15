import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ efficiencyScore: 0, costPerVoter: 0 });
}
