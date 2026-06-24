"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, User, Tag, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = ["AKTIF","DIPROSES","SELESAI","DIBATALKAN"];
const STATUS_COLOR: Record<string,string> = { AKTIF:"bg-red-500/20 text-red-400", DIPROSES:"bg-amber-500/20 text-amber-400", SELESAI:"bg-emerald-500/20 text-emerald-400", DIBATALKAN:"bg-gray-500/20 text-gray-400" };
const RISK_COLOR: Record<string,string> = { RENDAH:"bg-emerald-500/20 text-emerald-400", SEDANG:"bg-amber-500/20 text-amber-400", TINGGI:"bg-red-500/20 text-red-400", KRITIS:"bg-red-900/40 text-red-300" };

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/alerts/${id}`).then(r => r.json()).then(d => {
      setAlert(d.alert);
      setStatus(d.alert?.status || "");
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error("Gagal update");
      toast.success("Status alert berhasil diupdate");
      setAlert((prev: any) => ({ ...prev, status }));
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" /></div>;
  if (!alert) return <div className="text-center text-white/40 py-20">Alert tidak ditemukan</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Data Alert
      </button>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-white">{alert.title}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${STATUS_COLOR[alert.status]}`}>{alert.status}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${RISK_COLOR[alert.riskLevel]}`}>{alert.riskLevel}</span>
          </div>
        </div>

        {alert.description && <p className="text-white/60 text-sm leading-relaxed">{alert.description}</p>}

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-white/50"><User className="w-4 h-4 text-cyan-400" />{alert.user?.name || "-"}</div>
          <div className="flex items-center gap-2 text-sm text-white/50"><Phone className="w-4 h-4 text-cyan-400" />{alert.user?.phone || "-"}</div>
          <div className="flex items-center gap-2 text-sm text-white/50"><Tag className="w-4 h-4 text-cyan-400" />{alert.category?.name || alert.customCategory || "Lainnya"}</div>
          <div className="flex items-center gap-2 text-sm text-white/50"><Clock className="w-4 h-4 text-cyan-400" />{new Date(alert.createdAt).toLocaleString("id-ID")}</div>
          {alert.address && <div className="flex items-center gap-2 text-sm text-white/50 col-span-2"><MapPin className="w-4 h-4 text-cyan-400" />{alert.address}</div>}
        </div>

        {alert.photoUrl && (
          <div>
            <p className="text-xs text-white/30 mb-2 font-mono uppercase">Foto</p>
            <img src={alert.photoUrl} alt="foto alert" className="rounded-xl max-h-60 object-cover border border-white/10" />
          </div>
        )}
      </div>

      {/* Update status */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" /> Update Status</h3>
        <div className="flex gap-3 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${status === s ? "bg-cyan-500 text-black border-cyan-500" : "border-white/10 text-white/50 hover:bg-white/5"}`}>{s}</button>
          ))}
        </div>
        <button onClick={save} disabled={saving || status === alert.status} className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold text-sm transition">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* Responses */}
      {alert.responses?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-base font-bold text-white mb-4">Respon ({alert.responses.length})</h3>
          <div className="space-y-3">
            {alert.responses.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-white/5 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white">{r.user?.name} <span className="text-white/30 text-xs">({r.user?.role})</span></p>
                  <span className="text-xs text-white/30 font-mono">{new Date(r.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <p className="text-sm text-white/50">{r.note || r.responseStatus}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
