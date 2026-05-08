import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { userId: session.id },
    include: { company: { select: { id: true, cui: true, nume: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}
