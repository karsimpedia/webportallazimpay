const prisma = require("../../lib/prisma.js")

exports.getFavoriteMenu = async (req, res) => {
  try {
    const data = await prisma.favoriteMenu.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        operators: {
          include: {
            operator: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    const result = data.map((m) => ({
      id: m.id,
      name: m.name,
      img: m.img,
      jenis: m.jenis,
      filter: m.filter,
      openDenom: m.openDenom,
      icon: m.icon,
      idoperator: m.operators.map((o) => o.operator.code),
    }));

    res.json({
      success: true,
      menufavorit: result,
    });
  } catch (err) {
    console.error("[getFavoriteMenu]", err);
    res.status(500).json({
      success: false,
      error: "gagal ambil menu favorit",
    });
  }
};
