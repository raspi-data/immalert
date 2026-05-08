import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getBilanturiIstorice } from "@/lib/anaf";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await ctx.params;
  const company = await prisma.company.findFirst({
    where: { id, userId: session.id },
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
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await ctx.params;
  const company = await prisma.company.findFirst({ where: { id, userId: session.id } });
  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
