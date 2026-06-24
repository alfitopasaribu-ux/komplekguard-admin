import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now > a.resetAt) { attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); return true; }
  if (a.count >= 5) return false;
  a.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(ip)) return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi 15 menit." }, { status: 429 });

    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (user.role !== "ADMIN" && user.role !== "KETUA_RT")) {
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });

    await prisma.activityLog.create({
      data: { userId: user.id, action: "ADMIN_LOGIN", description: `Login dari IP: ${ip}` },
    });

    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.cookies.set("kg-admin-token", token, AUTH_COOKIE_OPTIONS);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
