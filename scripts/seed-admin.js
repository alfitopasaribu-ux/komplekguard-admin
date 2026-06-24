const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@komplekguard.id";
  const password = process.env.ADMIN_PASSWORD || "bes4youAi";

  const hash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash: hash, role: "ADMIN", name: "Administrator KomplekGuard" } });
    console.log("✅ Admin user updated");
  } else {
    await prisma.user.create({ data: { email, passwordHash: hash, name: "Administrator KomplekGuard", role: "ADMIN" } });
    console.log("✅ Admin user created");
  }
  console.log("📧 Email:", email);
  console.log("🔑 Password: (disembunyikan)");

}

main().catch(console.error).finally(() => prisma.$disconnect());
