import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBilanturiIstorice } from "@/lib/anaf";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findFirst({
    where: { id, userId },
    include: {
      alerts: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findFirst({ where: { id, userId } });
  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
