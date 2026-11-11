"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowLeft, Camera, Clock3, MapPin, ShieldCheck, Sparkles, UserRound, Users } from "lucide-react";

type AlertDetail = {
  id: string; title: string; description: string; aiSummary?: string | null; riskLevel?: string | null;
  status: string; createdAt: string; address?: string | null;
  latitude: number; longitude: number; photoUrl?: string | null; image?: string | null;
  aiSuggestedCategory?: string | null; customCategory?: string | null;
  user?: { name?: string; phone?: string | null } | null;
  category?: { name?: string } | null;
  responses?: { id: string; responseStatus: string; note?: string | null; createdAt: string; user?: { name?: string; role?: string } | null }[];
};
const badges: Record<string, string> = {
  AKTIF: "bg-[#ffebe8] dark:bg-[#20392b] text-[#b44439] dark:text-[#ffc2b4]", DIPROSES: "bg-[#fff3de] dark:bg-[#20392b] text-[#a87725] dark:text-[#ffc2b4]",
  SELESAI: "bg-[#dff3e6] dark:bg-[#20392b] text-[#0b8160] dark:text-[#82dfb3]", DIBATALKAN: "bg-[#eef1ed] dark:bg-[#20392b] text-[#789083] dark:text-[#82dfb3]",
  KRITIS: "bg-[#ffebe8] dark:bg-[#20392b] text-[#b44439] dark:text-[#ffc2b4]", TINGGI: "bg-[#ffebe8] dark:bg-[#20392b] text-[#b44439] dark:text-[#ffc2b4]",
  SEDANG: "bg-[#fff3de] dark:bg-[#20392b] text-[#a87725] dark:text-[#ffc2b4]", RENDAH: "bg-[#dff3e6] dark:bg-[#20392b] text-[#0b8160] dark:text-[#82dfb3]",
};

export default function AlertDetailPage() {
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    const targetId = window.location.pathname.split("/").filter(Boolean).at(-1) || "";
    setId(targetId);
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/alerts/${encodeURIComponent(targetId)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Detail laporan tidak ditemukan atau tidak dapat diakses.");
        const data = await response.json();
        if (!cancelled) setAlert(data.alert || null);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Gagal memuat laporan.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const box = "rounded-[24px] border border-[#dfe9e1] dark:border-[#345345] bg-white dark:bg-[#172b22] p-5 shadow-sm sm:p-7";
  const validLocation = alert && Number.isFinite(Number(alert.latitude)) && Number.isFinite(Number(alert.longitude)) && Math.abs(alert.latitude) <= 90 && Math.abs(alert.longitude) <= 180;
  const picture = alert?.photoUrl || alert?.image;
  if (loading) return <p className="py-20 text-center text-sm text-[#87a08f] dark:text-[#82dfb3]">Memuat detail kejadian...</p>;
  if (error || !alert) return <div role="alert" className="rounded-2xl border border-[#f4ded4] dark:border-[#345345] bg-white dark:bg-[#172b22] p-6 text-[#a45647] dark:text-[#ffc2b4]">{error || "Laporan tidak ditemukan."} <Link href="/admin/alerts" className="ml-3 underline">Kembali</Link></div>;

  return <div className="space-y-6 text-[#173c32] dark:text-[#eaf6ed]">
    <Link href="/admin/alerts" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c896b] dark:text-[#82dfb3] hover:underline"><ArrowLeft size={16}/> Kembali ke daftar laporan</Link>
    <section className={box}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-[#0b9674] dark:text-[#82dfb3]">Detail laporan kejadian</p>
          <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-[-.035em] sm:text-3xl">{alert.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#8ba092] dark:text-[#82dfb3]"><Clock3 size={14}/> {new Date(alert.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-2 text-xs font-bold ${badges[alert.status] || "bg-gray-100"}`}>{alert.status}</span>
          <span className={`rounded-full px-3 py-2 text-xs font-bold ${badges[alert.riskLevel || ""] || "bg-gray-100"}`}>Risiko: {alert.riskLevel || "Belum dinilai"}</span>
        </div>
      </div>
      <p className="mt-6 whitespace-pre-wrap text-sm leading-8 text-[#5e7e70] dark:text-[#82dfb3]">{alert.description}</p>
      <div className="mt-6 grid gap-3 border-t border-[#edf2ec] dark:border-[#345345] pt-5 sm:grid-cols-2">
        <div className="flex items-start gap-2 text-sm text-[#527667] dark:text-[#82dfb3]"><UserRound size={17} className="mt-0.5 text-[#0e8e6e] dark:text-[#82dfb3]"/><span>Pelapor: <strong className="text-[#204c3e] dark:text-[#eaf6ed]">{alert.user?.name || "Tidak diketahui"}</strong></span></div>
        <div className="flex items-start gap-2 text-sm text-[#527667] dark:text-[#82dfb3]"><ShieldCheck size={17} className="mt-0.5 text-[#0e8e6e] dark:text-[#82dfb3]"/><span>Kategori: <strong className="text-[#204c3e] dark:text-[#eaf6ed]">{alert.category?.name || alert.customCategory || "Lainnya"}</strong></span></div>
        <div className="flex items-start gap-2 text-sm text-[#527667] dark:text-[#82dfb3] sm:col-span-2"><MapPin size={17} className="mt-0.5 shrink-0 text-[#0e8e6e] dark:text-[#82dfb3]"/>{alert.address || "Lokasi berdasarkan titik koordinat."}</div>
      </div>
    </section>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className={box}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Sparkles className="text-[#0d9270] dark:text-[#82dfb3]" size={20}/> Ringkasan AI</h2>
        {alert.aiSummary ? <p className="rounded-2xl bg-[#eef7ef] dark:bg-[#20392b] p-5 text-sm leading-7 text-[#416e5d] dark:text-[#82dfb3]">{alert.aiSummary}</p>
          : <p className="rounded-2xl bg-[#f6f9f4] dark:bg-[#20392b] p-5 text-sm text-[#8a9d8e] dark:text-[#82dfb3]">Analisis AI belum tersedia untuk laporan ini.</p>}
        {alert.aiSuggestedCategory && <p className="mt-4 text-xs text-[#6e8879] dark:text-[#82dfb3]">Saran kategori: <strong>{alert.aiSuggestedCategory}</strong></p>}
        <p className="mt-4 text-xs leading-5 text-[#94a697] dark:text-[#b5cbbd]">Hasil AI adalah informasi pendukung dan tidak menggantikan penilaian petugas di lapangan.</p>
      </section>
      <section className={box}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Camera className="text-[#0d9270] dark:text-[#82dfb3]" size={20}/> Foto kejadian</h2>
        {picture ? <img src={picture} alt={`Foto kejadian ${alert.title}`} className="max-h-[320px] w-full rounded-2xl border border-[#e2ece4] dark:border-[#345345] object-contain"/>
          : <div className="flex h-[195px] flex-col items-center justify-center rounded-2xl bg-[#f2f8f2] dark:bg-[#20392b] text-[#90a695] dark:text-[#82dfb3]"><Camera size={30}/><span className="mt-2 text-sm">Foto tidak tersedia.</span></div>}
      </section>
      <section className={box}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><MapPin className="text-[#0d9270] dark:text-[#82dfb3]" size={20}/> Titik lokasi kejadian</h2>
        {validLocation ? <>
          <iframe loading="lazy" title="Peta lokasi kejadian" referrerPolicy="no-referrer" className="h-[270px] w-full rounded-2xl border border-[#e2ece4] dark:border-[#345345]"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${alert.longitude-0.012}%2C${alert.latitude-0.008}%2C${alert.longitude+0.012}%2C${alert.latitude+0.008}&layer=mapnik&marker=${alert.latitude}%2C${alert.longitude}`}/>
          <a className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0b9471] dark:text-[#82dfb3]" href={`https://www.openstreetmap.org/?mlat=${alert.latitude}&mlon=${alert.longitude}#map=16/${alert.latitude}/${alert.longitude}`} target="_blank" rel="noopener noreferrer">Lihat pada OpenStreetMap <MapPin size={15}/></a>
        </> : <p className="text-sm text-[#8ca392] dark:text-[#82dfb3]">Koordinat belum tersedia.</p>}
      </section>
      <section className={box}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Users className="text-[#0d9270] dark:text-[#82dfb3]" size={20}/> Respons warga ({alert.responses?.length || 0})</h2>
        {alert.responses?.length ? <div className="space-y-3">{alert.responses.map(r => <div key={r.id} className="rounded-2xl border border-[#e0ece2] dark:border-[#345345] bg-[#f9fcf8] dark:bg-[#20392b] p-4">
          <p className="text-sm font-bold">{r.user?.name || "Warga"} <span className="ml-2 text-xs font-normal text-[#849a8d] dark:text-[#82dfb3]">{r.user?.role || ""}</span></p>
          <p className="mt-2 text-sm text-[#5e7e6c] dark:text-[#82dfb3]">{r.note || r.responseStatus}</p>
          <p className="mt-2 text-xs text-[#9aa99a] dark:text-[#b5cbbd]">{new Date(r.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })}</p>
        </div>)}</div>
          : <div className="flex h-[195px] flex-col items-center justify-center rounded-2xl bg-[#f2f8f2] dark:bg-[#20392b] text-[#91a697] dark:text-[#82dfb3]"><Users size={30}/><p className="mt-2 text-sm">Belum ada respons warga.</p></div>}
      </section>
    </div>

    <div className="flex items-start gap-3 rounded-2xl border border-[#dceadf] dark:border-[#345345] bg-[#eef8ef] dark:bg-[#20392b] p-5 text-sm leading-6 text-[#507765] dark:text-[#82dfb3]">
      <Activity size={20} className="mt-0.5 shrink-0 text-[#0b9572] dark:text-[#82dfb3]"/>
      <div><p className="font-bold text-[#164b3b] dark:text-[#eaf6ed]">Pemantauan administrator</p>
        <p>Halaman ini menampilkan informasi laporan. Perubahan status kejadian tetap mengikuti kewenangan pemilik laporan pada aplikasi warga.</p>
        <p className="mt-1 text-xs">ID: {id}</p>
      </div>
    </div>
  </div>;
}
