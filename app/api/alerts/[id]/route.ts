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
  return NextResponse.json({ alert });
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
