"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavUser {
  email: string;
  name?: string | null;
  role: string;
}

export function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/settings", label: "Setări", icon: "settings" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin", icon: "admin_panel_settings" }] : []),
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="bg-white border-b border-surface-variant sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-display font-bold text-lg text-primary-container">
            ImmAlert
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-surface-container text-primary-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-outline hidden sm:block">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            <span className="hidden sm:inline">Ieșire</span>
          </button>
        </div>
      </div>
    </header>
  );
}
