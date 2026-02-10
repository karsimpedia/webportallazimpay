const prisma = require("../../lib/prisma.js")

 const getDepositOptions = async (req, res) => {
  try {
    const methods = await prisma.depositMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        banks: {
          where: {
            isActive: true,
            status: "OPEN",
          },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            bankCode: true,
            instruction: true,
            status: true,
          },
        },
      },
    });

    const data = methods.map((m) => ({
      id: m.id,
      name: m.name,
      jenis: m.code, // legacy compatible
      ket: m.description,
      img: m.icon,
      category: m.category,
      gateway: m.gateway,
      banks: m.banks.map((b) => ({
        id: b.id,
        name: b.name,
        kodebank: b.bankCode,
        status: b.status,
        petunjuk: b.instruction || "",
      })),
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = getDepositOptions ;