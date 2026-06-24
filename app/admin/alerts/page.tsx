"use client";
import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Search, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  AKTIF: "bg-red-500/20 text-red-400 border-red-500/30",
  DIPROSES: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  SELESAI: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  DIBATALKAN: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
const RISK_COLOR: Record<string, string> = {
  RENDAH: "bg-emerald-500/20 text-emerald-400",
  SEDANG: "bg-amber-500/20 text-amber-400",
  TINGGI: "bg-red-500/20 text-red-400",
  KRITIS: "bg-red-900/40 text-red-300",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), search, ...(status && { status }), ...(risk && { riskLevel: risk }) });
    const res = await fetch(`/api/alerts?${p}`);
    const data = await res.json();
    setAlerts(data.alerts || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, search, status, risk]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const sel = "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-cyan-400" /> Data Alert</h1>
          <p className="text-white/40 text-sm mt-1">Total {total.toLocaleString("id-ID")} alert</p>
        </div>
        <button onClick={fetch_} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari judul atau pelapor..." className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/50" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={sel}>
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="DIPROSES">Diproses</option>
          <option value="SELESAI">Selesai</option>
          <option value="DIBATALKAN">Dibatalkan</option>
        </select>
        <select value={risk} onChange={e => { setRisk(e.target.value); setPage(1); }} className={sel}>
          <option value="">Semua Risiko</option>
          <option value="RENDAH">Rendah</option>
          <option value="SEDANG">Sedang</option>
          <option value="TINGGI">Tinggi</option>
          <option value="KRITIS">Kritis</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {["#","Tanggal","Judul Alert","Kategori","Status","Level Risiko","Pelapor","Detail"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-mono text-white/40 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_,i) => (
              <tr key={i} className="border-b border-white/5">
                {Array(8).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-white/5" /></td>)}
              </tr>
            )) : alerts.map((a, i) => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-4 py-3 text-white/40 text-sm font-mono">{(page-1)*10+i+1}</td>
                <td className="px-4 py-3 text-white/60 text-xs font-mono">{new Date(a.createdAt).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-white text-sm font-medium max-w-48 truncate">{a.title}</td>
                <td className="px-4 py-3 text-white/50 text-xs">{a.category?.name || a.customCategory || "Lainnya"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${STATUS_COLOR[a.status] || ""}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${RISK_COLOR[a.riskLevel] || ""}`}>{a.riskLevel}</span>
                </td>
                <td className="px-4 py-3 text-white/60 text-sm">{a.user?.name || "-"}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/alerts/${a.id}`} className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-medium">
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && alerts.length === 0 && (
          <div className="text-center py-12 text-white/30">Tidak ada alert ditemukan</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">Menampilkan {(page-1)*10+1}–{Math.min(page*10,total)} dari {total} alert</p>
          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages,5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === p ? "bg-cyan-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
