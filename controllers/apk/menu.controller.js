
const prisma = require("../../lib/prisma.js")
 const getMenuApk = async (req, res) => {
  try {
    const menu = await prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        operators: {
          include: {
            operator: {
              select: { code: true },
            },
          },
        },
      },
    });

    const data = menu.map((m) => ({
      id: m.id,
      name: m.name,
      img: m.img,
      jenis: m.jenis.toLowerCase(),
      filter: m.filter,
      opendenom: m.openDenom,
      kodeproduk: m.kodeProduk,
      url: m.url,
      isActive: m.isActive,
      idoperator: m.operators.map((o) => o.operator.code),
      icon: m.icon,
      sortOrder: m.sortOrder
    }));

    res.json({ menu: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = getMenuApk ;