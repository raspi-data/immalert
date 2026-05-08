import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await ctx.params;
  const alert = await prisma.alert.findFirst({ where: { id, userId: session.id } });
  if (!alert) return NextResponse.json({ error: "Alerta nu a fost găsită" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: { citit: true } });
  return NextResponse.json(updated);
}
