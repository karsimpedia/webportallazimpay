const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_admin";
const JWT_EXPIRES = "1d";
const SALT_ROUNDS = 10;

/* =====================================================
   HELPER: GENERATE TOKEN
===================================================== */
function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/* =====================================================
   LOGIN
===================================================== */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username & password wajib diisi" });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: "Login gagal" });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res.status(401).json({ error: "Login gagal" });
    }

    const token = generateToken(admin);

    res.cookie("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =====================================================
   LOGOUT
===================================================== */
exports.logout = async (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
};

/* =====================================================
   GET PROFILE (ME)
===================================================== */
exports.me = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin tidak ditemukan" });
    }

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/* =====================================================
   CREATE ADMIN (SUPERADMIN ONLY)
===================================================== */
exports.create = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username & password wajib" });
    }

    const exist = await prisma.admin.findUnique({ where: { username } });
    if (exist) {
      return res.status(400).json({ error: "Username sudah digunakan" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hash,
        role: role || "ADMIN",
      },
    });

    res.json({ success: true, data: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat admin" });
  }
};

/* =====================================================
   UPDATE PASSWORD
===================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) {
      return res.status(400).json({ error: "Password lama salah" });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hash },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal ubah password" });
  }
};

/* =====================================================
   TOGGLE ACTIVE (SUPERADMIN)
===================================================== */
exports.toggleActive = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) return res.status(404).json({ error: "Admin tidak ada" });

    const updated = await prisma.admin.update({
      where: { id },
      data: { isActive: !admin.isActive },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: "Error toggle" });
  }
};
