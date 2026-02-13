const prisma = require("../lib/prisma");



exports.getDepositBank = async (req, res) => {
  try {
    const banks = await prisma.depositBank.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        method: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    res.json({
      success: true,
      banks,
    });
  } catch (err) {
    console.error("[getDepositBank]", err);
    res.status(500).json({
      success: false,
      error: "get bank gagal",
    });
  }
};


exports.getDepositBankById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const bank = await prisma.depositBank.findUnique({
      where: { id },
      include: {
        method: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!bank) {
      return res.status(404).json({
        success: false,
        error: "Bank tidak ditemukan",
      });
    }

    res.json({
      success: true,
      bank,
    });
  } catch (err) {
    console.error("[getDepositBankById]", err);
    res.status(500).json({
      success: false,
      error: "get bank by id gagal",
    });
  }
};


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
