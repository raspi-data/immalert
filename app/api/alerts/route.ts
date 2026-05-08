import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextAuthRequest } from "next-auth";

async function resolveUserId(req: NextAuthRequest): Promise<string | null> {
  const session = req.auth;
  if (!session?.user) return null;
  if (session.user.id) return session.user.id;
  const email = session.user.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export const GET = auth(async function GET(req: NextAuthRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { userId },
    include: { company: { select: { id: true, cui: true, nume: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}) as unknown as () => Promise<Response>;
