import { NextRequest, NextResponse } from "next/server";
import { runDailyMonitoring, runFullMonitoring } from "@/lib/monitoring";

/**
 * GET /api/cron
 *
 * Called daily at 06:00 by your scheduler (Railway Cron / Vercel Cron / external).
 * Requires header: x-cron-secret: <NEXTAUTH_SECRET>
 *
 * Query params:
 *   ?full=true  — forces all 5 sources to run regardless of day/month
 *
 * Railway cron setup example:
 *   Command:  curl -s -X GET https://your-domain.com/api/cron \
 *               -H "x-cron-secret: $NEXTAUTH_SECRET"
 *   Schedule: 0 6 * * *   (daily at 06:00)
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const full = req.nextUrl.searchParams.get("full") === "true";

  try {
    if (full) {
      await runFullMonitoring();
    } else {
      await runDailyMonitoring();
    }

    return NextResponse.json({
      success: true,
      mode: full ? "full" : "daily",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron] Unhandled error:", err);
    return NextResponse.json({ error: "Eroare cron" }, { status: 500 });
  }
}
