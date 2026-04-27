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



router.delete("/delete", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL gambar wajib dikirim",
      });
    }

    // hanya izinkan file dari /uploads/blog/
    if (!String(url).startsWith("/uploads/blog/")) {
      return res.status(400).json({
        success: false,
        message: "Path gambar tidak valid",
      });
    }

    const filename = path.basename(url);
    const filePath = path.join(uploadDir, filename);

    // cegah path traversal
    if (!filePath.startsWith(uploadDir)) {
      return res.status(400).json({
        success: false,
        message: "Path file tidak valid",
      });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({
      success: true,
      message: "Gambar berhasil dihapus",
    });
  } catch (error) {
    console.error("delete image error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus gambar",
    });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
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