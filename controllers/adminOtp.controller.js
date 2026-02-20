const prisma = require("../lib/prisma");

/* =========================
   LIST
========================= */
exports.listOtp = async (req, res) => {
  try {
    const data = await prisma.otpApiSetting.findMany({
      orderBy: { updatedAt: "desc" },
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET BY ID
========================= */
exports.getOtp = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const data = await prisma.otpApiSetting.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({ error: "Tidak ditemukan" });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   CREATE
========================= */
exports.createOtp = async (req, res) => {
  try {
    const {
      name,
      baseUrl,
      apiKey,
      method,
      headers,
      bodyJson,
      variables,
       priority,
      isActive,
    } = req.body;

    console.log(req.body)
    if (!name || !baseUrl) {
      return res.status(400).json({ error: "name & baseUrl wajib diisi" });
    }

    // kalau aktif → nonaktifkan lainnya
    if (isActive === true) {
      await prisma.otpApiSetting.updateMany({
        data: { isActive: false },
      });
    }

    const created = await prisma.otpApiSetting.create({
      data: {
        name,
        baseUrl,
        apiKey,
        method: method || "POST",
        headers,
        bodyJson,
        variables,
        priority,
        isActive: isActive || false,
      },
    });

    res.json({ success: true, data: created });
  } catch (err) {
    console.log( err)
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE
========================= */
exports.updateOtp = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.otpApiSetting.findUnique({
      where: { id },
    });

    if (!exists) {
      return res.status(404).json({ error: "Tidak ditemukan" });
    }

    const {
      name,
      baseUrl,
      apiKey,
      method,
priority,
      headers,
      bodyJson,
      variables,
      isActive,
    } = req.body;

    if (isActive === true) {
      await prisma.otpApiSetting.updateMany({
        data: { isActive: false },
      });
    }

    const updated = await prisma.otpApiSetting.update({
      where: { id },
      data: {
        name,
        baseUrl,
        apiKey,
        method: method || "POST",
        headers,
        bodyJson,
        priority,
        variables,
        isActive,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.log( err)
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE
========================= */
exports.deleteOtp = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.otpApiSetting.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (err) {
    console.log( err)
    res.status(500).json({ error: err.message });
  }
};
