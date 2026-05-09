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

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { companies: true, alerts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    "ID,Email,Nume,Rol,Data Inregistrare,Ultima Activitate,Firme Monitorizate,Alerte Primite",
    ...users.map(u =>
      [
        u.id,
        `"${u.email}"`,
        `"${u.name ?? ""}"`,
        u.role,
        u.createdAt.toISOString().slice(0, 10),
        u.updatedAt.toISOString().slice(0, 10),
        u._count.companies,
        u._count.alerts,
      ].join(",")
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="immalert-utilizatori-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
