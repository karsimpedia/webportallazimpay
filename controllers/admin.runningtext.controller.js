const prisma = require("../lib/prisma");

exports.createRunningText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "text wajib" });
    }

    const runningText = await prisma.runningText.create({
      data: { text },
    });

    res.json({ success: true, runningText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create running text gagal" });
  }
};

exports.getRunningText = async (req, res) => {
  try {
    const runningTexts = await prisma.runningText.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      runningTexts,
    });
  } catch (err) {
    console.error("[getRunningText]", err);
    res.status(500).json({
      success: false,
      error: "get running text gagal",
    });
  }
};
exports.getRunningTextById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "id tidak valid",
      });
    }

    const runningText = await prisma.runningText.findUnique({
      where: { id },
    });

    if (!runningText) {
      return res.status(404).json({
        success: false,
        error: "Running text tidak ditemukan",
      });
    }

    res.json({
      success: true,
      runningText,
    });
  } catch (err) {
    console.error("[getRunningTextById]", err);
    res.status(500).json({
      success: false,
      error: "get running text by id gagal",
    });
  }
};

// UPDATE RUNNING TEXT
exports.updateRunningText = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { text, isActive } = req.body;

    const runningText = await prisma.runningText.update({
      where: { id },
      data: { text, isActive },
    });

    res.json({ success: true, runningText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update running text gagal" });
  }
};

// DELETE RUNNING TEXT
exports.deleteRunningText = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.runningText.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete running text gagal" });
  }
};
