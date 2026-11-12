import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

const PREFIX = "GUARDIAN_VERIFY:";
const allowed = ["TERVERIFIKASI", "PERLU_PEMERIKSAAN", "DITOLAK"] as const;
type Decision = (typeof allowed)[number];

async function authorized(req: NextRequest) {
  const session = await getUserFromCookie(req);
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  }).then(u => u?.isActive && ["ADMIN", "KETUA_RT"].includes(u.role) ? u : null);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await authorized(req);
    if (!staff) return NextResponse.json({ error: "Akses verifikasi hanya untuk Admin atau Ketua RT aktif." }, { status: 403 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const status = body.status as Decision;
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!allowed.includes(status)) return NextResponse.json({ error: "Keputusan verifikasi tidak valid." }, { status: 400 });
    if (note.length < 15 || note.length > 1000) {
      return NextResponse.json({ error: "Catatan pemeriksaan wajib 15–1000 karakter." }, { status: 400 });
    }

    const alert = await prisma.alert.findUnique({ where: { id }, select: { id: true, userId: true, title: true } });
    if (!alert) return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });

    const action = PREFIX + id;
    const data = await prisma.$transaction(async tx => {
      const previous = await tx.activityLog.findFirst({
        where: { action }, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { description: true },
      });
      let from = "BELUM_DIVERIFIKASI";
      try {
        const p = JSON.parse(previous?.description || "{}");
        if (typeof p.status === "string") from = p.status;
      } catch { /* Older invalid audit record is treated as unverified. */ }

      const review = await tx.activityLog.create({
        data: {
          userId: staff.id,
          action,
          description: JSON.stringify({
            status, note, from, reviewerId: staff.id,
            reviewedAt: new Date().toISOString(),
          }),
        },
        select: { id: true, createdAt: true },
      });
      await tx.notification.create({
        data: {
          userId: alert.userId,
          alertId: id,
          type: "GUARDIAN_VERIFY",
          title: "Pembaruan pemeriksaan laporan",
          message: status === "TERVERIFIKASI"
            ? "Laporan telah dikonfirmasi oleh petugas."
            : status === "DITOLAK"
              ? "Petugas menemukan masalah pada laporan. Periksa informasi dan hubungi petugas jika perlu."
              : "Petugas membutuhkan pemeriksaan tambahan pada laporan.",
        },
      });
      return review;
    });

    return NextResponse.json({
      success: true, verification: {
        status, note, verifiedAt: data.createdAt,
      },
    });
  } catch (error) {
    console.error("guardian verification failed", error);
    return NextResponse.json({ error: "Verifikasi belum tersimpan. Silakan coba lagi." }, { status: 500 });
  }
}
