import DashboardStats from "@/components/admin/DashboardStats";
import { getServerSession } from "@/lib/auth";
export const metadata = { title: "Dashboard — KomplekGuard Admin" };
export default async function AdminPage() {
  const session = await getServerSession();
  return <DashboardStats user={session} />;
}
