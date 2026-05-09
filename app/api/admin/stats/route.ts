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

  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsersLast30Days,
    totalAlerts,
    alertsToday,
    alertsLastWeek,
    companiesCheckedToday,
    lastCronEntry,
    usersLast30DaysRaw,
    allUsers,
    companiesRaw,
    recentAlerts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.alert.count(),
    prisma.alert.count({ where: { createdAt: { gte: today } } }),
    prisma.alert.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.company.count({ where: { lastChecked: { gte: today } } }),
    prisma.company.findFirst({
      where: { lastChecked: { not: null } },
      orderBy: { lastChecked: "desc" },
      select: { lastChecked: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { companies: true, alerts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
      select: {
        cui: true,
        nume: true,
        dateAnaf: true,
        lastChecked: true,
        createdAt: true,
        userId: true,
        _count: { select: { alerts: true } },
      },
    }),
    prisma.alert.findMany({
      select: {
        id: true,
        createdAt: true,
        tipAlerta: true,
        company: { select: { nume: true, cui: true } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Chart: registrations per day (last 30 days)
  const regByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    regByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const u of usersLast30DaysRaw) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (key in regByDay) regByDay[key]++;
  }
  const registrationsChart = Object.entries(regByDay).map(([date, count]) => ({ date, count }));

  // Top companies by number of users monitoring
  const cuiMap: Record<string, {
    cui: string; nume: string; userCount: number; alertCount: number;
    lastChecked: Date | null; tva: boolean; stare: string;
  }> = {};
  for (const c of companiesRaw) {
    const anaf = c.dateAnaf as Record<string, unknown> | null;
    if (!cuiMap[c.cui]) {
      cuiMap[c.cui] = {
        cui: c.cui, nume: c.nume, userCount: 0, alertCount: 0,
        lastChecked: null, tva: Boolean(anaf?.tva), stare: String(anaf?.stare ?? "—"),
      };
    }
    cuiMap[c.cui].userCount++;
    cuiMap[c.cui].alertCount += c._count.alerts;
    if (c.lastChecked && (!cuiMap[c.cui].lastChecked || c.lastChecked > cuiMap[c.cui].lastChecked!)) {
      cuiMap[c.cui].lastChecked = c.lastChecked;
    }
  }
  const topCompanies = Object.values(cuiMap).sort((a, b) => b.userCount - a.userCount).slice(0, 20);

  // Recent activity: merge users, companies, alerts sorted by time
  const recentCompanies = companiesRaw
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  const recentUsers = allUsers.slice(0, 10);

  const activity = [
    ...recentUsers.map(u => ({
      type: "user_registered", timestamp: u.createdAt,
      label: `User nou înregistrat: ${u.email}`, icon: "👤",
    })),
    ...recentCompanies.map(c => ({
      type: "company_added", timestamp: c.createdAt,
      label: `Firmă adăugată: ${c.nume} (CUI ${c.cui})`, icon: "🏢",
    })),
    ...recentAlerts.map(a => ({
      type: "alert_sent", timestamp: a.createdAt,
      label: `Alertă ${a.tipAlerta}: ${a.company.nume} → ${a.user.email}`, icon: "🔔",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return NextResponse.json({
    stats: {
      totalUsers,
      newUsersLast30Days: usersLast30DaysRaw.length,
      activeUsersLast30Days,
      totalCompanies: companiesRaw.length,
      totalAlerts,
      alertsToday,
      alertsLastWeek,
    },
    registrationsChart,
    users: allUsers,
    topCompanies,
    recentActivity: activity,
    systemHealth: {
      dbConnected: true,
      companiesCheckedToday,
      lastCronRun: lastCronEntry?.lastChecked ?? null,
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
}
