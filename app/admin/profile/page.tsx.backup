"use client";
import { useEffect, useState, useRef } from "react";
import { User, Phone, MapPin, Lock, Save, Camera, Shield, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageBytes, setImageBytes] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const cameraFrontRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/profile").then(r => r.json()).then(d => {
      setUser(d.user);
      setName(d.user?.name || "");
      setPhone("");
      setAddress("");
      setLoading(false);
    });
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) { toast.error("Ukuran foto maksimal 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageBytes(reader.result as string); setRemoveImage(false); };
    reader.readAsDataURL(file);
  };

  const getAvatar = () => {
    if (removeImage) return null;
    if (imageBytes) return imageBytes;
    if (user?.image) return user.image;
    return null;
  };

  const deletePhoto = () => { setImageBytes(null); setRemoveImage(true); };

  const save = async () => {
    if (!name.trim()) { toast.error("Nama tidak boleh kosong"); return; }
    if (newPassword && newPassword !== confirmPassword) { toast.error("Konfirmasi password tidak cocok"); return; }
    if (newPassword && newPassword.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    if (newPassword && !currentPassword) { toast.error("Masukkan password lama"); return; }

    setSaving(true);
    try {
      const body: any = { name, phone, address };
      if (imageBytes) body.image = imageBytes;
      if (removeImage) body.image = null;
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setUser(data.user);
      setRemoveImage(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Profil berhasil disimpan!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-cyan-500/50 transition";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" /> Profil Admin
        </h1>
        <p className="text-white/40 text-sm mt-1">Kelola informasi akun administrator</p>
      </div>

      {/* Avatar */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            {getAvatar() ? (
              <img src={getAvatar()!} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/30" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-cyan-500 flex items-center justify-center text-black text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">{user?.name}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1 mb-4">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-mono">{user?.role}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition">
                <Camera className="w-3.5 h-3.5" /> Galeri
              </button>
              <button onClick={() => cameraRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition">
                <Camera className="w-3.5 h-3.5" /> Kamera Belakang
              </button>
              <button onClick={() => cameraFrontRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition">
                <Camera className="w-3.5 h-3.5" /> Kamera Depan
              </button>
              {(getAvatar()) && (
                <button onClick={deletePhoto} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
            <input ref={cameraFrontRef} type="file" accept="image/*" capture="user" onChange={handleImage} className="hidden" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Informasi Pribadi</h3>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Nama Lengkap</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={name} onChange={e => setName(e.target.value)} className={`${inp} pl-10 pr-10`} placeholder="Nama lengkap" />
            {name && <button onClick={() => setName("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"><X className="w-4 h-4" /></button>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Email</label>
          <input value={user?.email || ""} disabled className={`${inp} opacity-40 cursor-not-allowed`} />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">No. Telepon</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={phone} onChange={e => setPhone(e.target.value)} className={`${inp} pl-10 pr-10`} placeholder="Nomor telepon (opsional)" />
            {phone && <button onClick={() => setPhone("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"><X className="w-4 h-4" /></button>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Alamat</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className={`${inp} pl-10 resize-none`} placeholder="Alamat (opsional)" />
          </div>
          {address && <button onClick={() => setAddress("")} className="text-xs text-white/20 hover:text-white/50 mt-1">Hapus alamat</button>}
        </div>
      </div>

      {/* Password */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" /> Ganti Password
        </h3>
        <p className="text-xs text-white/30">Kosongkan jika tidak ingin mengganti password</p>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Password Lama</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inp} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Password Baru</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inp} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Konfirmasi Password Baru</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inp} placeholder="••••••••" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold transition">
        <Save className="w-4 h-4" />
        {saving ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </div>
  );
}

