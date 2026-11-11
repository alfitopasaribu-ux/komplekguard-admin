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

  const sel = "w-full rounded-xl border border-[#dce8dd] dark:border-[#345345] bg-[#f8fbf7] dark:bg-[#20392b] px-4 py-3 text-sm text-[#285743] dark:text-[#82dfb3] outline-none focus:border-[#0b9475] transition";

  return (
    <div className="rounded-[24px] border border-[#dfe9e1] dark:border-[#345345] bg-white dark:bg-[#172b22] p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#173c32] dark:text-[#eaf6ed] mb-1">Laporan Alert Keamanan</h2>
      <p className="text-sm text-[#879d8d] dark:text-[#82dfb3] mb-5">Download laporan harian, mingguan, bulanan, dan tahunan dalam format Excel.</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="block text-xs font-semibold text-[#7e9887] dark:text-[#82dfb3] mb-2 uppercase">Jenis Laporan</label>
          <select value={mode} onChange={e => setMode(e.target.value as Mode)} className={sel}>
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
            <option value="year">Tahunan</option>
          </select>
        </div>
        {mode === "day" && (
          <div>
            <label className="block text-xs font-semibold text-[#7e9887] dark:text-[#82dfb3] mb-2 uppercase">Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={sel} />
          </div>
        )}
        {mode === "week" && (
          <div>
            <label className="block text-xs font-semibold text-[#7e9887] dark:text-[#82dfb3] mb-2 uppercase">Minggu Ke</label>
            <select value={week} onChange={e => setWeek(Number(e.target.value))} className={sel}>
              {[1,2,3,4,5].map(w => <option key={w} value={w}>Minggu {w}</option>)}
            </select>
          </div>
        )}
        {(mode === "week" || mode === "month") && (
          <div>
            <label className="block text-xs font-semibold text-[#7e9887] dark:text-[#82dfb3] mb-2 uppercase">Bulan</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={sel}>
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-[#7e9887] dark:text-[#82dfb3] mb-2 uppercase">Tahun</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className={sel}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={download} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#087d65] hover:bg-[#096b56] px-4 py-3 text-sm font-bold text-white transition">
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}
