import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const alert = await prisma.alert.findFirst({ where: { id, userId } });
  if (!alert) return NextResponse.json({ error: "Alerta nu a fost găsită" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: { citit: true } });
  return NextResponse.json(updated);
}
