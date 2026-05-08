import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchFirmaByCode } from "@/lib/firmeapi";
import { z } from "zod";
import type { NextAuthRequest } from "next-auth";

const addSchema = z.object({
  cui: z.string().min(2).max(10).regex(/^\d+$/, "CUI trebuie să conțină doar cifre"),
});

async function resolveUserId(req: NextAuthRequest): Promise<string | null> {
  const session = req.auth;

  console.log("=== AUTH DEBUG ===");
  console.log("session:", JSON.stringify(session));
  console.log("session.user:", JSON.stringify(session?.user));
  console.log("session.user.id:", session?.user?.id);
  console.log("session.user.email:", session?.user?.email);

  if (!session?.user) return null;

  if (session.user.id) return session.user.id;

  const email = session.user.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  console.log("Found userId via email:", user?.id);
  return user?.id ?? null;
}

export const GET = auth(async function GET(req: NextAuthRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const companies = await prisma.company.findMany({
      where: { userId },
      include: {
        alerts: { where: { citit: false }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(companies);
  } catch (err) {
    console.error("Get companies error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Eroare internă: ${message}` }, { status: 500 });
  }
}) as unknown as () => Promise<Response>;

export const POST = auth(async function POST(req: NextAuthRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { cui } = parsed.data;

    const existing = await prisma.company.findUnique({
      where: { cui_userId: { cui, userId } },
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
        userId,
        dateAnaf: JSON.parse(JSON.stringify(firmaData)),
        lastChecked: new Date(),
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    console.error("Add company error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Eroare internă: ${message}` }, { status: 500 });
  }
}) as unknown as (req: Request) => Promise<Response>;
