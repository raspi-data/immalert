import { NextResponse } from "next/server";
import { sendPasswordChangedEmail } from "@/lib/resend";

const TEST_EMAIL = "enea.emanuel@gmail.com";

export async function GET() {
  try {
    await sendPasswordChangedEmail(TEST_EMAIL);
    return NextResponse.json({ ok: true, sent_to: TEST_EMAIL });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
