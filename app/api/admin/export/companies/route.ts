import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function isAdmin(session: { email: string; role: string } | null) {
  if (!session) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail ? session.email === adminEmail : session.role === "admin";
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    select: {
      cui: true,
      nume: true,
      createdAt: true,
      lastChecked: true,
      dateAnaf: true,
      user: { select: { email: true } },
      _count: { select: { alerts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    "CUI,Denumire,User,Data Adaugare,Ultima Verificare,TVA,Stare,Alerte Generate",
    ...companies.map(c => {
      const anaf = c.dateAnaf as Record<string, unknown> | null;
      return [
        c.cui,
        `"${c.nume}"`,
        `"${c.user.email}"`,
        c.createdAt.toISOString().slice(0, 10),
        c.lastChecked ? c.lastChecked.toISOString().slice(0, 10) : "",
        anaf?.tva ? "Platitor" : "Neplatitor",
        `"${String(anaf?.stare ?? "")}"`,
        c._count.alerts,
      ].join(",");
    }),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="immalert-firme-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
