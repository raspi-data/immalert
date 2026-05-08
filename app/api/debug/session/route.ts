import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  return NextResponse.json({
    ok: !!session,
    session,
  });
}
