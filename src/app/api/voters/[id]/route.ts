import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const voterId = params.id;
    const rawBody = await request.json();

    const updated = await prisma.voter.update({
      where: { id: voterId },
      data: {
        ...(rawBody.name !== undefined && { name: rawBody.name }),
        ...(rawBody.phone !== undefined && { phone: rawBody.phone }),
        ...(rawBody.checkedIn !== undefined && { checkedIn: rawBody.checkedIn }),
        ...(rawBody.checkedInAt !== undefined && { checkedInAt: rawBody.checkedInAt ? new Date(rawBody.checkedInAt) : null }),
      },
    });

    return NextResponse.json({
      ...updated,
      fullName: updated.name,
      phoneNumber: updated.phone,
    });
  } catch (error) {
    console.error("[voters-put] failed:", error);
    return NextResponse.json({ error: "Failed to update voter" }, { status: 500 });
  }
}

async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const voterId = params.id;
    await prisma.voter.delete({ where: { id: voterId } });
    return NextResponse.json({ success: true, message: "voter deleted successfully" });
  } catch (error) {
    console.error("[voters-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete voter" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator", "key_user"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });
