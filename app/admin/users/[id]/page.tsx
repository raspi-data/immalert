import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = session?.role === "admin" || (adminEmail ? session?.email === adminEmail : false);
  if (!session || !isAdmin) redirect("/");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      companies: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { alerts: true } },
        },
      },
    },
  });

  if (!user) redirect("/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-green-700">ImmAlert Admin</span>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Înapoi la Admin
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Firme monitorizate de{" "}
              <span className="text-green-700">{user.email}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Cont creat la {new Date(user.createdAt).toLocaleDateString("ro-RO")}
              {user.name ? ` · ${user.name}` : ""}
              {" · "}
              <span
                className={`font-medium ${
                  user.role === "admin" ? "text-green-700" : "text-gray-600"
                }`}
              >
                {user.role === "admin" ? "Admin" : "Utilizator"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{user.companies.length}</p>
            <p className="text-sm text-gray-500">
              {user.companies.length === 1 ? "firmă" : "firme"}
            </p>
          </div>
        </div>

        {/* Table */}
        {user.companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-gray-500">Niciun utilizator nu monitorizează firme</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    CUI
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Denumire
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Adăugată
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ultima verificare
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Alerte
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {user.companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-700">{company.cui}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{company.nume}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(company.createdAt).toLocaleDateString("ro-RO")}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {company.lastChecked
                        ? new Date(company.lastChecked).toLocaleDateString("ro-RO")
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {company._count.alerts > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          {company._count.alerts}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
