const prisma = require("../lib/prisma");




const formatJenis = (jenis) => {
  if (!jenis) return null;
  return jenis.toLowerCase().replaceAll("_", "-");
};


exports.deleteFavoriteMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.favoriteMenu.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Favorite menu berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteFavoriteMenu]", err);
    res.status(500).json({
      success: false,
      error: "gagal hapus favorite menu",
    });
  }
};

exports.updateFavoriteMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      jenis,
      img,
      icon,
      filter = false,
      openDenom = false,
      operatorCodes = [],
      sortOrder = 0,
      isActive = true,
    } = req.body;

    const codes = Array.isArray(operatorCodes)
      ? operatorCodes.map((c) => String(c).trim()).filter(Boolean)
      : [];

    const menu = await prisma.$transaction(async (tx) => {
      return tx.favoriteMenu.update({
        where: { id },
        data: {
          name,
          jenis,
          img,
          icon,
          filter,
          openDenom,
          sortOrder,
          isActive,

          operators: {
            deleteMany: {}, // reset relasi
            create: codes.map((code) => ({
              operator: {
                connectOrCreate: {
                  where: { code },
                  create: { code },
                },
              },
            })),
          },
        },
      });
    });

    res.json({ success: true, menu });
  } catch (err) {
    console.error("[updateFavoriteMenu]", err);
    res.status(500).json({
      success: false,
      error: "update favorite menu gagal",
    });
  }
};

exports.createFavoriteMenu = async (req, res) => {
  try {
    const {
      name,
      jenis,
      img,
      icon,
      filter = false,
      openDenom = false,
      operatorCodes = [],
      sortOrder = 0,
    } = req.body;

    if (!name || !jenis || !icon) {
      return res.status(400).json({
        success: false,
        error: "name, jenis, icon wajib",
      });
    }

    const codes = Array.isArray(operatorCodes)
      ? operatorCodes.map((c) => String(c).trim()).filter(Boolean)
      : [];

    const menu = await prisma.favoriteMenu.create({
      data: {
        name,
        jenis,
        img,
        icon,
        filter,
        openDenom,
        sortOrder,
        isActive: true,

        operators: {
          create: codes.map((code) => ({
            operator: {
              connectOrCreate: {
                where: { code },
                create: { code },
              },
            },
          })),
        },
      },
    });

    res.json({ success: true, menu });
  } catch (err) {
    console.error("[createFavoriteMenu]", err);
    res.status(500).json({
      success: false,
      error: "create favorite menu gagal",
    });
  }
};




exports.getFavoriteMenuById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const menu = await prisma.favoriteMenu.findUnique({
      where: { id },
      include: {
        operators: {
          include: {
            operator: true,
          },
        },
      },
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Favorite menu tidak ditemukan",
      });
    }

    res.json({
      success: true,
      menu: {
        id: menu.id,
        name: menu.name,
        jenis: formatJenis(menu.jenis),
        filter: menu.filter,
        opendenom: menu.openDenom,
        kodeproduk: menu.kodeProduk ?? null,
        url: menu.url ?? null,
        isActive: menu.isActive,
        sortOrder: menu.sortOrder,
        icon: menu.icon,
        idoperator: menu.operators.map((o) => o.operator.code),
        operators: menu.operators.map((o) => ({
          id: o.operator.id,
          code: o.operator.code,
          name: o.operator.name,
        })),
      },
    });
  } catch (err) {
    console.error("[getFavoriteMenuById]", err);
    res.status(500).json({
      success: false,
      error: "get favorite menu gagal",
    });
  }
};



exports.getFavoriteMenu = async (req, res) => {
  try {
    const data = await prisma.favoriteMenu.findMany({
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
      isActive: m.isActive,
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
