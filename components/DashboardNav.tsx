"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavUser {
  email: string;
  name?: string | null;
  role: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/dashboard/alerts", label: "Alerte", icon: "notifications", exact: false },
  { href: "/dashboard/settings", label: "Setări", icon: "settings", exact: false },
];

const ADMIN_ITEM = { href: "/admin", label: "Admin", icon: "admin_panel_settings", exact: false };

function NavItem({
  href, label, icon, active,
}: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg transition-all duration-200 group w-full ${
        active
          ? "bg-primary-container/40 text-primary"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      }`}
    >
      <span
        className="material-symbols-outlined transition-all duration-200"
        style={{
          fontSize: 22,
          fontVariationSettings: active ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        }}
      >
        {icon}
      </span>
      <span className="text-[10px] font-semibold leading-none tracking-wide">{label}</span>
    </Link>
  );
}

export function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const items = [
    ...NAV_ITEMS,
    ...(user.role === "admin" ? [ADMIN_ITEM] : []),
  ];

  function isActive(item: typeof NAV_ITEMS[0]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-16 bg-surface border-r border-surface-variant z-40">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center flex-shrink-0 border-b border-surface-variant">
          <Link href="/dashboard" title="ImmAlert">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                monitoring
              </span>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col items-center gap-1 p-2 pt-4 overflow-y-auto">
          {items.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item)} />
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-2 pb-4 border-t border-surface-variant flex flex-col items-center gap-2">
          <div
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0"
            title={user.email}
          >
            <span className="text-xs font-bold text-primary">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-all duration-200 w-full"
            title="Ieșire"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            <span className="text-[10px] font-semibold">Ieșire</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-surface-variant flex items-stretch">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200 ${
              isActive(item) ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                fontVariationSettings: isActive(item) ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
              }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-on-surface-variant"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>logout</span>
          <span className="text-[10px] font-semibold">Ieșire</span>
        </button>
      </nav>
    </>
  );
}
