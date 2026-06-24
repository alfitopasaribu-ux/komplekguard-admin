import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, image: true },
  });
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#070d1a] overflow-hidden">
      <AdminSidebar user={{ ...session, image: dbUser?.image }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader user={session} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#070d1a]">{children}</main>
      </div>
    </div>
  );
}
