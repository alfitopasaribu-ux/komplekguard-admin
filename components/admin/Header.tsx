"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, AlertTriangle, LayoutDashboard, Menu, ShieldCheck, UserRound, X } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-30 border-b border-[#e1eae1] bg-white/95 backdrop-blur">
      <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#86a193]">Admin workspace</p>
          <p className="mt-1 text-sm font-semibold text-[#224e40]">{format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-[#d4e8db] bg-[#eaf6ed] px-4 py-2 text-xs font-semibold text-[#087d65] sm:inline-flex">
            <ShieldCheck size={15}/> Akses {user?.role || "ADMIN"}
          </span>
          <Link href="/admin/profile" className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe9de] bg-[#f4f8f4] text-[#0e795f]" aria-label="Profil administrator">
            <UserRound size={18}/>
          </Link>
          <button onClick={() => setOpen(v => !v)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#087d65] text-white lg:hidden" aria-label={open ? "Tutup navigasi" : "Buka navigasi"}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Navigasi administrator seluler" className="grid grid-cols-2 gap-2 border-t border-[#e2ece4] bg-white px-4 py-3 lg:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl bg-[#eff7f0] px-3 py-3 text-sm font-semibold text-[#165b47]"><Icon size={17}/> {label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
