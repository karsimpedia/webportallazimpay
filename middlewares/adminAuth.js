const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret_admin";

module.exports = function adminAuth(req, res, next) {
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
