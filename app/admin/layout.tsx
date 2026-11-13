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
    select: { id: true, name: true, email: true, role: true, image: true, isActive: true },
  });

  if (!dbUser?.isActive || !["ADMIN", "KETUA_RT"].includes(dbUser.role)) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f7f9f5] text-[#163c32] transition-colors dark:bg-[#0c1118] dark:text-[#f0f4fa] lg:flex">
      <div className="hidden w-[260px] shrink-0 lg:block">
        <div className="sticky top-0 h-screen"><AdminSidebar user={dbUser} /></div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader user={dbUser}/>
        <main className="w-full flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
