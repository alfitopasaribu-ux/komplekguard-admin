"use client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AdminHeader({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="h-14 bg-white dark:bg-[#0a1020] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 flex-shrink-0">
      <p className="text-sm text-gray-500 dark:text-white/40 font-mono">
        {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}
      </p>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition">
          <Bell className="w-4 h-4 text-gray-400 dark:text-white/40" />
        </button>
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-yellow-400" />
              : <Moon className="w-4 h-4 text-gray-500" />}
          </button>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-mono text-gray-600 dark:text-white/40">
          {user?.role}
        </div>
      </div>
    </header>
  );
}
