const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

async function generateUniqueCategorySlug(name, currentId = null) {
  const baseSlug = slugify(name) || `kategori-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogCategory.findFirst({
      where: {
        slug,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
    });

    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    let finalSlug = slug ? slugify(slug) : await generateUniqueCategorySlug(name);

    const exists = await prisma.blogCategory.findUnique({
      where: { slug: finalSlug },
    });

    if (exists) {
      finalSlug = await generateUniqueCategorySlug(name);
    }

    const data = await prisma.blogCategory.create({
      data: {
        name: String(name).trim(),
        slug: finalSlug,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data,
    });
  } catch (error) {
    console.error("createCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat kategori",
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const data = await prisma.blogCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getAllCategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori",
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const data = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        articles: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getCategoryById error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail kategori",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug } = req.body;

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    let finalSlug = existing.slug;

    if (slug && slugify(slug) !== existing.slug) {
      finalSlug = slugify(slug);

      const slugExists = await prisma.blogCategory.findFirst({
        where: {
          slug: finalSlug,
          NOT: { id },
        },
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Slug kategori sudah digunakan",
        });
      }
    } else if (!slug && name && name !== existing.name) {
      finalSlug = await generateUniqueCategorySlug(name, id);
    }

    const data = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        slug: finalSlug,
      },
    });

    return res.json({
      success: true,
      message: "Kategori berhasil diupdate",
      data,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal update kategori",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
      include: { articles: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    if (existing.articles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak bisa dihapus karena masih dipakai artikel",
      });
    }

    await prisma.blogCategory.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori",
    });
  }
};