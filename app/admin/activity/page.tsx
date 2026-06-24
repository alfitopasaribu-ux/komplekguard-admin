"use client";
import { useEffect, useState, useCallback } from "react";
import { Activity, Shield, Download, RefreshCw } from "lucide-react";

const ACTION_ICON: Record<string, string> = {
  ADMIN_LOGIN: "🔐", EXPORT_EXCEL: "📊", UPDATE_ALERT_STATUS: "✏️",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/activity?page=${page}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="w-6 h-6 text-cyan-400" /> Log Aktivitas</h1>
          <p className="text-white/40 text-sm mt-1">Riwayat seluruh aktivitas sistem — {total.toLocaleString("id-ID")} entri</p>
        </div>
        <button onClick={fetch_} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {loading ? Array(10).fill(0).map((_,i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <div className="w-10 h-10 animate-pulse rounded-xl bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-72 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        )) : logs.map(log => (
          <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg flex-shrink-0">
              {ACTION_ICON[log.action] || "📋"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{log.description || log.action}</p>
              <p className="text-xs text-white/30 mt-0.5">
                {log.user?.name || "System"} <span className="text-white/20">•</span> {log.user?.role || "-"}
                <span className="text-white/20"> • </span>
                {new Date(log.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!loading && logs.length === 0 && <div className="text-center py-12 text-white/30">Belum ada aktivitas</div>}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">Halaman {page} dari {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
