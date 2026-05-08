import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalCompanies, alertsToday, users] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.alert.count({ where: { createdAt: { gte: today } } }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { companies: true, alerts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-bold text-blue-700">ImmAlert</Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-600">Admin</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total utilizatori" value={totalUsers} icon="👥" />
          <StatCard label="Firme monitorizate" value={totalCompanies} icon="🏢" />
          <StatCard label="Alerte azi" value={alertsToday} icon="🔔" />
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Utilizatori ({totalUsers})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Firme</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Alerte</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Înregistrat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        {user.name && <p className="text-gray-400 text-xs">{user.name}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user._count.companies}</td>
                    <td className="px-4 py-3 text-gray-600">{user._count.alerts}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ro-RO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}
