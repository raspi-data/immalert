import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/resend";

function isAdmin(session: { email: string; role: string } | null) {
  if (!session) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail ? session.email === adminEmail : session.role === "admin";
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return NextResponse.json({ error: "ADMIN_EMAIL not set" }, { status: 500 });

  try {
    await sendWelcomeEmail(adminEmail, "Admin");
    return NextResponse.json({ ok: true, sent_to: adminEmail });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
