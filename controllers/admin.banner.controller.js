const prisma = require("../lib/prisma");

exports.getBanner = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        title: true,
        imgUrl: true,
        sortOrder: true,
        isActive: true,
      },
    });

    return res.json({
      success: true,
      banner: banners,
    });
  } catch (err) {
    console.error("[getBanner]", err);
    return res.status(500).json({
      success: false,
      error: "gagal ambil banner",
    });
  }
};

exports.getBannerByid = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const banners = await prisma.banner.findUnique({
      where: { id },
      
      
    });

    return res.json({
      success: true,
      banner: banners,
    });
  } catch (err) {
    console.error("[getBanner]", err);
    return res.status(500).json({
      success: false,
      error: "gagal ambil banner",
    });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, imgUrl, sortOrder = 0 } = req.body;

    if (!title || !imgUrl) {
      return res.status(400).json({ error: "title & imgUrl wajib" });
    }

    const banner = await prisma.banner.create({
      data: { title, imgUrl, sortOrder },
    });

    res.json({ success: true, banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create banner gagal" });
  }
};

// UPDATE BANNER
exports.updateBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, imgUrl, sortOrder, isActive } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: { title, imgUrl, sortOrder, isActive },
    });

    res.json({ success: true, banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update banner gagal" });
  }
};

// DELETE BANNER
exports.deleteBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.banner.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete banner gagal" });
  }
};
