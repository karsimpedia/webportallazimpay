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
