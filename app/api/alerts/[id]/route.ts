import { NextRequest, NextResponse } from "next/server";
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const alert = await prisma.alert.findFirst({ where: { id, userId } });
  if (!alert) return NextResponse.json({ error: "Alerta nu a fost găsită" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: { citit: true } });
  return NextResponse.json(updated);
}
