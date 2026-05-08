import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let session;
  let sessionError: string | null = null;

  try {
    session = await auth();
  } catch (err) {
    sessionError = err instanceof Error ? err.message : String(err);
  }

  const user = session?.user ?? null;
  const sessionUserId = (user as { id?: string } | null)?.id ?? null;
  const sessionUserEmail = user?.email ?? null;

  let dbUserId: string | null = null;
  if (sessionUserEmail) {
    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUserEmail },
      select: { id: true },
    });
    dbUserId = dbUser?.id ?? null;
  }

  return NextResponse.json({
    ok: !sessionError && !!session,
    sessionError,
    sessionUserId,
    sessionUserEmail,
    dbUserId,
    resolvedUserId: sessionUserId ?? dbUserId,
  });
}
