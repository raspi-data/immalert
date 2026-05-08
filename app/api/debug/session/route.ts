import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  const session = req.auth;

  const sessionUserId = session?.user?.id ?? null;
  const sessionUserEmail = session?.user?.email ?? null;

  let dbUserId: string | null = null;
  if (sessionUserEmail) {
    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUserEmail },
      select: { id: true },
    });
    dbUserId = dbUser?.id ?? null;
  }

  return NextResponse.json({
    ok: !!session,
    sessionUserId,
    sessionUserEmail,
    dbUserId,
    resolvedUserId: sessionUserId ?? dbUserId,
    fullSession: session,
  });
}) as unknown as () => Promise<Response>;
