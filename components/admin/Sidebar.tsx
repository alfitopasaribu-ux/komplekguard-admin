"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, AlertTriangle, ChevronRight, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

const navigation = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/admin/alerts", label: "Laporan Warga", icon: AlertTriangle },
  { href: "/admin/activity", label: "Log Aktivitas", icon: Activity },
  { href: "/admin/profile", label: "Profil Admin", icon: UserRound },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/login");
      router.refresh();
      toast.success("Anda telah keluar.");
    } catch {
      toast.error("Gagal keluar. Silakan coba lagi.");
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-[#dce8dd] bg-[#f0f6ee] text-[#153e32] dark:border-[#345345] dark:bg-[#10261c] dark:text-[#e3f4e8]">
      <div className="flex items-center gap-3 border-b border-[#dce8dd] dark:border-[#345345] px-5 py-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#087d65] text-white shadow-sm"><ShieldCheck size={26}/></span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight">KomplekGuard <span className="text-[#0b9978]">AI</span></p>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7b9b8a] dark:text-[#96bca2]">Admin workspace</p>
        </div>
      </div>

      <div className="px-5 pb-2 pt-7 text-[11px] font-bold uppercase tracking-[.2em] text-[#8aa293] dark:text-[#96bca2]">Workspace</div>
      <nav aria-label="Navigasi administrator" className="flex-1 space-y-1.5 px-3 py-2">
        {navigation.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link href={href} key={href} aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${active ? "bg-[#087d65] text-white shadow-sm" : "text-[#648075] hover:bg-white hover:text-[#14513e] dark:text-[#a4c0ad] dark:hover:bg-[#1e3b2b] dark:hover:text-[#d8f4e1]"}`}>
              <Icon size={19} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={16}/>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#dce8dd] dark:border-[#345345] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#deebdf] bg-white dark:border-[#365849] dark:bg-[#1d3829] px-3 py-3">
          {user?.image
            ? <img src={user.image} alt="Avatar administrator" className="h-10 w-10 shrink-0 rounded-xl object-cover"/>
            : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e0f3e6] font-bold text-[#087d65]">{String(user?.name || "A").charAt(0).toUpperCase()}</span>}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user?.name || "Administrator"}</p>
            <p className="text-xs text-[#829e8c] dark:text-[#acc7b4]">{user?.role || "ADMIN"}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#ae4b45] dark:text-[#ffaca3] hover:bg-[#fae9e6] dark:hover:bg-[#442d2b]">
          <LogOut size={18}/> Keluar dari sistem
        </button>
      </div>
    </aside>
  );
}
