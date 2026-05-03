import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBilanturiIstorice } from "@/lib/anaf";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
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
    // Non-critical — bilant data is informational only
  }

  return NextResponse.json({ ...company, bilant });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findFirst({ where: { id, userId } });
  if (!company) return NextResponse.json({ error: "Firma nu a fost găsită" }, { status: 404 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
