"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Activity, AlertTriangle, LayoutDashboard, LogOut, Menu, Moon, ShieldCheck, Sun, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/alerts", label: "Laporan", icon: AlertTriangle },
  { href: "/admin/activity", label: "Aktivitas", icon: Activity },
  { href: "/admin/profile", label: "Profil", icon: UserRound },
];

export default function AdminHeader({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar dari sistem.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e1eae1] bg-white/95 text-[#153e32] backdrop-blur dark:border-[#345447] dark:bg-[#14261f]/95 dark:text-[#eaf6ee]">
      <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-10">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#86a193] dark:text-[#90b8a2]">Admin workspace</p>
          <p className="mt-1 truncate text-xs font-semibold text-[#224e40] sm:text-sm dark:text-[#e4f5e8]">{format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-[#d4e8db] bg-[#eaf6ed] px-4 py-2 text-xs font-semibold text-[#087d65] dark:border-[#365c46] dark:bg-[#264b36] dark:text-[#a5eed1] md:inline-flex">
            <ShieldCheck size={15}/> Akses {user?.role || "ADMIN"}
          </span>
          <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} disabled={!mounted}
            aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            title={isDark ? "Mode terang" : "Mode gelap"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe9de] bg-[#f4f8f4] text-[#0e795f] transition hover:bg-[#e7f3e9] disabled:opacity-50 dark:border-[#395748] dark:bg-[#213d2d] dark:text-[#b6eace] dark:hover:bg-[#2b4b38]">
            {mounted ? (isDark ? <Sun size={20}/> : <Moon size={20}/>) : <span className="h-4 w-4 rounded-full bg-[#d6e7d9]"/>}
          </button>
          <Link href="/admin/profile" className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe9de] bg-[#f4f8f4] text-[#0e795f] dark:border-[#395748] dark:bg-[#213d2d] dark:text-[#b6eace]" aria-label="Profil administrator">
            <UserRound size={18}/>
          </Link>
          <button type="button" onClick={() => setOpen(v => !v)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#087d65] text-white lg:hidden" aria-label={open ? "Tutup navigasi" : "Buka navigasi"} aria-expanded={open}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Navigasi administrator seluler" className="grid grid-cols-2 gap-2 border-t border-[#e2ece4] bg-white px-4 py-3 dark:border-[#345447] dark:bg-[#14261f] lg:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl bg-[#eff7f0] px-3 py-3 text-sm font-semibold text-[#165b47] dark:bg-[#23412f] dark:text-[#d1f0dc]"><Icon size={17}/> {label}</Link>
          ))}
          <button type="button" onClick={() => void logout()} disabled={signingOut} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#edcbc4] bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[#b2493d] dark:border-[#795047] dark:bg-[#3b2826] dark:text-[#ffb8ab]">
            <LogOut size={17}/> {signingOut ? "Keluar..." : "Keluar dari sistem"}
          </button>
        </nav>
      )}
    </header>
  );
}
