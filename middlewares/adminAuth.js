const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret_admin";

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  try {
    const token =
      req.cookies.admin_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid" });
  }
};

exports.requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "SUPERADMIN") {
    return res.status(403).json({ error: "Akses ditolak" });
  }
  next();
};
