import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalCompanies, alertsToday, users] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.alert.count({ where: { createdAt: { gte: today } } }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { companies: true, alerts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ totalUsers, totalCompanies, alertsToday, users });
}
