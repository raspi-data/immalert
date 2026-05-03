import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const alert = await prisma.alert.findFirst({ where: { id, userId } });
  if (!alert) return NextResponse.json({ error: "Alerta nu a fost găsită" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: { citit: true } });
  return NextResponse.json(updated);
}
