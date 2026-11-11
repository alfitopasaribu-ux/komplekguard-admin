"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, Filter, MapPin, RefreshCw, Search, ShieldCheck } from "lucide-react";

type Alert = {
  id: string; title: string; createdAt: string; status: string; riskLevel: string | null;
  address?: string | null; customCategory?: string | null; user?: { name?: string } | null;
  category?: { name?: string } | null;
};
const statuses = ["", "AKTIF", "DIPROSES", "SELESAI", "DIBATALKAN"];
const risks = ["", "KRITIS", "TINGGI", "SEDANG", "RENDAH"];
const riskColors: Record<string, string> = {
  KRITIS: "bg-[#fff0eb] dark:bg-[#20392b] text-[#ba4439] dark:text-[#ffc2b4]", TINGGI: "bg-[#fff0eb] dark:bg-[#20392b] text-[#ba4439] dark:text-[#ffc2b4]",
  SEDANG: "bg-[#fff4dd] dark:bg-[#20392b] text-[#a1711d] dark:text-[#ffc2b4]", RENDAH: "bg-[#e3f4e8] dark:bg-[#20392b] text-[#0c8a69] dark:text-[#82dfb3]",
};
const statusColors: Record<string, string> = {
  AKTIF: "bg-[#ffedea] dark:bg-[#20392b] text-[#b44736] dark:text-[#ffc2b4]", DIPROSES: "bg-[#fff2dd] dark:bg-[#20392b] text-[#a3751b] dark:text-[#ffc2b4]",
  SELESAI: "bg-[#e1f4e8] dark:bg-[#20392b] text-[#128267] dark:text-[#82dfb3]", DIBATALKAN: "bg-[#edf1ee] dark:bg-[#20392b] text-[#789184] dark:text-[#82dfb3]",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), search, ...(status && { status }), ...(risk && { riskLevel: risk }) });
      const response = await fetch(`/api/alerts?${params}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Laporan belum bisa dimuat. Coba lagi.");
      const result = await response.json();
      setAlerts(result.alerts || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gangguan jaringan");
    } finally { setLoading(false); }
  }, [page, search, status, risk]);
  useEffect(() => { void load(); }, [load]);

  const select = "h-11 rounded-xl border border-[#dce8dd] dark:border-[#345345] bg-white dark:bg-[#172b22] px-4 text-sm font-semibold text-[#416f5c] dark:text-[#82dfb3] outline-none focus:border-[#0c9675]";
  return <div className="space-y-6 text-[#173c32] dark:text-[#eaf6ed]">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#0b9875] dark:text-[#82dfb3]">Monitoring warga</p>
        <h1 className="text-3xl font-bold tracking-[-.045em] sm:text-4xl">Data laporan kejadian</h1>
        <p className="mt-2 text-sm text-[#7a9587] dark:text-[#82dfb3]">Temukan laporan, tinjau hasil analisis AI, lokasi, dan respons warga.</p>
      </div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dce8dd] dark:border-[#345345] bg-white dark:bg-[#172b22] px-4 text-sm font-semibold text-[#16836a] dark:text-[#82dfb3] disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Segarkan</button>
    </div>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-[#dce8df] dark:border-[#345345] bg-white dark:bg-[#172b22] p-5"><ShieldCheck size={21} className="text-[#0b886a] dark:text-[#82dfb3]"/><p className="mt-3 text-3xl font-bold">{total.toLocaleString("id-ID")}</p><p className="mt-1 text-xs text-[#8aa092] dark:text-[#82dfb3]">Total sesuai filter</p></div>
      <div className="rounded-2xl border border-[#dce8df] dark:border-[#345345] bg-white dark:bg-[#172b22] p-5"><AlertTriangle size={21} className="text-[#c58b30] dark:text-[#ffc2b4]"/><p className="mt-3 text-3xl font-bold">{alerts.filter(a => a.status === "AKTIF").length}</p><p className="mt-1 text-xs text-[#8aa092] dark:text-[#82dfb3]">Aktif pada halaman ini</p></div>
      <div className="col-span-2 rounded-2xl border border-[#dce8df] dark:border-[#345345] bg-white dark:bg-[#172b22] p-5 md:col-span-1"><Clock3 size={21} className="text-[#5992a1] dark:text-[#b5cbbd]"/><p className="mt-3 text-3xl font-bold">{alerts.length}</p><p className="mt-1 text-xs text-[#8aa092] dark:text-[#82dfb3]">Ditampilkan saat ini</p></div>
    </div>

    <div className="rounded-[24px] border border-[#dce8df] dark:border-[#345345] bg-white dark:bg-[#172b22] p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold"><Filter size={17} className="text-[#0b886a] dark:text-[#82dfb3]"/> Cari & saring laporan</div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a99a] dark:text-[#82dfb3]"/>
          <input aria-label="Cari judul atau pelapor" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari judul laporan atau nama pelapor..."
            className="h-11 w-full rounded-xl border border-[#dce8dd] dark:border-[#345345] bg-[#f9fbf8] dark:bg-[#20392b] pl-11 pr-4 text-sm text-[#174032] dark:text-[#eaf6ed] outline-none focus:border-[#0c9675]"/>
        </div>
        <select aria-label="Filter status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={select}>
          {statuses.map(s => <option key={s} value={s}>{s || "Semua status"}</option>)}
        </select>
        <select aria-label="Filter risiko" value={risk} onChange={e => { setRisk(e.target.value); setPage(1); }} className={select}>
          {risks.map(s => <option key={s} value={s}>{s || "Semua risiko"}</option>)}
        </select>
      </div>
    </div>

    {error && <p role="alert" className="rounded-xl bg-[#fff0ea] dark:bg-[#20392b] p-4 text-sm text-[#ae4e3b] dark:text-[#ffc2b4]">{error}</p>}

    <div className="overflow-hidden rounded-[24px] border border-[#dce8df] dark:border-[#345345] bg-white dark:bg-[#172b22] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf2ed] dark:border-[#345345] px-5 py-4 sm:px-6"><p className="text-sm font-bold">Daftar laporan</p><p className="text-xs text-[#90a797] dark:text-[#82dfb3]">{total.toLocaleString("id-ID")} laporan</p></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#f3f8f3] dark:bg-[#20392b] text-[11px] font-bold uppercase tracking-[.08em] text-[#779184] dark:text-[#82dfb3]">
            <tr>{["Laporan", "Pelapor", "Kategori", "Status", "Risiko AI", "Waktu", "Tindakan"].map(s => <th key={s} className="px-5 py-4">{s}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#edf3ed]">
            {alerts.map(a => <tr key={a.id} className="transition hover:bg-[#f8fcf8] dark:hover:bg-[#29483a]">
              <td className="max-w-[250px] px-5 py-4"><p className="truncate text-sm font-bold">{a.title}</p><p className="mt-1 flex items-center gap-1 truncate text-xs text-[#91a797] dark:text-[#82dfb3]"><MapPin size={12}/> {a.address || "Lokasi koordinat tersedia"}</p></td>
              <td className="px-5 py-4 text-sm text-[#597366] dark:text-[#82dfb3]">{a.user?.name || "-"}</td>
              <td className="px-5 py-4 text-sm text-[#597366] dark:text-[#82dfb3]">{a.category?.name || a.customCategory || "Lainnya"}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusColors[a.status] || "bg-gray-100 text-gray-600"}`}>{a.status}</span></td>
              <td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${riskColors[a.riskLevel || ""] || "bg-gray-100 text-gray-600"}`}>{a.riskLevel || "Belum dinilai"}</span></td>
              <td className="px-5 py-4 text-xs text-[#80998a] dark:text-[#82dfb3]">{new Date(a.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })}</td>
              <td className="px-5 py-4"><Link href={`/admin/alerts/${a.id}`} className="inline-flex items-center gap-1 rounded-xl bg-[#e7f5eb] dark:bg-[#20392b] px-3 py-2 text-xs font-bold text-[#0b8568] dark:text-[#82dfb3] hover:bg-[#d8eee1] dark:hover:bg-[#29483a]">Detail <ArrowRight size={13}/></Link></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {loading && <p role="status" className="p-10 text-center text-sm text-[#849b8c] dark:text-[#82dfb3]">Memuat laporan...</p>}
      {!loading && !error && !alerts.length && <div className="flex flex-col items-center py-16 text-[#87a08f] dark:text-[#82dfb3]"><Search size={30}/><p className="mt-3 text-sm">Tidak ada laporan sesuai pencarian.</p></div>}
      {totalPages > 1 && <div className="flex items-center justify-between gap-3 border-t border-[#edf2ed] dark:border-[#345345] px-5 py-4">
        <p className="text-xs text-[#859d8f] dark:text-[#82dfb3]">Halaman {page} dari {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(n => n-1)} className="rounded-lg border border-[#dce8dd] dark:border-[#345345] px-4 py-2 text-xs font-semibold disabled:opacity-40">Sebelumnya</button>
          <button disabled={page >= totalPages} onClick={() => setPage(n => n+1)} className="rounded-lg bg-[#087d65] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Berikutnya</button>
        </div>
      </div>}
    </div>
  </div>;
}
