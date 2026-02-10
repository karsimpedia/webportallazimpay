const prisma = require("../../lib/prisma.js")

const getContactApk = async (req, res) => {
  try {
    const contact = await prisma.contactApk.findFirst({
      where: { isActive: true },
      select: {
        whatsapp: true,
        telegram: true,
        email: true,
        instagram: true,
      },
    });

    res.json(contact || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = getContactApk ;
