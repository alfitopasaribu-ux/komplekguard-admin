"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Camera, CheckCircle2, Eye, EyeOff, ImagePlus, KeyRound,
  LockKeyhole, Mail, MapPin, Phone, Save, ShieldCheck,
  Trash2, UserRound, X,
} from "lucide-react";

type Profile = {
  id: string; name: string; email: string; phone?: string | null;
  address?: string | null; image?: string | null; role: string; isActive: boolean;
};

const field = "mt-2 h-12 w-full rounded-2xl border border-[#d5e6da] bg-[#f8fbf8] px-4 text-sm text-[#173e32] outline-none transition placeholder:text-[#a0b0a4] focus:border-[#0b9675] focus:ring-4 focus:ring-[#0b9675]/10 dark:border-[#345447] dark:bg-[#172c25] dark:text-[#eaf6ed] dark:placeholder:text-[#81998a]";
const label = "block text-sm font-semibold text-[#3c6453] dark:text-[#bdd5c4]";
const card = "rounded-[24px] border border-[#dceade] bg-white p-5 shadow-sm sm:p-7 dark:border-[#304c3d] dark:bg-[#14261f]";
const secondary = "text-[#729080] dark:text-[#9eb8a8]";
const photoButton = "inline-flex items-center gap-2 rounded-xl border border-[#d6e8dd] bg-white px-3 py-2.5 text-xs font-semibold text-[#17694f] transition hover:bg-[#eff7f0] disabled:opacity-50 dark:border-[#395648] dark:bg-[#1c362b] dark:text-[#d9f1e1] dark:hover:bg-[#264434]";

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const rearRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/profile", { cache: "no-store" });
      if (!response.ok) throw new Error("Profil tidak dapat dimuat. Coba masuk ulang.");
      const data = await response.json();
      if (!data.user) throw new Error("Data administrator tidak tersedia.");
      const profile: Profile = data.user;
      setUser(profile);
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setDraftImage(null);
      setRemoveImage(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const avatar = removeImage ? null : (draftImage || user?.image || null);
  const photoChanged = removeImage || !!draftImage;
  const changed = !!user && (
    name.trim() !== user.name || phone.trim() !== (user.phone || "") ||
    address.trim() !== (user.address || "") || photoChanged || !!newPassword
  );

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Pilih foto JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file asli maksimal 10 MB.");
      return;
    }

    setProcessing(true);
    try {
      const src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Gagal membaca file."));
        reader.readAsDataURL(file);
      });
      const result = await new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.min(1, 600 / Math.max(image.width, image.height));
          canvas.width = Math.max(1, Math.round(image.width * size));
          canvas.height = Math.max(1, Math.round(image.height * size));
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Pemrosesan foto tidak tersedia."));
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        image.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
        image.src = src;
      });
      if (result.length > 2_800_000) throw new Error("Foto hasil kompresi terlalu besar.");
      setDraftImage(result);
      setRemoveImage(false);
      toast.success("Foto siap disimpan.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Gagal memproses foto.");
    } finally {
      setProcessing(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || processing || !user) return;
    if (!name.trim()) return toast.error("Nama tidak boleh kosong.");
    if (newPassword && newPassword.length < 12) return toast.error("Kata sandi baru minimal 12 karakter.");
    if (newPassword && newPassword !== confirmPassword) return toast.error("Konfirmasi kata sandi tidak sama.");
    if (newPassword && !oldPassword) return toast.error("Masukkan kata sandi lama.");

    setSaving(true); setError("");
    try {
      const body: Record<string, string | null> = {
        name: name.trim(), phone: phone.trim(), address: address.trim(),
      };
      if (photoChanged) body.image = removeImage ? null : draftImage;
      if (newPassword) {
        body.currentPassword = oldPassword;
        body.newPassword = newPassword;
      }
      const response = await fetch("/api/admin/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.user) throw new Error(data.error || "Gagal menyimpan profil.");
      setUser(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");
      setAddress(data.user.address || "");
      setDraftImage(null);
      setRemoveImage(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Perubahan profil berhasil disimpan.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan profil.");
    } finally { setSaving(false); }
  }

  if (loading) return <div role="status" className="py-20 text-center text-sm text-[#678778] dark:text-[#acc4b4]">Memuat profil administrator...</div>;
  if (!user) return <div role="alert" className={card}><p className="text-sm text-[#a44e43]">{error || "Profil tidak ditemukan."}</p><button onClick={() => void load()} className="mt-3 text-sm font-semibold text-[#0b8b6c] underline">Coba lagi</button></div>;

  return <div className="mx-auto max-w-[960px] space-y-6 pb-12 text-[#173d32] dark:text-[#e6f4e9]">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-[#0b9575] dark:text-[#76d7ad]">Pengaturan akun</p>
        <h1 className="text-3xl font-bold tracking-[-.045em] sm:text-4xl">Profil Administrator</h1>
        <p className={`mt-2 text-sm ${secondary}`}>Kelola identitas, foto, dan keamanan akun admin.</p>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#e4f4e9] px-4 py-2 text-xs font-bold text-[#0b8668] dark:bg-[#234d3a] dark:text-[#9bedd0]">
        <ShieldCheck size={16}/> {user.role} · {user.isActive ? "Aktif" : "Nonaktif"}
      </span>
    </div>

    {error && <p role="alert" className="rounded-2xl border border-[#efc9c4] bg-[#fff1ef] p-4 text-sm text-[#a14338]">{error}</p>}

    <form onSubmit={save} className="space-y-6">
      <section className={card}>
        <div className="mb-6 flex items-center gap-2"><UserRound className="text-[#0b9472] dark:text-[#7de4af]" size={20}/><h2 className="text-lg font-bold">Identitas administrator</h2></div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {avatar ? <img src={avatar} alt="Foto profil administrator" className="h-24 w-24 rounded-3xl border-4 border-[#e5f4e8] object-cover dark:border-[#325a46]"/>
              : <div className="grid h-24 w-24 place-items-center rounded-3xl bg-[#0b8e70] text-4xl font-bold text-white">{user.name?.charAt(0)?.toUpperCase() || "A"}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{user.name}</p>
            <p className={`mt-1 break-words text-sm ${secondary}`}>{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={saving || processing} onClick={() => fileRef.current?.click()} className={photoButton}><ImagePlus size={16}/> Galeri</button>
              <button type="button" disabled={saving || processing} onClick={() => rearRef.current?.click()} className={photoButton}><Camera size={16}/> Kamera belakang</button>
              <button type="button" disabled={saving || processing} onClick={() => frontRef.current?.click()} className={photoButton}><Camera size={16}/> Kamera depan</button>
              {avatar && <button type="button" disabled={saving || processing} onClick={() => {setDraftImage(null); setRemoveImage(true);}} className="inline-flex items-center gap-2 rounded-xl border border-[#f3dad4] bg-[#fff3ef] px-3 py-2.5 text-xs font-semibold text-[#ab4b42] disabled:opacity-50 dark:border-[#754c45] dark:bg-[#3b2826] dark:text-[#ffb9ad]"><Trash2 size={16}/> Hapus</button>}
            </div>
            <p className={`mt-3 text-xs leading-5 ${secondary}`}>{processing ? "Memproses foto..." : "JPEG, PNG, atau WebP. File asli maksimal 10 MB; foto dikompresi otomatis."}</p>
            {photoChanged && <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#0a886b] dark:text-[#7de4af]"><CheckCircle2 size={15}/> Perubahan foto belum disimpan</p>}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden"/>
            <input ref={rearRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleImage} className="hidden"/>
            <input ref={frontRef} type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={handleImage} className="hidden"/>
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><UserRound className="text-[#0b9472] dark:text-[#7de4af]" size={20}/> Informasi pribadi</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="admin-name" className={label}>Nama lengkap <span className="text-[#a44e43]">*</span></label>
            <input id="admin-name" value={name} onChange={e => setName(e.target.value)} maxLength={100} required className={field} placeholder="Nama administrator"/></div>
          <div><label htmlFor="admin-email-readonly" className={label}><Mail size={15} className="mr-1 inline"/> Email akun</label>
            <input id="admin-email-readonly" value={user.email} disabled className={`${field} cursor-not-allowed opacity-75`}/>
            <p className={`mt-1.5 text-xs ${secondary}`}>Email akun tidak bisa diubah dari halaman ini.</p></div>
          <div><label htmlFor="admin-phone" className={label}><Phone size={15} className="mr-1 inline"/> Nomor telepon</label>
            <input id="admin-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={30} className={field} placeholder="Opsional"/></div>
          <div><label htmlFor="admin-address" className={label}><MapPin size={15} className="mr-1 inline"/> Alamat</label>
            <textarea id="admin-address" value={address} onChange={e => setAddress(e.target.value)} maxLength={500} rows={2} className={`${field} h-auto min-h-[82px] resize-y py-3`} placeholder="Alamat administrator (opsional)"/></div>
        </div>
      </section>

      <section className={card}>
        <h2 className="flex items-center gap-2 text-lg font-bold"><LockKeyhole size={20} className="text-[#0b9472] dark:text-[#7de4af]"/> Keamanan akun</h2>
        <p className={`mb-5 mt-2 text-xs leading-6 ${secondary}`}>Kosongkan seluruh kolom di bawah apabila tidak ingin mengganti kata sandi. Gunakan minimal 12 karakter untuk kata sandi baru.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="admin-old-password" className={label}>Kata sandi saat ini</label>
            <input id="admin-old-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className={field} placeholder="Diperlukan jika mengganti kata sandi"/>
          </div>
          <div><label htmlFor="admin-new-password" className={label}>Kata sandi baru</label>
            <input id="admin-new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={field} placeholder="Minimal 12 karakter"/></div>
          <div><label htmlFor="admin-confirm-password" className={label}>Ulangi kata sandi baru</label>
            <input id="admin-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={field} placeholder="Ketik ulang kata sandi"/></div>
        </div>
        <button type="button" onClick={() => setShowPassword(v => !v)} className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${secondary}`}>
          {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>} {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        </button>
      </section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dceade] bg-white/95 p-4 shadow-[0_12px_40px_rgba(15,74,45,.12)] backdrop-blur dark:border-[#345447] dark:bg-[#152b21]/95">
        <p className={`text-xs ${secondary}`}>{changed ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}</p>
        <button type="submit" disabled={!changed || saving || processing} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087d65] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#096c56] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
          <Save size={18}/> {saving ? "Menyimpan..." : "Simpan perubahan profil"}
        </button>
      </div>
    </form>
  </div>;
}
