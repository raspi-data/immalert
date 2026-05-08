import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBilanturiIstorice } from "@/lib/anaf";
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

export const GET = auth(async function GET(req: NextAuthRequest, ctx: { params?: Promise<{ id: string }> }) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await (ctx.params as Promise<{ id: string }>);
  const company = await prisma.company.findFirst({
    where: { id, userId },
    include: { alerts: { orderBy: { createdAt: "desc" }, take: 50 } },
  });

  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  let bilant = null;
  try {
    bilant = await getBilanturiIstorice(parseInt(company.cui, 10), 5);
  } catch {
    // Non-critical
  }

  return NextResponse.json({ ...company, bilant });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

export const DELETE = auth(async function DELETE(req: NextAuthRequest, ctx: { params?: Promise<{ id: string }> }) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await (ctx.params as Promise<{ id: string }>);
  const company = await prisma.company.findFirst({ where: { id, userId } });
  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
