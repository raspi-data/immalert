import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "dev-secret-change-in-prod";

export interface JWTPayload {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
