"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock3, LockKeyhole, RefreshCw, Search, ShieldCheck } from "lucide-react";

type ActivityEntry = {
  id: string; action: string; description?: string | null; createdAt: string;
  user?: { name?: string; role?: string } | null;
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/activity?page=${page}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Riwayat aktivitas tidak dapat dimuat.");
      const result = await response.json();
      setLogs(result.logs || []); setTotal(result.total || 0); setTotalPages(result.totalPages || 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat aktivitas");
    } finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => logs.filter(log => [log.action, log.description, log.user?.name].some(v => String(v || "").toLowerCase().includes(search.trim().toLowerCase()))), [logs, search]);
  const labelFor = (log: ActivityEntry) => {
    if (log.action === "ADMIN_LOGIN") return "Administrator masuk ke sistem";
    if (log.action === "EXPORT_EXCEL") return "Ekspor laporan Excel";
    if (log.action === "UPDATE_ALERT_STATUS") return "Pembaruan status laporan";
    return log.action.replaceAll("_", " ");
  };
  const detailFor = (log: ActivityEntry) => {
    if (log.action === "ADMIN_LOGIN") return "Sesi login tercatat oleh sistem.";
    return (log.description || "Aktivitas tercatat").replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[alamat IP disembunyikan]");
  };

  return <div className="space-y-6 text-[#173d32]">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-[#0a9775]">Riwayat sistem</p>
        <h1 className="text-3xl font-bold tracking-[-.045em] sm:text-4xl">Log Aktivitas</h1>
        <p className="mt-2 text-sm text-[#819b8b]">Pantau kegiatan yang tercatat untuk membantu audit keamanan.</p>
      </div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#dce8dd] bg-white px-4 py-3 text-sm font-semibold text-[#138468] disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Perbarui</button>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-[#deeadf] bg-white p-5"><Activity size={20} className="text-[#0b8a6a]"/><p className="mt-3 text-3xl font-bold">{total.toLocaleString("id-ID")}</p><p className="text-xs text-[#8aa193]">Total aktivitas</p></div>
      <div className="rounded-2xl border border-[#deeadf] bg-white p-5"><LockKeyhole size={20} className="text-[#0b8a6a]"/><p className="mt-3 text-3xl font-bold">{logs.filter(l => l.action === "ADMIN_LOGIN").length}</p><p className="text-xs text-[#8aa193]">Login di halaman ini</p></div>
      <div className="rounded-2xl border border-[#deeadf] bg-white p-5"><ShieldCheck size={20} className="text-[#0b8a6a]"/><p className="mt-3 text-3xl font-bold">{logs.length}</p><p className="text-xs text-[#8aa193]">Entri yang ditampilkan</p></div>
    </div>

    <section className="rounded-[24px] border border-[#deeadf] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold">Jejak aktivitas</h2><p className="mt-1 text-xs text-[#91a595]">Pencarian berlaku pada halaman aktif</p></div>
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91a795]"/>
          <input value={search} onChange={e => setSearch(e.target.value)} aria-label="Cari aktivitas" placeholder="Cari aktivitas atau nama..."
            className="h-11 w-full rounded-xl border border-[#dce8dd] bg-[#f8fbf8] pl-10 pr-4 text-sm outline-none focus:border-[#0b9775]"/>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff2eb] p-4 text-sm text-[#ae513c]">{error}</p>}
      <div className="relative mt-7 space-y-0 before:absolute before:bottom-4 before:left-[18px] before:top-4 before:w-px before:bg-[#dcebe1]">
        {filtered.map(log => <article key={log.id} className="relative flex gap-4 py-4">
          <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#d7e9dd] bg-[#e9f6eb] text-[#0b906e]">
            {log.action === "ADMIN_LOGIN" ? <LockKeyhole size={17}/> : <Activity size={17}/>}
          </span>
          <div className="min-w-0 flex-1 rounded-2xl border border-[#e4eee5] bg-[#fbfdfb] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">{labelFor(log)}</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#91a495]"><Clock3 size={13}/>{new Date(log.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })}</span>
            </div>
            <p className="mt-2 text-sm text-[#71887a]">{detailFor(log)}</p>
            <p className="mt-2 text-xs font-semibold text-[#0b906e]">{log.user?.name || "Sistem"} · {log.user?.role || "—"}</p>
          </div>
        </article>)}
      </div>
      {loading && <p role="status" className="py-12 text-center text-sm text-[#8ba395]">Memuat aktivitas...</p>}
      {!loading && !error && !filtered.length && <p className="py-12 text-center text-sm text-[#8ba395]">Tidak ada aktivitas sesuai pencarian.</p>}
      {totalPages > 1 && <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e8f0e8] pt-5">
        <span className="text-xs text-[#829a8b]">Halaman {page} dari {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(v => v - 1)} className="rounded-xl border border-[#deeadf] px-4 py-2 text-xs font-bold disabled:opacity-40">Sebelumnya</button>
          <button disabled={page >= totalPages} onClick={() => setPage(v => v + 1)} className="rounded-xl bg-[#087d65] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Berikutnya</button>
        </div>
      </div>}
    </section>
  </div>;
}
