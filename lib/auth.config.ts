// Edge Runtime safe — no Node.js imports (no Prisma, no pg, no bcrypt)
// Used only by middleware.ts so the middleware bundle stays Edge-compatible.

import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.subscriptionStatus = (user as { subscriptionStatus?: string }).subscriptionStatus;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        const u = session.user as unknown as Record<string, unknown>;
        u.id = token.id;
        u.role = token.role;
        u.subscriptionStatus = token.subscriptionStatus;
      }
      return session;
    },
  },
  providers: [],
};

export default authConfig;
