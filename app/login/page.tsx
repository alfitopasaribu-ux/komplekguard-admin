"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight, CheckCircle2, Eye, EyeOff, Fingerprint,
  LockKeyhole, Loader2, Mail, ShieldCheck, Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Login gagal. Silakan coba lagi.");
      toast.success("Selamat datang di Admin Panel.");
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Koneksi terputus. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f2] text-[#143c32] lg:grid lg:grid-cols-[1.04fr_1fr]">
      <section className="relative isolate hidden min-h-screen overflow-hidden bg-[#084d40] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{
          background: "radial-gradient(circle at 80% 30%, rgba(161,220,187,.23), transparent 35%), radial-gradient(circle at 5% 90%, rgba(6,106,80,.9), transparent 45%)",
        }} />
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10"><ShieldCheck size={26} /></span>
          <div>
            <p className="text-lg font-bold tracking-tight">KomplekGuard <span className="text-[#b8efd0]">AI</span></p>
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-white/60">Administration suite</p>
          </div>
        </div>

        <div className="max-w-[600px]">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#c7f1db]">
            <Sparkles size={15} /> Workspace keamanan lingkungan
          </div>
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-[-.045em] xl:text-6xl">
            Lingkungan lebih aman.<br /><span className="text-[#baebd0]">Koordinasi lebih mudah.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/75">
            Pantau laporan warga, tinjau tingkat risiko, dan kelola informasi kejadian dalam satu dashboard yang terhubung.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <CheckCircle2 className="mb-3 text-[#b8efd0]" size={22} />
              <p className="font-semibold">Pemantauan terpadu</p>
              <p className="mt-1 text-sm leading-6 text-white/65">Data kejadian langsung dari sistem warga.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <Fingerprint className="mb-3 text-[#b8efd0]" size={22} />
              <p className="font-semibold">Akses terproteksi</p>
              <p className="mt-1 text-sm leading-6 text-white/65">Hanya untuk pengelola yang berwenang.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/60">
          <span>© {new Date().getFullYear()} KomplekGuard AI</span>
          <span>Built for safer neighborhoods</span>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#087d65] text-white"><ShieldCheck size={26}/></span>
            <div>
              <p className="text-lg font-bold">KomplekGuard AI</p>
              <p className="text-xs text-[#67877a]">Administrator Workspace</p>
            </div>
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cee3d7] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#087d65]">
              <LockKeyhole size={13} /> Akses administrator
            </span>
            <h2 className="mt-5 text-[clamp(2.25rem,4vw,3.2rem)] font-semibold leading-tight tracking-[-.05em]">
              Selamat datang<br />kembali.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#698177]">Masuk untuk mengelola informasi keamanan KomplekGuard AI.</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#dce9df] bg-white p-6 shadow-[0_20px_70px_rgba(18,66,49,.065)] sm:p-9">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[#153d32]">Masuk ke dashboard</p>
                <p className="mt-1 text-xs text-[#849b90]">Gunakan akun admin yang terdaftar</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eaf5ee] text-[#0d886c]"><ShieldCheck size={23} /></span>
            </div>

            <label htmlFor="admin-email" className="block text-sm font-semibold">Alamat email</label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#84a397]" size={19}/>
              <input id="admin-email" name="email" type="email" autoComplete="username" required
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                placeholder="admin@contoh.id"
                className="h-14 w-full rounded-2xl border border-[#d6e5dc] bg-[#f8fbf8] pl-12 pr-4 text-sm text-[#123c30] outline-none transition placeholder:text-[#9cb0a5] focus:border-[#0b9373] focus:ring-4 focus:ring-[#0b9373]/10 disabled:opacity-60"
              />
            </div>

            <label htmlFor="admin-password" className="mt-6 block text-sm font-semibold">Kata sandi</label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#84a397]" size={19}/>
              <input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
                placeholder="Masukkan kata sandi"
                className="h-14 w-full rounded-2xl border border-[#d6e5dc] bg-[#f8fbf8] pl-12 pr-14 text-sm text-[#123c30] outline-none transition placeholder:text-[#9cb0a5] focus:border-[#0b9373] focus:ring-4 focus:ring-[#0b9373]/10 disabled:opacity-60"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={loading}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-[#638378] hover:bg-[#e5f1e9]">
                {showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}
              </button>
            </div>

            {error && <p role="alert" className="mt-5 rounded-2xl border border-[#f8d5d1] bg-[#fff4f2] px-4 py-3 text-sm text-[#a93530]">{error}</p>}

            <button type="submit" disabled={loading} className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#087d65] px-5 font-semibold text-white shadow-[0_12px_25px_rgba(8,125,101,.16)] transition hover:bg-[#076951] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087d65] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 className="animate-spin" size={19}/> Memverifikasi akun...</> : <>Masuk ke Admin Panel <ArrowRight size={19}/></>}
            </button>
            <p className="mt-5 text-center text-xs leading-5 text-[#7c9588]">Akses hanya untuk administrator dan pengelola berwenang.</p>
          </form>
          <p className="mt-8 text-center text-xs text-[#92a79b]">KomplekGuard AI · Sistem keamanan lingkungan</p>
        </div>
      </section>
    </main>
  );
}
