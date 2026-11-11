const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Atur ADMIN_EMAIL dan ADMIN_PASSWORD yang kuat (minimum 12 karakter) melalui environment lokal. Jangan gunakan password default.");
  }
  const hash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== "ADMIN") {
    throw new Error("Email sudah digunakan oleh akun non-admin. Tidak ada perubahan.");
  }
  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash: hash, isActive: true } });
    console.log("Kata sandi akun admin diperbarui.");
  } else {
    await prisma.user.create({
      data: { email, passwordHash: hash, name: "Administrator KomplekGuard", role: "ADMIN", isActive: true },
    });
    console.log("Akun admin dibuat.");
  }
}

main().catch(err => { console.error(err.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
