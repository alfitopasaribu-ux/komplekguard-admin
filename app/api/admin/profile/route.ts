import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie, signToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import bcrypt from "bcryptjs";

const ADMIN_ROLES = ["ADMIN", "KETUA_RT"];
const MAX_IMAGE_DATA_LENGTH = 3_000_000;
const IMAGE_DATA = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;

async function currentUser(req: NextRequest) {
  const session = await getUserFromCookie(req);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.isActive || !ADMIN_ROLES.includes(user.role)) return null;
  return user;
}

const safeProfile = {
  id: true, name: true, email: true, phone: true, address: true,
  image: true, role: true, isActive: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser(req);
    if (!user) return NextResponse.json({ error: "Tidak memiliki akses." }, { status: 401 });
    const profile = await prisma.user.findUnique({
      where: { id: user.id }, select: safeProfile,
    });
    return NextResponse.json({ user: profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load admin profile", error);
    return NextResponse.json({ error: "Gagal memuat profil." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser(req);
    if (!user) return NextResponse.json({ error: "Tidak memiliki akses." }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Data formulir tidak valid." }, { status: 400 });
    }

    const { name, phone, address, image, currentPassword, newPassword } = body;
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return NextResponse.json({ error: "Nama wajib diisi, maksimal 100 karakter." }, { status: 400 });
    }
    if (typeof phone !== "string" || phone.length > 30) {
      return NextResponse.json({ error: "Nomor telepon tidak valid." }, { status: 400 });
    }
    if (typeof address !== "string" || address.length > 500) {
      return NextResponse.json({ error: "Alamat maksimal 500 karakter." }, { status: 400 });
    }
    if (image !== undefined && image !== null) {
      if (typeof image !== "string" || image.length > MAX_IMAGE_DATA_LENGTH || !IMAGE_DATA.test(image)) {
        return NextResponse.json({ error: "Format atau ukuran foto tidak valid. Gunakan JPEG, PNG, atau WebP." }, { status: 400 });
      }
    }

    const updateData: {
      name: string; phone: string | null; address: string | null;
      image?: string | null; passwordHash?: string;
    } = {
      name: name.trim(), phone: phone.trim() || null, address: address.trim() || null,
    };
    if (image !== undefined) updateData.image = image || null;

    if (newPassword !== undefined && newPassword !== "") {
      if (typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 128) {
        return NextResponse.json({ error: "Kata sandi baru wajib 12–128 karakter." }, { status: 400 });
      }
      if (typeof currentPassword !== "string" || !currentPassword) {
        return NextResponse.json({ error: "Masukkan kata sandi saat ini." }, { status: 400 });
      }
      if (!await bcrypt.compare(currentPassword, user.passwordHash)) {
        return NextResponse.json({ error: "Kata sandi saat ini salah." }, { status: 400 });
      }
      if (await bcrypt.compare(newPassword, user.passwordHash)) {
        return NextResponse.json({ error: "Kata sandi baru tidak boleh sama dengan yang lama." }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const saved = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id }, data: updateData, select: safeProfile,
      });
      await tx.activityLog.create({
        data: { userId: user.id, action: "UPDATE_PROFILE", description: "Administrator memperbarui profil akun" },
      });
      return updated;
    });

    revalidatePath("/admin", "layout");
    const token = await signToken({
      userId: user.id, email: saved.email, name: saved.name, role: saved.role,
    });
    const response = NextResponse.json({ success: true, user: saved });
    response.cookies.set("kg-admin-token", token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("Unable to save admin profile", error);
    return NextResponse.json({ error: "Gagal menyimpan perubahan profil." }, { status: 500 });
  }
}
