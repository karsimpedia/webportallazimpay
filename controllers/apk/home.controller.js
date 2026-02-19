const prisma = require("../../lib/prisma.js");

const formatJenis = (jenis) => {
  if (!jenis) return null;

  if (jenis === "TRX_PPOB_SINGLE") jenis = "TRX_PPOB_SINGGLE"; // dulu type
  console.log("jenis", jenis);
  return jenis.toLowerCase().replaceAll("_", "-");
};

const getHomeApk = async (req, res) => {
  try {
    const [menu, favoriteMenu, banner, runningText, contact, deposit] =
      await Promise.all([
        prisma.menu.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            operators: {
              include: { operator: true },
            },
          },
        }),

        prisma.favoriteMenu.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            operators: {
              include: { operator: true },
            },
          },
        }),

        prisma.banner.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            imgUrl: true,
            sortOrder: true,
          },
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
              where: {
                isActive: true,
                status: "OPEN",
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        }),
      ]);


       console.log(favoriteMenu)
    res.json({
      menu: menu.map((m) => ({
        id: m.id,
        name: m.name,
        jenis: formatJenis(m.jenis),
        filter: m.filter,
        opendenom: m.openDenom,
        kodeproduk: m.kodeProduk ?? null,
        url: m.url ?? null,
        idoperator: m.operators.map((o) => o.operator.code),
        icon: m.icon,
      })),

      menufavorit: favoriteMenu.map((m) => ({
        id: m.id,
        name: m.name,
        jenis: formatJenis(m.jenis),
        filter: m.filter,
        opendenom: m.openDenom,
        kodeproduk: m.kodeProduk ?? null,
        url: m.url ?? null,
        idoperator: m.operators.map((o) => o.operator.code),
        icon: m.icon,
      })),

      banner: banner.map((m) => ({
        id: m.id,
        sortOrder: m.sortOrder,
        title: m.title,
        imgurl: m.imgUrl,
      })),

      runningteks: runningText
        ? {
            id: runningText.id,
            teks: runningText.text,
          }
        : null,

      contact: contact ?? null,
    });


   
  } catch (err) {
    console.error("[getHomeApk]", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = getHomeApk;
