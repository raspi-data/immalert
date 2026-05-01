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
    { href: "/dashboard/settings", label: "Setări" },
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
      ? "bg-green-100 text-green-700"
      : user.subscriptionStatus === "trial"
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-700";

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-blue-700">
            ImmAlert
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Ieșire
          </button>
        </div>
      </div>
    </header>
  );
}
