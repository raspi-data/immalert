import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { NextAuthRequest } from "next-auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Parola nouă trebuie să aibă minim 6 caractere"),
});

async function resolveUserId(req: NextAuthRequest): Promise<string | null> {
  const session = req.auth;
  if (!session?.user) return null;
  if (session.user.id) return session.user.id;
  const email = session.user.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export const POST = auth(async function POST(req: NextAuthRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Parola actuală este incorectă" }, { status: 400 });

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}) as unknown as (req: Request) => Promise<Response>;
