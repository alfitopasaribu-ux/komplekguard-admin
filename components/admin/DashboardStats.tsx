"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, TrendingUp, Zap, ArrowUpRight, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import ReportDownloadPanel from "./ReportDownloadPanel";
import Link from "next/link";

type Mode = "minggu" | "bulan" | "tahun";

function Tooltip2({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a1020] px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 text-sm text-white/60">{payload[0].value} alert</p>
    </div>
  );
}

export default function DashboardStats({ user }: { user: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("minggu");

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const chartData = mode === "minggu" ? data?.charts?.week : mode === "bulan" ? data?.charts?.month : data?.charts?.year;
  const total = chartData?.reduce((s: number, i: any) => s + i.count, 0) ?? 0;
  const max = chartData?.reduce((h: any, i: any) => i.count > h.count ? i : h, { label: "", count: 0 });
  const avg = chartData?.length ? (total / chartData.length).toFixed(1) : "0";

  const stats = [
    { label: "Total Alert", value: data?.stats?.totalAlerts ?? 0, icon: AlertTriangle, color: "text-cyan-400", bg: "bg-cyan-400/10", sub: "Semua waktu" },
    { label: "Alert Hari Ini", value: data?.stats?.todayAlerts ?? 0, icon: CalendarDays, color: "text-emerald-400", bg: "bg-emerald-400/10", sub: format(new Date(), "dd MMM yyyy", { locale: localeId }) },
    { label: "Bulan Ini", value: data?.stats?.monthAlerts ?? 0, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-400/10", sub: `Rata-rata ${data?.stats?.avgPerWeek ?? 0}/minggu` },
    { label: "Sedang Aktif", value: data?.stats?.activeAlerts ?? 0, icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", sub: "Live sekarang" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Selamat Datang, {user?.name?.split(" ")[0] || "Admin"}</h1>
        <p className="mt-2 text-white/40">Ringkasan data alert keamanan kompleks perumahan</p>
      </div>

      <ReportDownloadPanel />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-6">
              {loading ? <div className="h-8 w-20 animate-pulse rounded bg-white/10" /> : <p className="text-3xl font-bold text-white">{s.value.toLocaleString("id-ID")}</p>}
              <p className="mt-2 text-sm font-medium text-white/60">{s.label}</p>
              <p className="mt-1 text-xs text-white/30">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Activity className="h-5 w-5 text-cyan-400" /> Grafik Alert Keamanan
            </h2>
            {!loading && (
              <p className="mt-2 text-sm text-white/40">
                Total: <span className="text-white font-semibold">{total} alert</span> •
                Rata-rata: <span className="text-white font-semibold">{avg} alert/periode</span>
                {max?.count > 0 && <> • Tertinggi: <span className="text-cyan-400 font-semibold">{max.label} ({max.count})</span></>}
              </p>
            )}
          </div>
          <div className="inline-flex overflow-hidden rounded-xl border border-white/10">
            {[["minggu","Per Minggu"],["bulan","Per Bulan"],["tahun","Per Tahun"]].map(([k,l]) => (
              <button key={k} onClick={() => setMode(k as Mode)} className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${mode === k ? "bg-cyan-500 text-black font-bold" : "text-white/40 hover:bg-white/5"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="h-72">
          {loading ? <div className="h-full animate-pulse rounded-2xl bg-white/5" /> : (
            <ResponsiveContainer width="100%" height="100%">
              {mode === "minggu" ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tooltip2 />} />
                  <Area type="monotone" dataKey="count" stroke="#00BCD4" fill="rgba(0,188,212,0.15)" strokeWidth={2} dot={{ r: 4, fill: "#00BCD4" }} activeDot={{ r: 6 }} />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tooltip2 />} />
                  <Bar dataKey="count" fill="#00BCD4" radius={[6,6,0,0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom 2 col */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white">Aktivitas Terkini</h3>
            <Link href="/admin/activity" className="text-sm text-cyan-400 hover:text-cyan-300">Lihat semua →</Link>
          </div>
          <div className="space-y-3">
            {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />) :
              (data?.recentLogs ?? []).slice(0,6).map((log: any) => (
                <div key={log.id} className="rounded-xl border border-white/5 p-3">
                  <p className="text-sm text-white font-medium">{log.description || log.action}</p>
                  <p className="text-xs text-white/30 mt-1">{log.userName} • {log.createdAt ? new Date(log.createdAt).toLocaleString("id-ID") : "-"}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-lg font-bold text-white mb-5">Kategori Terbanyak</h3>
          <div className="space-y-4">
            {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-white/5" />) :
              (data?.byCategory ?? []).slice(0,6).map((cat: any, i: number) => {
                const maxVal = data?.byCategory?.[0]?.count || 1;
                const pct = Math.round((cat.count / maxVal) * 100);
                return (
                  <div key={cat.categoryId || i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-white/70">{i+1}. {cat.name} <span className="text-white/30 text-xs">({cat.type})</span></p>
                      <p className="text-sm font-semibold text-white">{cat.count} alert</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
