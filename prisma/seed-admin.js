const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function seedAdmin() {
  try {
    console.log("🔄 Seeding admin...");

    // ===============================
    // SUPERADMIN
    // ===============================
    const superUsername = process.env.SUPERADMIN_USER || "superadmin";
    const superPassword = process.env.SUPERADMIN_PASS || "Super123!";

    const existSuper = await prisma.admin.findUnique({
      where: { username: superUsername },
    });

    if (!existSuper) {
      const hash = await bcrypt.hash(superPassword, SALT_ROUNDS);

      await prisma.admin.create({
        data: {
          username: superUsername,
          password: hash,
          role: "SUPERADMIN",
          isActive: true,
        },
      });

      console.log("✅ SUPERADMIN dibuat");
      console.log("Username:", superUsername);
      console.log("Password:", superPassword);
    } else {
      console.log("⚡ SUPERADMIN sudah ada");
    }

    // ===============================
    // ADMIN
    // ===============================
    const adminUsername = process.env.ADMIN_USER || "admin";
    const adminPassword = process.env.ADMIN_PASS || "Admin123!";

    const existAdmin = await prisma.admin.findUnique({
      where: { username: adminUsername },
    });

    if (!existAdmin) {
      const hash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

      await prisma.admin.create({
        data: {
          username: adminUsername,
          password: hash,
          role: "ADMIN",
          isActive: true,
        },
      });

      console.log("✅ ADMIN dibuat");
      console.log("Username:", adminUsername);
      console.log("Password:", adminPassword);
    } else {
      console.log("⚡ ADMIN sudah ada");
    }

    console.log("🎉 Seeding selesai");
  } catch (err) {
    console.error("❌ Seeder error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
