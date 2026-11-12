import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, phone: true, address: true } },
      category: true,
      responses: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const audit = await prisma.activityLog.findFirst({
    where: { action: "GUARDIAN_VERIFY:" + id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { description: true, createdAt: true },
  });
  let verificationStatus = "BELUM_DIVERIFIKASI";
  let verificationNote: string | null = null;
  if (audit) {
    try {
      const parsed = JSON.parse(audit.description || "{}");
      if (["TERVERIFIKASI", "PERLU_PEMERIKSAAN", "DITOLAK"].includes(parsed.status)) {
        verificationStatus = parsed.status;
        verificationNote = typeof parsed.note === "string" ? parsed.note : null;
      }
    } catch { /* Invalid log does not become a verification. */ }
  }
  const text = [alert.title, alert.description, alert.customCategory].filter(Boolean).join(" ").toLowerCase();
  const indicators = [
    ...(alert.description.trim().length < 30 ? ["Deskripsi singkat, dapat memerlukan klarifikasi."] : []),
    ...(!alert.photoUrl && !alert.image ? ["Tanpa foto pendukung (bukan bukti laporan palsu)."] : []),
    ...(/tolong|ancam|mencurigakan|kekerasan|pencurian|rumah kosong/i.test(text)
      ? ["Laporan sensitif: koordinasikan respons aman, jangan kirim warga sendirian."] : []),
  ];
  return NextResponse.json({ alert: {
    ...alert, verificationStatus, verificationNote,
    verifiedAt: audit?.createdAt || null, reviewIndicators: indicators,
  } });
}

// Administrator dashboard is read-only for incidents created by residents.
// Only the authenticated report owner may change report status.
// A future moderation workflow must be implemented explicitly with audited permissions.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.alert.findUnique({
    where: { id }, select: { userId: true, status: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== user.userId) {
    return NextResponse.json({ error: "Hanya pemilik laporan yang dapat mengubah status." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body.status;
  if (!["AKTIF", "DIPROSES", "SELESAI", "DIBATALKAN"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.alert.update({
      where: { id }, data: { status, resolvedAt: status === "SELESAI" ? new Date() : null },
    });
    if (existing.status !== status) {
      await tx.alertUpdate.create({
        data: { alertId: id, userId: user.userId, oldStatus: existing.status, newStatus: status },
      });
    }
    return changed;
  });
  return NextResponse.json({ success: true, alert: updated });
}
