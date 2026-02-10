const prisma = require("../../lib/prisma.js")

 const getHomeApk = async (req, res) => {
  try {
    const [menu, banner, runningText, contact, deposit] = await Promise.all([
      prisma.menu.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          operators: { include: { operator: true } },
        },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.runningText.findFirst({
        where: { isActive: true },
      }),
      prisma.contactApk.findFirst({
        where: { isActive: true },
      }),
      prisma.depositMethod.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          banks: {
            where: { isActive: true, status: "OPEN" },
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
    ]);

    res.json({
      menu: menu.map((m) => ({
        id: m.id,
        name: m.name,
        jenis: m.jenis.toLowerCase(),
        filter: m.filter,
        opendenom: m.openDenom,
        kodeproduk: m.kodeProduk,
        idoperator: m.operators.map((o) => o.operator.code),
        icon: m.icon,
      })),
      banner,
      runningteks: runningText
        ? { id: runningText.id, teks: runningText.text }
        : null,
      contact,
      deposit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = getHomeApk ;