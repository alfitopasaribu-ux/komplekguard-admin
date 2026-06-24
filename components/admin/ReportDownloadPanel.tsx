"use client";
import { useState } from "react";
import { Download } from "lucide-react";

type Mode = "day" | "week" | "month" | "year";
const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function ReportDownloadPanel() {
  const now = new Date();
  const [mode, setMode] = useState<Mode>("day");
  const [date, setDate] = useState(now.toISOString().slice(0,10));
  const [week, setWeek] = useState(1);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const years = Array.from({ length: 8 }, (_, i) => now.getFullYear() - 2 + i);

  const download = () => {
    const p = new URLSearchParams({ mode, year: String(year), month: String(month) });
    if (mode === "day") p.set("date", date);
    if (mode === "week") p.set("week", String(week));
    window.location.href = `/api/reports/alerts-xlsx?${p}`;
  };

  const sel = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-bold text-white mb-1">Laporan Alert Keamanan</h2>
      <p className="text-sm text-white/40 mb-5">Download laporan harian, mingguan, bulanan, dan tahunan dalam format Excel.</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Jenis Laporan</label>
          <select value={mode} onChange={e => setMode(e.target.value as Mode)} className={sel}>
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
            <option value="year">Tahunan</option>
          </select>
        </div>
        {mode === "day" && (
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={sel} />
          </div>
        )}
        {mode === "week" && (
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Minggu Ke</label>
            <select value={week} onChange={e => setWeek(Number(e.target.value))} className={sel}>
              {[1,2,3,4,5].map(w => <option key={w} value={w}>Minggu {w}</option>)}
            </select>
          </div>
        )}
        {(mode === "week" || mode === "month") && (
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Bulan</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={sel}>
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Tahun</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className={sel}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={download} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition">
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}
