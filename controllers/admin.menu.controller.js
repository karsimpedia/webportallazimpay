const prisma = require("../lib/prisma");

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
      return res.status(400).json({ error: "name, jenis, icon wajib" });
    }

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
        operators: {
          create: operatorCodes.map((code) => ({
            operator: { connect: { code } },
          })),
        },
      },
    });

    res.json({ success: true, menu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create menu gagal" });
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
      filter,
      openDenom,
      kodeProduk,
      url,
      operatorCodes,
      sortOrder,
      isActive,
    } = req.body;

    // update menu utama
    const menu = await prisma.menu.update({
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
      },
    });

    // kalau operator diubah → reset relasi
    if (Array.isArray(operatorCodes)) {
      await prisma.menuOperator.deleteMany({ where: { menuId: id } });

      await prisma.menuOperator.createMany({
        data: operatorCodes.map((code) => ({
          menuId: id,
          operatorId: undefined, // di-resolve lewat connect
        })),
        skipDuplicates: true,
      });

      // cara aman (connect)
      await prisma.menu.update({
        where: { id },
        data: {
          operators: {
            create: operatorCodes.map((code) => ({
              operator: { connect: { code } },
            })),
          },
        },
      });
    }

    res.json({ success: true, menu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update menu gagal" });
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


