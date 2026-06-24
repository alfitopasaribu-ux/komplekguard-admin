"use client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Bell, Shield } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminHeader({ user }: { user: any }) {

  return (
    <header className="h-14 bg-[#0a1020] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
      <p className="text-sm text-white/40 font-mono">
        {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}
      </p>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
          <Bell className="w-4 h-4 text-white/40" />
        </button>
        <ThemeToggle />

        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-white/60 font-mono text-xs">{user?.role}</span>
        </div>
      </div>
    </header>
  );
}
