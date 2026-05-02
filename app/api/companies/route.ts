import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchFirmaByCode } from "@/lib/firmeapi";
import { z } from "zod";

const addSchema = z.object({
  cui: z.string().min(2).max(10).regex(/^\d+$/, "CUI trebuie să conțină doar cifre"),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const companies = await prisma.company.findMany({
    where: { userId: session.user.id },
    include: {
      alerts: {
        where: { citit: false },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { cui } = parsed.data;

    const existing = await prisma.company.findUnique({
      where: { cui_userId: { cui, userId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Firma este deja monitorizată" }, { status: 409 });
    }

    const firmaData = await fetchFirmaByCode(cui);
    if (!firmaData) {
      return NextResponse.json({ error: "CUI-ul nu a fost găsit" }, { status: 404 });
    }

    const company = await prisma.company.create({
      data: {
        cui,
        nume: firmaData.denumire,
        userId: session.user.id,
        dateAnaf: JSON.parse(JSON.stringify(firmaData)),
        lastChecked: new Date(),
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    console.error("Add company error:", err);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
