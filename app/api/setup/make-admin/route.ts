import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time endpoint: GET /api/setup/make-admin?secret=NEXTAUTH_SECRET&email=...
// After use, remove this file or the secret protects it.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const email = req.nextUrl.searchParams.get("email");

  if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Parametrul email lipsește" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: `Utilizatorul ${email} nu există. Înregistrează-te mai întâi.` },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  return NextResponse.json({
    success: true,
    message: `${email} este acum admin.`,
    user: { id: user.id, email: user.email, role: "admin" },
  });
}
