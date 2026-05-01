"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavUser {
  email: string;
  name?: string | null;
  role: string;
  subscriptionStatus: string;
}

export function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/alerts", label: "Alerte" },
    { href: "/dashboard/settings", label: "Setari" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const statusLabel =
    user.subscriptionStatus === "trial"
      ? "Trial gratuit"
      : user.subscriptionStatus === "active"
      ? "Activ"
      : "Expirat";

  const statusColor =
    user.subscriptionStatus === "active"
      ? "bg-[--color-success-bg] text-[--color-success]"
      : user.subscriptionStatus === "trial"
      ? "bg-[--color-brand-light] text-[--color-brand]"
      : "bg-[--color-danger-bg] text-[--color-danger]";

  return (
    <header className="bg-white border-b border-[--color-border] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <Link href="/dashboard" className="text-lg font-bold text-[--color-brand]">
            ImmAlert
          </Link>
          <nav className="hidden sm:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[--color-brand-light] text-[--color-brand]"
                    : "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="text-sm text-[--color-muted] hidden sm:block">{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors"
          >
            Iesire
          </button>
        </div>
      </div>
    </header>
  );
}
