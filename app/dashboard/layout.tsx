import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = {
    email: session.email,
    name: session.name ?? null,
    role: session.role,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      {/* lg: offset left for sidebar; mobile: offset bottom for nav bar */}
      <main className="lg:ml-16 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
