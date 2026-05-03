// Edge-safe helper: get authenticated userId from session.
// Tries session.user.id first (set by our session callback), then falls back
// to a DB lookup by email (email is always in the JWT as token.email).
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  // Fast path — session callback set it
  const id = (session.user as { id?: string }).id;
  if (id) return id;

  // Fallback: look up by email (email is always in the JWT)
  const email = session.user.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}
