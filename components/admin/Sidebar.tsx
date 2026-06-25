"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, AlertTriangle, Activity, LogOut, Shield, ChevronRight, User } from "lucide-react";
import { toast } from "sonner";

const nav = [
  { href: "/admin/profile", icon: User, label: "Profil" },
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/alerts", icon: AlertTriangle, label: "Data Alert" },
  { href: "/admin/activity", icon: Activity, label: "Log Aktivitas" },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Berhasil logout");
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen bg-[#0a1020] border-r border-white/5 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">{user?.name || "KomplekGuard AI"}</p>
            <p className="text-xs text-white/30 mt-0.5 font-mono">{user?.role || "Admin Panel"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${active ? "bg-cyan-500 text-black" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-black" : "text-white/30 group-hover:text-white/60"}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.03]">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex-shrink-0 overflow-hidden">
            {user?.image ? (
              <img src={user.image} alt="avatar" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase() || "A"}</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/30 truncate font-mono">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
