import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  const session = req.auth;
  if (!session || (session.user as { role?: string }).role !== "admin") {
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
}) as unknown as () => Promise<Response>;
