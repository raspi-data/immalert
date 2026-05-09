import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function isAdmin(session: { email: string; role: string } | null) {
  if (!session) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail ? session.email === adminEmail : session.role === "admin";
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID lipsă" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) return NextResponse.json({ error: "Utilizatorul nu există" }, { status: 404 });

  if (user.email === process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Nu poți șterge contul de admin" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
