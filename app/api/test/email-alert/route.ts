import { NextResponse } from "next/server";
import { sendAlertEmail } from "@/lib/resend";

const TEST_EMAIL = "enea.emanuel@gmail.com";

export async function GET() {
  try {
    await sendAlertEmail(
      TEST_EMAIL,
      "OXIGEN DATA S.R.L.",
      [
        {
          field: "tva",
          oldValue: "Neplătitor TVA",
          newValue: "Plătitor TVA",
        },
      ],
      "test-company-id-40428805",
      "IMPORTANT"
    );
    return NextResponse.json({ ok: true, sent_to: TEST_EMAIL });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
