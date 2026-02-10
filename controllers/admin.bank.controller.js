const prisma = require("../lib/prisma");

exports.createDepositBank = async (req, res) => {
  try {
    const { methodId, name, bankCode, instruction, sortOrder = 0 } = req.body;

    if (!methodId || !name || !bankCode) {
      return res.status(400).json({ error: "methodId, name, bankCode wajib" });
    }

    const bank = await prisma.depositBank.create({
      data: {
        methodId,
        name,
        bankCode,
        instruction,
        sortOrder,
      },
    });

    res.json({ success: true, bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create bank gagal" });
  }
};

// UPDATE BANK
exports.updateDepositBank = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, bankCode, instruction, status, sortOrder, isActive } =
      req.body;

    const bank = await prisma.depositBank.update({
      where: { id },
      data: {
        name,
        bankCode,
        instruction,
        status,
        sortOrder,
        isActive,
      },
    });

    res.json({ success: true, bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update bank gagal" });
  }
};

// DELETE BANK
exports.deleteDepositBank = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.depositBank.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete bank gagal" });
  }
};
