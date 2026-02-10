const prisma = require("../lib/prisma");

exports.createDepositMethod = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      gateway,
      icon,
      description,
      sortOrder = 0,
    } = req.body;

    if (!name || !code || !category || !gateway || !icon) {
      return res.status(400).json({ error: "field wajib belum lengkap" });
    }

    const method = await prisma.depositMethod.create({
      data: {
        name,
        code,
        category,
        gateway,
        icon,
        description,
        sortOrder,
      },
    });

    res.json({ success: true, method });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create deposit method gagal" });
  }
};



// UPDATE DEPOSIT METHOD
exports.updateDepositMethod = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      code,
      category,
      gateway,
      icon,
      description,
      sortOrder,
      isActive,
    } = req.body;

    const method = await prisma.depositMethod.update({
      where: { id },
      data: {
        name,
        code,
        category,
        gateway,
        icon,
        description,
        sortOrder,
        isActive,
      },
    });

    res.json({ success: true, method });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update deposit method gagal" });
  }
};

// DELETE DEPOSIT METHOD (ikut hapus bank)
exports.deleteDepositMethod = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.depositBank.deleteMany({ where: { methodId: id } });
    await prisma.depositMethod.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete deposit method gagal" });
  }
};
