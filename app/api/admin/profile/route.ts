import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getUserFromCookie(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, address: true, image: true, role: true },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getUserFromCookie(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, phone, address, image, currentPassword, newPassword } = await req.json();

  const updateData: any = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (image !== undefined) updateData.image = image;

  if (newPassword) {
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
}
