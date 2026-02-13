const prisma = require("../../lib/prisma.js");

async function fetchDepositByCategory(category) {
  if (!category) throw new Error("Category is required");

  const methods = await prisma.depositMethod.findMany({
    where: {
      isActive: true,
      category,
    },
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

  return methods.flatMap((m) =>
    m.banks.map((b) => ({
      id: b.id,
      name: b.name,
      kodebank: b.bankCode,
      status: b.status,
      petunjuk: b.instruction || "",
    })),
  );
}

exports.getDepositByCategory = (defaultOption = null) => {
  return async (req, res) => {
    try {
      const category =
        req.params.category ||
        req.query.category ||
        req.body.category ||
        defaultOption;

      if (!category) {
        return res.status(400).json({
          error: "Category is required",
        });
      }

      const banks = await fetchDepositByCategory(category);

      if (!banks.length) {
        return res.status(404).json({
          error: "Category tidak ditemukan atau tidak ada bank aktif",
        });
      }

      return res.json(banks);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};

const formatJenis = (jenis) => {
  if (!jenis) return null;

  if (jenis === "alfamart" || jenis === "indomaret")
    return (jenis = jenis.toUpperCase()); // dulu type
  console.log("jenis", jenis);
  return jenis.toLowerCase().replaceAll("_", "-");
};

exports.getDepositOptions = async (req, res) => {
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
      jenis: formatJenis(m.code), // legacy compatible
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
