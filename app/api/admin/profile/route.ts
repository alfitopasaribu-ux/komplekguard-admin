import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromCookie(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, phone: true, address: true, image: true, role: true },
    });
    return NextResponse.json({ user });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getUserFromCookie(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, phone, address, image, currentPassword, newPassword } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (image !== undefined) updateData.image = image || null;

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: "Password lama wajib diisi" }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, address: true, image: true, role: true },
    });

    await prisma.activityLog.create({
      data: { userId: session.userId, action: "UPDATE_PROFILE", description: "Admin mengupdate profil" },
    });

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Gagal menyimpan" }, { status: 500 });
  }
}
