import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { userId },
    include: {
      company: { select: { id: true, cui: true, nume: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}
