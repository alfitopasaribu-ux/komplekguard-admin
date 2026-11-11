"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, RefreshCw, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ReportDownloadPanel from "./ReportDownloadPanel";

type Mode = "week" | "month" | "year";
type Incident = {
  id: string; title: string; riskLevel: string | null; status: string;
  createdAt: string; latitude: number; longitude: number; address?: string | null;
  category?: { name?: string } | null;
};
type DashboardData = {
  stats: { totalAlerts: number; todayAlerts: number; monthAlerts: number; activeAlerts: number };
  byStatus: { status: string; count: number }[];
  byCategory: { categoryId: string | null; name: string; count: number }[];
  recentLogs: { id: string; description?: string | null; action: string; userName?: string; createdAt: string }[];
  recentAlerts: Incident[];
  charts: Record<Mode, { label: string; count: number }[]>;
};

const riskStyle: Record<string, string> = {
  KRITIS: "bg-[#fff0ed] text-[#bd3a2b]",
  TINGGI: "bg-[#fff0ed] text-[#bd3a2b]",
  SEDANG: "bg-[#fff5df] text-[#9f6c18]",
  RENDAH: "bg-[#e4f5ea] text-[#087d65]",
};
const fmt = (date: string) => new Date(date).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" });

function safeCoordinate(value: number, min: number, max: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

export default function DashboardStats({ user }: { user: { name?: string } | null }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("week");
  const [selected, setSelected] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error("Data monitoring tidak dapat dimuat.");
      setData(await response.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi gangguan jaringan.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const incidents = useMemo(() => data?.recentAlerts || [], [data]);
  const priority = incidents.filter((a) => a.status !== "SELESAI" && a.status !== "DIBATALKAN" && ["TINGGI", "KRITIS"].includes(a.riskLevel || ""));
  const mapped = incidents.filter((a) => safeCoordinate(a.latitude, -90, 90) && safeCoordinate(a.longitude, -180, 180));
  const picked = mapped.find((a) => a.id === selected) || mapped[0];
  const statCards = [
    { label: "Total laporan", value: data?.stats.totalAlerts ?? 0, caption: "Tercatat dalam sistem", icon: ShieldCheck, tone: "bg-[#e5f3e9] text-[#117c60]" },
    { label: "Perlu penanganan", value: data?.stats.activeAlerts ?? 0, caption: "Aktif atau sedang diproses", icon: Zap, tone: "bg-[#fff0df] text-[#ab741d]" },
    { label: "Laporan hari ini", value: data?.stats.todayAlerts ?? 0, caption: "Aktivitas terbaru", icon: CalendarDays, tone: "bg-[#e8f2fb] text-[#4a7a99]" },
    { label: "Laporan bulan ini", value: data?.stats.monthAlerts ?? 0, caption: "Dalam bulan berjalan", icon: TrendingUp, tone: "bg-[#eeebfa] text-[#7e68b5]" },
  ];
  const chart = data?.charts?.[mode] || [];
  const sectionClass = "rounded-[24px] border border-[#dfe9e1] bg-white p-5 shadow-[0_10px_35px_rgba(23,74,52,.035)] sm:p-7";
  const priorities = [...priority].sort((a, b) => (a.riskLevel === "KRITIS" ? -1 : 0) - (b.riskLevel === "KRITIS" ? -1 : 0));

  return <div className="space-y-6 text-[#173b30]">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#0c9a79]">Pusat keamanan lingkungan</p>
        <h1 className="text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Selamat datang, {user?.name?.split(" ")[0] || "Admin"} <span aria-hidden="true">👋</span></h1>
        <p className="mt-2 text-sm leading-6 text-[#769084]">Pantau laporan warga, respons, dan situasi terkini dari satu tempat.</p>
      </div>
      <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#d6e7db] bg-white px-4 py-3 text-sm font-semibold text-[#176c54] transition hover:bg-[#e9f6ed] disabled:opacity-50">
        <RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Perbarui data
      </button>
    </div>

    {error && <div role="alert" className="rounded-2xl border border-[#f4cec7] bg-[#fff3ef] p-4 text-sm text-[#aa493d]">{error} <button onClick={() => void refresh()} className="ml-2 underline">Coba lagi</button></div>}

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {statCards.map((s) => <div key={s.label} className="rounded-[22px] border border-[#dfe9e1] bg-white p-4 shadow-sm sm:p-6">
        <div className={`mb-5 grid h-11 w-11 place-items-center rounded-2xl ${s.tone}`}><s.icon size={22}/></div>
        <p className="text-xs font-semibold text-[#81988a] sm:text-sm">{s.label}</p>
        <p className="mt-1 text-3xl font-bold tracking-[-.05em] sm:text-4xl">{loading && !data ? "–" : s.value.toLocaleString("id-ID")}</p>
        <p className="mt-2 text-[11px] text-[#93a79a] sm:text-xs">{s.caption}</p>
      </div>)}
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <section className={sectionClass}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold">Tren laporan</h2><p className="mt-1 text-xs text-[#89a094]">Distribusi jumlah laporan berdasarkan periode</p></div>
          <div className="flex rounded-xl bg-[#edf5ee] p-1 text-xs font-bold">
            {([["week","Minggu"],["month","Bulan"],["year","Tahun"]] as const).map(([key,label]) =>
              <button key={key} onClick={() => setMode(key)} className={`rounded-lg px-3 py-2 transition ${mode === key ? "bg-[#087d65] text-white" : "text-[#72917f] hover:bg-white"}`}>{label}</button>)}
          </div>
        </div>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {mode === "week" ?
              <AreaChart data={chart}>
                <CartesianGrid stroke="#e7efea" strokeDasharray="4 5" vertical={false}/>
                <XAxis dataKey="label" stroke="#9bb3a4" tickLine={false} axisLine={false} fontSize={11}/>
                <YAxis allowDecimals={false} stroke="#9bb3a4" tickLine={false} axisLine={false} fontSize={11}/>
                <Tooltip/><Area dataKey="count" type="monotone" stroke="#0b9674" strokeWidth={3} fill="#ccefe0" dot={{ fill:"#0b9674", r:3 }}/>
              </AreaChart>
              : <BarChart data={chart}><CartesianGrid stroke="#e7efea" strokeDasharray="4 5" vertical={false}/>
                <XAxis dataKey="label" stroke="#9bb3a4" tickLine={false} axisLine={false} fontSize={11}/>
                <YAxis allowDecimals={false} stroke="#9bb3a4" tickLine={false} axisLine={false} fontSize={11}/>
                <Tooltip/><Bar dataKey="count" fill="#0b9674" radius={[7,7,0,0]}/></BarChart>}
          </ResponsiveContainer>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold">Perhatian prioritas</h2><p className="mt-1 text-xs text-[#89a094]">Laporan terkini berisiko tinggi</p></div>
          <span className="rounded-full bg-[#fff1ec] px-3 py-1.5 text-xs font-bold text-[#b84c38]">{priority.length} prioritas</span>
        </div>
        <div className="mt-5 space-y-3">
          {priorities.length === 0 ? <div className="flex min-h-[195px] flex-col items-center justify-center rounded-2xl bg-[#f3f9f2] text-center">
            <CheckCircle2 size={30} className="text-[#0b9674]"/><p className="mt-3 font-semibold">Belum ada laporan prioritas tinggi</p><p className="mt-1 text-xs text-[#8aa191]">Menampilkan 8 laporan paling baru.</p>
          </div> : priorities.slice(0,4).map((a) => <Link key={a.id} href={`/admin/alerts/${a.id}`} className="flex items-center gap-3 rounded-2xl border border-[#f5e4db] bg-[#fffaf6] p-3 transition hover:border-[#eebcad]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0e9] text-[#b4503d]"><AlertTriangle size={19}/></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{a.title}</span><span className="mt-1 block text-xs text-[#b58f7d]">{fmt(a.createdAt)}</span></span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${riskStyle[a.riskLevel || ""] || "bg-gray-100"}`}>{a.riskLevel || "Belum dinilai"}</span>
          </Link>)}
        </div>
        <Link href="/admin/alerts" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0b8668]">Lihat seluruh laporan <ArrowRight size={16}/></Link>
      </section>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <section className={sectionClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-lg font-bold"><MapPin className="text-[#0a896b]" size={21}/> Peta lokasi kejadian</h2><p className="mt-1 text-xs text-[#89a094]">Pilih laporan untuk melihat titik lokasinya</p></div>
          <span className="rounded-full bg-[#edf6ee] px-3 py-1.5 text-xs font-semibold text-[#16816a]">{mapped.length} titik terbaru</span>
        </div>
        {picked ? <>
          <div className="overflow-hidden rounded-2xl border border-[#dbe9e0]">
            <iframe title={`Peta lokasi ${picked.title}`} loading="lazy" className="h-[260px] w-full"
              referrerPolicy="no-referrer"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${picked.longitude-0.012}%2C${picked.latitude-0.008}%2C${picked.longitude+0.012}%2C${picked.latitude+0.008}&layer=mapnik&marker=${picked.latitude}%2C${picked.longitude}`}/>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {mapped.slice(0,6).map((a) => <button key={a.id} onClick={() => setSelected(a.id)}
              className={`max-w-[200px] truncate rounded-full border px-3 py-2 text-xs font-semibold ${picked.id === a.id ? "border-[#087d65] bg-[#087d65] text-white" : "border-[#d7e7db] text-[#376957] hover:bg-[#edf6ee]"}`}>{a.title}</button>)}
          </div>
          <Link href={`/admin/alerts/${picked.id}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0a8a6b]">Buka detail lokasi <ArrowRight size={15}/></Link>
        </> : <div className="flex h-[260px] flex-col items-center justify-center rounded-2xl bg-[#f3f8f4] text-[#8aa395]"><MapPin size={30}/><p className="mt-3 text-sm">Belum ada lokasi laporan terbaru</p></div>}
      </section>

      <section className={sectionClass}>
        <div className="mb-5 flex items-center justify-between">
          <div><h2 className="text-lg font-bold">Aktivitas terbaru</h2><p className="mt-1 text-xs text-[#89a094]">Jejak kegiatan sistem</p></div>
          <Link href="/admin/activity" className="text-xs font-bold text-[#0b8668]">Lihat semua</Link>
        </div>
        <div className="space-y-3">
          {(data?.recentLogs || []).slice(0,5).map((log) => <div key={log.id} className="flex items-start gap-3 border-b border-[#edf2ed] pb-3 last:border-b-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e9f5ed] text-[#12866a]"><Activity size={18}/></span>
            <div className="min-w-0"><p className="line-clamp-2 text-sm font-medium">{log.action === "ADMIN_LOGIN" ? "Login administrator" : log.action}</p>
              <p className="mt-1 text-xs text-[#819b8d]">{log.userName || "Sistem"} · {fmt(log.createdAt)}</p></div>
          </div>)}
          {!loading && !data?.recentLogs?.length && <p className="py-12 text-center text-sm text-[#8ba493]">Belum ada aktivitas tercatat.</p>}
        </div>
      </section>
    </div>

    <ReportDownloadPanel />
  </div>;
}
