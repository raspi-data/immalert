"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { companies: number; alerts: number };
}

interface CompanyRow {
  cui: string;
  nume: string;
  userCount: number;
  alertCount: number;
  lastChecked: string | null;
  tva: boolean;
  stare: string;
}

interface ActivityItem {
  type: string;
  timestamp: string;
  label: string;
  icon: string;
}

interface AdminData {
  stats: {
    totalUsers: number;
    newUsersLast30Days: number;
    activeUsersLast30Days: number;
    totalCompanies: number;
    totalAlerts: number;
    alertsToday: number;
    alertsLastWeek: number;
  };
  registrationsChart: { date: string; count: number }[];
  users: UserRow[];
  topCompanies: CompanyRow[];
  recentActivity: ActivityItem[];
  systemHealth: {
    dbConnected: boolean;
    companiesCheckedToday: number;
    lastCronRun: string | null;
    memoryMB: number;
  };
}

// ─── Bar chart (pure SVG, no external libs) ───────────────────────────────────

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const W = 600, H = 96, CHART_H = 76;
  const slotW = W / data.length;
  const barW = Math.max(slotW - 2, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 96 }}>
      {data.map((d, i) => {
        const bh = Math.round((d.count / max) * CHART_H);
        const x = i * slotW + 1;
        const y = CHART_H - bh;
        return (
          <g key={d.date}>
            <rect x={x} y={bh > 0 ? y : CHART_H} width={barW} height={Math.max(bh, 0)} fill="#16a34a" rx={2} opacity={0.85}>
              <title>{`${d.date}: ${d.count} utilizatori`}</title>
            </rect>
          </g>
        );
      })}
      {data.map((d, i) => {
        if (i % 5 !== 0 && i !== data.length - 1) return null;
        return (
          <text key={`l${i}`} x={i * slotW + slotW / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="#9ca3af">
            {d.date.slice(5).replace("-", "/")}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return ok
    ? <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{yes}</span>
    : <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">{no}</span>;
}

function StatCard({ label, value, sub, color = "green" }: { label: string; value: number | string; sub?: string; color?: string }) {
  const accent = color === "green" ? "border-l-4 border-green-500" : color === "blue" ? "border-l-4 border-blue-400" : "border-l-4 border-orange-400";
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm ${accent}`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const PAGE_SIZE = 20;

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminClient() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleDeleteUser(id: string, email: string) {
    if (!window.confirm(`Șterge definitiv contul "${email}" și toate datele asociate?`)) return;
    const res = await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (res.ok) { showToast(`Cont șters: ${email}`); load(); }
    else showToast(`Eroare: ${json.error}`);
  }

  async function handleRunCron() {
    setActionLoading("cron");
    const res = await fetch("/api/admin/run-cron", { method: "POST" });
    const json = await res.json();
    setActionLoading(null);
    showToast(res.ok ? "Verificare ANAF pornită cu succes!" : `Eroare: ${json.error}`);
    if (res.ok) setTimeout(load, 3000);
  }

  async function handleTestEmail() {
    setActionLoading("email");
    const res = await fetch("/api/admin/test-email", { method: "POST" });
    const json = await res.json();
    setActionLoading(null);
    showToast(res.ok ? `Email test trimis la ${json.sent_to}` : `Eroare: ${json.error}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Se încarcă datele admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">Eroare la încărcarea datelor</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={load} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            Reîncearcă
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, registrationsChart, users, topCompanies, recentActivity, systemHealth } = data;
  const displayedUsers = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-green-600">ImmAlert</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-700">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              ↻ Reîncarcă
            </button>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
              ← Înapoi la Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── 1. Stats cards ── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Statistici generale</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Utilizatori total" value={stats.totalUsers} color="green" />
            <StatCard label="Activi (30 zile)" value={stats.activeUsersLast30Days} sub="cu activitate recentă" color="green" />
            <StatCard label="Firme monitorizate" value={stats.totalCompanies} color="blue" />
            <StatCard label="Alerte total" value={stats.totalAlerts} color="orange" />
            <StatCard label="Alerte azi" value={stats.alertsToday} color="orange" />
            <StatCard label="Alerte (7 zile)" value={stats.alertsLastWeek} color="orange" />
          </div>
        </section>

        {/* ── 2. Chart ── */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Utilizatori noi — ultimele 30 zile</h2>
            <span className="text-xs text-gray-400 bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              +{stats.newUsersLast30Days} total
            </span>
          </div>
          <BarChart data={registrationsChart} />
        </section>

        {/* ── 3. Users table ── */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Utilizatori ({users.length})</h2>
            <span className="text-xs text-gray-400">Pagina {page + 1}/{totalPages}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Email / Nume</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Înregistrat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ult. activitate</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Firme</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Alerte</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{u.email}</p>
                      {u.name && <p className="text-xs text-gray-400">{u.name}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.updatedAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-800">{u._count.companies}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-800">{u._count.alerts}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge ok={u._count.companies > 0} yes="Activ" no="Inactiv" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Vezi firme
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                          Șterge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <span className="text-xs text-gray-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, users.length)} din {users.length}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Următor →
              </button>
            </div>
          )}
        </section>

        {/* ── 4. Top companies ── */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Top firme monitorizate</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">CUI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Denumire</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Useri</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">TVA</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Stare</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ult. verificare</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Alerte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topCompanies.map((c, i) => (
                  <tr key={`${c.cui}-${i}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.cui}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{c.nume}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {c.userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge ok={c.tva} yes="Plătitor" no="Neplătitor" />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.stare || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(c.lastChecked)}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-gray-700">{c.alertCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5 + 6: Activity + Health side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent activity */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Activitate recentă</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {recentActivity.length === 0 && (
                <li className="px-6 py-6 text-sm text-gray-400 text-center">Nicio activitate încă</li>
              )}
              {recentActivity.map((item, i) => (
                <li key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                  <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 font-medium truncate">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(item.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* System health */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Sănătate sistem</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              <HealthRow
                label="Bază de date"
                value={<Badge ok={systemHealth.dbConnected} yes="Conectat" no="Deconectat" />}
              />
              <HealthRow
                label="Firme verificate azi"
                value={<span className="text-sm font-semibold text-gray-900">{systemHealth.companiesCheckedToday}</span>}
              />
              <HealthRow
                label="Ultima rulare cron"
                value={<span className="text-xs text-gray-600">{fmtDateTime(systemHealth.lastCronRun)}</span>}
              />
              <HealthRow
                label="Memorie RAM (RSS)"
                value={<span className="text-sm font-semibold text-gray-900">{systemHealth.memoryMB} MB</span>}
              />
              <HealthRow
                label="Total utilizatori"
                value={<span className="text-sm font-semibold text-gray-900">{stats.totalUsers}</span>}
              />
              <HealthRow
                label="Total firme"
                value={<span className="text-sm font-semibold text-gray-900">{stats.totalCompanies}</span>}
              />
            </ul>
          </section>
        </div>

        {/* ── 7. Quick actions ── */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Acțiuni rapide</h2>
          <div className="flex flex-wrap gap-3">
            <ActionBtn
              label="Rulează verificare ANAF acum"
              icon="⚙️"
              loading={actionLoading === "cron"}
              onClick={handleRunCron}
              variant="primary"
            />
            <ActionBtn
              label="Trimite email test"
              icon="📧"
              loading={actionLoading === "email"}
              onClick={handleTestEmail}
              variant="secondary"
            />
            <ActionBtn
              label="Export utilizatori CSV"
              icon="⬇️"
              onClick={() => { window.location.href = "/api/admin/export/users"; }}
              variant="secondary"
            />
            <ActionBtn
              label="Export firme CSV"
              icon="⬇️"
              onClick={() => { window.location.href = "/api/admin/export/companies"; }}
              variant="secondary"
            />
          </div>
        </section>

      </main>
    </div>
  );
}

// ─── Mini components ──────────────────────────────────────────────────────────

function HealthRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="px-6 py-3 flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      {value}
    </li>
  );
}

function ActionBtn({
  label, icon, loading = false, onClick, variant,
}: {
  label: string;
  icon: string;
  loading?: boolean;
  onClick: () => void;
  variant: "primary" | "secondary";
}) {
  const base = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50";
  const styles = variant === "primary"
    ? `${base} bg-green-600 text-white hover:bg-green-700`
    : `${base} border border-gray-200 text-gray-700 hover:bg-gray-50`;

  return (
    <button onClick={onClick} disabled={loading} className={styles}>
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : <span>{icon}</span>}
      {label}
    </button>
  );
}
