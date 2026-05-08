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
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
