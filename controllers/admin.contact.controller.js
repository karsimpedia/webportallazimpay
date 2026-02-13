const prisma = require("../lib/prisma");

exports.createContactApk = async (req, res) => {
  try {
    const { whatsapp, telegram, email, instagram } = req.body;

    const contact = await prisma.contactApk.create({
      data: { whatsapp, telegram, email, instagram },
    });

    res.json({ success: true, contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create contact gagal" });
  }
};


exports.getContactApk = async (req, res) => {
  try {
    const contacts = await prisma.contactApk.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      contacts,
    });
  } catch (err) {
    console.error("[getContactApk]", err);
    res.status(500).json({
      success: false,
      error: "get contact gagal",
    });
  }
};

exports.getContactApkById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "id tidak valid",
      });
    }

    const contact = await prisma.contactApk.findUnique({
      where: { id },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact tidak ditemukan",
      });
    }

    res.json({
      success: true,
      contact,
    });
  } catch (err) {
    console.error("[getContactApkById]", err);
    res.status(500).json({
      success: false,
      error: "get contact by id gagal",
    });
  }
};

// UPDATE CONTACT
exports.updateContactApk = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { whatsapp, telegram, email, instagram, isActive } = req.body;

    const contact = await prisma.contactApk.update({
      where: { id },
      data: { whatsapp, telegram, email, instagram, isActive },
    });

    res.json({ success: true, contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update contact gagal" });
  }
};

// DELETE CONTACT
exports.deleteContactApk = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.contactApk.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete contact gagal" });
  }
};
