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
