"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type ThemeMode = "light" | "dark";

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("kg-theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const m = getPreferredTheme();
    setMode(m);
    document.documentElement.classList.toggle("dark", m === "dark");
  }, []);

  const toggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("kg-theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
      aria-label="Toggle theme"
      title={mode === "dark" ? "Light mode" : "Dark mode"}
    >
      {mode === "dark" ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-cyan-300" />}
    </button>
  );
}

