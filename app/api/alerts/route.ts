import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  let userId = session.user.id;
  if (userId) return userId;

  const email = session.user.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { userId },
    include: {
      company: { select: { id: true, cui: true, nume: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}
