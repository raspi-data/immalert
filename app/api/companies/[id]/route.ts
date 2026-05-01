import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findFirst({
    where: { id, userId: session.user.id },
    include: {
      alerts: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  return NextResponse.json(company);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
