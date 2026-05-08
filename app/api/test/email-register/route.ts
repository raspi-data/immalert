import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";

const TEST_EMAIL = "enea.emanuel@gmail.com";

export async function GET() {
  try {
    await sendWelcomeEmail(TEST_EMAIL, "Emanuel");
    return NextResponse.json({ ok: true, sent_to: TEST_EMAIL });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
