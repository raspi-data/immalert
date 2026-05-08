import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "./jwt";

const COOKIE = "session_token";

export type { JWTPayload };

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getSessionFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
