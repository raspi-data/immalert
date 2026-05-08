// Edge Runtime safe — no Node.js imports (no Prisma, no pg, no bcrypt)
// Used ONLY by middleware.ts. Contains only the authorized callback.
// jwt/session callbacks live in lib/auth.ts (not Edge-safe).

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
  },
  providers: [],
};

export default authConfig;
