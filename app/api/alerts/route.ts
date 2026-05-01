import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    include: {
      company: { select: { id: true, cui: true, nume: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}
