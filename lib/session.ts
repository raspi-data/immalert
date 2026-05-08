import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  if (userId) return userId;

  const email = session.user.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}
