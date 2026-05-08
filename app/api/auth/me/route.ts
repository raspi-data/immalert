import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const COOKIE = "session_token";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  return NextResponse.json({ id: payload.id, email: payload.email, name: payload.name, role: payload.role });
}
