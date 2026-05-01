import { NextRequest, NextResponse } from "next/server";
import { runDailyMonitoring } from "@/lib/monitoring";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  try {
    await runDailyMonitoring();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Eroare cron" }, { status: 500 });
  }
}
