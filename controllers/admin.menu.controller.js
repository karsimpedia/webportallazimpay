const prisma = require("../lib/prisma");

const formatJenis = (jenis) => {
  if (!jenis) return null;
  return jenis.toLowerCase().replaceAll("_", "-");
};

exports.getMenu = async (req, res) => {
  try {
    const menu = await prisma.menu.findMany({
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
      jenis: formatJenis(m.jenis),
      filter: m.filter,
      opendenom: m.openDenom,
      kodeproduk: m.kodeProduk,
      url: m.url,
      isActive: m.isActive,
      idoperator: m.operators.map((o) => o.operator.code),
      icon: m.icon,
      sortOrder: m.sortOrder,
    }));

    res.json({ menu: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const {
      name,
      jenis,
      icon,
      img,
      filter = false,
      openDenom = false,
      kodeProduk,
      url,
      operatorCodes = [],
      sortOrder = 0,
    } = req.body;

    if (!name || !jenis || !icon) {
      return res.status(400).json({
        success: false,
        error: "name, jenis, icon wajib",
      });
    }

    /* ============================
       1. Ambil operator yang VALID
    ============================ */
    const operators = Array.isArray(operatorCodes)
      ? operatorCodes.map((c) => String(c).trim()).filter(Boolean)
      : [];

    let validOperatorCodes = [];

    if (operators.length > 0) {
      const existing = await prisma.operator.findMany({
        where: {
          code: { in: operators },
        },
        select: { code: true },
      });

      validOperatorCodes = existing.map((o) => o.code);
    }

    /* ============================
       2. Create menu
    ============================ */
    const menu = await prisma.menu.create({
      data: {
        name,
        jenis,
        icon,
        img,
        filter,
        openDenom,
        kodeProduk,
        url,
        sortOrder,
        isActive: true,

        operators: {
          create: validOperatorCodes.map((code) => ({
            operator: { connect: { code } },
          })),
        },
      },
    });

    /* ============================
       3. Response
    ============================ */
    const ignoredOperatorCodes = operators.filter(
      (c) => !validOperatorCodes.includes(c),
    );

    return res.json({
      success: true,
      menu,
      ignoredOperatorCodes, // optional info
    });
  } catch (err) {
    console.error("[createMenu]", err);
    return res.status(500).json({
      success: false,
      error: "create menu gagal",
    });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        operators: {
          include: {
            operator: true, // ambil detail operator
          },
        },
      },
    });

    if (!menu) {
      return res.status(404).json({ error: "Menu tidak ditemukan" });
    }

    // rapikan response untuk frontend
    const result = {
      ...menu,
      operatorCodes: menu.operators.map((o) => o.operator.code),
    };

    res.json({ success: true, menu: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil menu" });
  }
};

// UPDATE MENU
exports.updateMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      jenis,
      icon,
      img,
      filter = false,
      openDenom = false,
      kodeProduk,
      url,
      operatorCodes = [],
      sortOrder = 0,
      isActive = true,
    } = req.body;

    const codes = Array.isArray(operatorCodes)
      ? operatorCodes.map((c) => String(c).trim()).filter(Boolean)
      : [];

    const menu = await prisma.$transaction(async (tx) => {
      /* =========================
         1. Update menu utama
      ========================= */
      const updatedMenu = await tx.menu.update({
        where: { id },
        data: {
          name,
          jenis,
          icon,
          img,
          filter,
          openDenom,
          kodeProduk,
          url,
          sortOrder,
          isActive,

          /* =========================
             2. RESET + RECREATE RELATION
          ========================= */
          operators: {
            deleteMany: {}, // hapus semua relasi lama
            create: codes.map((code) => ({
              operator: {
                connectOrCreate: {
                  where: { code },
                  create: { code, name: null },
                },
              },
            })),
          },
        },
      });

      return updatedMenu;
    });

    return res.json({ success: true, menu });
  } catch (err) {
    console.error("[updateMenu]", err);
    return res.status(500).json({
      success: false,
      error: "update menu gagal",
    });
  }
};

// DELETE MENU
exports.deleteMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.menuOperator.deleteMany({ where: { menuId: id } });
    await prisma.menu.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete menu gagal" });
  }
};
