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

export const PATCH = auth(async function PATCH(req: NextAuthRequest, ctx: { params?: Promise<{ id: string }> }) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await (ctx.params as Promise<{ id: string }>);
  const alert = await prisma.alert.findFirst({ where: { id, userId } });
  if (!alert) return NextResponse.json({ error: "Alerta nu a fost găsită" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: { citit: true } });
  return NextResponse.json(updated);
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
