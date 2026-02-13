const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_admin";

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !admin.isActive) {
    return res.status(401).json({ error: "Login gagal" });
  }

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ error: "Login gagal" });

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true kalau HTTPS
  });

  res.json({ success: true });
};

exports.logout = async (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
};
