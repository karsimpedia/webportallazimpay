"use strict";

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

function normalizeThumbnail(input) {
  if (!input) return null;

  const value = String(input).trim();

  if (!value) return null;

  // Tolak base64 agar DB tidak bengkak
  if (value.startsWith("data:image/")) {
    return null;
  }

  try {
    const url = new URL(value);

    // Kalau localhost/private URL, simpan path saja
    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    ) {
      return url.pathname;
    }

    // Kalau domain production, boleh disimpan full URL
    return value;
  } catch {
    // Kalau path biasa
    return value.startsWith("/") ? value : `/${value}`;
  }
}

async function generateUniqueArticleSlug(title, currentId = null) {
  const baseSlug = slugify(title) || `artikel-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogArticle.findFirst({
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

exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      author,
      isPublished,
      publishedAt,
      categoryId,
      seoTitle,
      metaDescription,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content wajib diisi",
      });
    }

    if (categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: parseInt(categoryId, 10) },
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Kategori tidak ditemukan",
        });
      }
    }

    let finalSlug = slug ? slugify(slug) : await generateUniqueArticleSlug(title);

    const exists = await prisma.blogArticle.findUnique({
      where: { slug: finalSlug },
    });

    if (exists) {
      finalSlug = await generateUniqueArticleSlug(title);
    }

    const publishStatus =
      isPublished === true || isPublished === "true" || isPublished === 1 || isPublished === "1";

    const data = await prisma.blogArticle.create({
      data: {
        title: String(title).trim(),
        slug: finalSlug,
        excerpt: excerpt || null,
        content: String(content),
        thumbnail: normalizeThumbnail(thumbnail),
        author: author || null,
        isPublished: publishStatus,
        publishedAt: publishStatus
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        seoTitle: seoTitle ? String(seoTitle).trim() : null,
        metaDescription: metaDescription ? String(metaDescription).trim() : null,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Artikel berhasil dibuat",
      data,
    });
  } catch (error) {
    console.error("createArticle error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat artikel",
    });
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const { search = "", published, categoryId, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: String(search), mode: "insensitive" } },
                { excerpt: { contains: String(search), mode: "insensitive" } },
                { content: { contains: String(search), mode: "insensitive" } },
                { author: { contains: String(search), mode: "insensitive" } },
                { seoTitle: { contains: String(search), mode: "insensitive" } },
                {
                  metaDescription: {
                    contains: String(search),
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        published === "true"
          ? { isPublished: true }
          : published === "false"
          ? { isPublished: false }
          : {},
        categoryId ? { categoryId: parseInt(categoryId, 10) } : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limitNum,
      }),
      prisma.blogArticle.count({ where }),
    ]);

    return res.json({
      success: true,
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getAllArticles error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil artikel",
    });
  }
};



exports.getPublishedArticles = async (req, res) => {
  try {
    const { search = "", categorySlug, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      isPublished: true,
      ...(search
        ? {
            OR: [
              { title: { contains: String(search), mode: "insensitive" } },
              { excerpt: { contains: String(search), mode: "insensitive" } },

              // content tetap boleh dicari, tapi tidak dikirim ke response list
              { content: { contains: String(search), mode: "insensitive" } },

              { author: { contains: String(search), mode: "insensitive" } },
              { seoTitle: { contains: String(search), mode: "insensitive" } },
              {
                metaDescription: {
                  contains: String(search),
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,

        // PENTING: jangan kirim content di halaman list
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          author: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          seoTitle: true,
          metaDescription: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },

        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limitNum,
      }),

      prisma.blogArticle.count({ where }),
    ]);

    return res.json({
      success: true,
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getPublishedArticles error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil artikel published",
    });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const data = await prisma.blogArticle.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getArticleById error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail artikel",
    });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const data = await prisma.blogArticle.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        category: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getArticleBySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil artikel",
    });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const {
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      author,
      isPublished,
      publishedAt,
      categoryId,
      seoTitle,
      metaDescription,
    } = req.body;

    const existing = await prisma.blogArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const category = await prisma.blogCategory.findUnique({
        where: { id: parseInt(categoryId, 10) },
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Kategori tidak ditemukan",
        });
      }
    }

    let finalSlug = existing.slug;

    if (slug && slugify(slug) !== existing.slug) {
      finalSlug = slugify(slug);

      const slugExists = await prisma.blogArticle.findFirst({
        where: {
          slug: finalSlug,
          NOT: { id },
        },
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Slug artikel sudah digunakan",
        });
      }
    } else if (!slug && title && title !== existing.title) {
      finalSlug = await generateUniqueArticleSlug(title, id);
    }

    const nextPublished =
      typeof isPublished === "boolean"
        ? isPublished
        : isPublished === "true"
        ? true
        : isPublished === "false"
        ? false
        : existing.isPublished;

    const data = await prisma.blogArticle.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() : existing.title,
        slug: finalSlug,
        excerpt: excerpt !== undefined ? excerpt || null : existing.excerpt,
        content: content !== undefined ? String(content) : existing.content,
        thumbnail:
          thumbnail !== undefined
            ? normalizeThumbnail(thumbnail)
            : existing.thumbnail,
        author: author !== undefined ? author || null : existing.author,
        isPublished: nextPublished,
        publishedAt: nextPublished
          ? publishedAt
            ? new Date(publishedAt)
            : existing.publishedAt || new Date()
          : null,
        categoryId:
          categoryId === undefined
            ? existing.categoryId
            : categoryId === null || categoryId === ""
            ? null
            : parseInt(categoryId, 10),
        seoTitle:
          seoTitle !== undefined
            ? seoTitle
              ? String(seoTitle).trim()
              : null
            : existing.seoTitle,
        metaDescription:
          metaDescription !== undefined
            ? metaDescription
              ? String(metaDescription).trim()
              : null
            : existing.metaDescription,
      },
      include: {
        category: true,
      },
    });

    return res.json({
      success: true,
      message: "Artikel berhasil diupdate",
      data,
    });
  } catch (error) {
    console.error("updateArticle error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal update artikel",
    });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.blogArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    await prisma.blogArticle.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("deleteArticle error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus artikel",
    });
  }
};

exports.publishArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.blogArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    const data = await prisma.blogArticle.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: existing.publishedAt || new Date(),
      },
      include: {
        category: true,
      },
    });

    return res.json({
      success: true,
      message: "Artikel berhasil dipublish",
      data,
    });
  } catch (error) {
    console.error("publishArticle error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal publish artikel",
    });
  }
};

exports.unpublishArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.blogArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    const data = await prisma.blogArticle.update({
      where: { id },
      data: {
        isPublished: false,
        publishedAt: null,
      },
      include: {
        category: true,
      },
    });

    return res.json({
      success: true,
      message: "Artikel berhasil di-unpublish",
      data,
    });
  } catch (error) {
    console.error("unpublishArticle error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal unpublish artikel",
    });
  }
};