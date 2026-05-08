import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthUserId } from "@/lib/session";

export async function GET() {
  const session = await auth();
  const userId = await getAuthUserId();
  return NextResponse.json({
    session,
    userId,
    userEmail: session?.user?.email ?? null,
    userIdFromSession: (session?.user as { id?: string } | undefined)?.id ?? null,
  });
}
