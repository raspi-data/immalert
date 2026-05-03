import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    session,
    user: session?.user ?? null,
    userId: (session?.user as { id?: string } | undefined)?.id ?? null,
    userEmail: session?.user?.email ?? null,
  });
}
