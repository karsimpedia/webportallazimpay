const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(process.cwd(), "public", "uploads", "blog");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9.\-_]/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      url: `/uploads/blog/${req.file.filename}`,
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error("upload-image error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal upload gambar",
    });
  }
});

module.exports = router;