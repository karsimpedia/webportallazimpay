const express = require("express");
const router = express.Router();
const controller = require("../../controllers/blog/blogArticle.controller");
const { verifyAdmin, requireSuperAdmin } = require("../../middlewares/adminAuth");
// public
router.get("/published", controller.getPublishedArticles);
router.get("/slug/:slug", controller.getArticleBySlug);

// admin/internal
router.get("/", controller.getAllArticles);
router.get("/:id", controller.getArticleById);
router.post("/", verifyAdmin,controller.createArticle);
router.put("/:id",verifyAdmin, controller.updateArticle);
router.delete("/:id",verifyAdmin, controller.deleteArticle);
router.patch("/:id/publish",verifyAdmin, controller.publishArticle);
router.patch("/:id/unpublish", verifyAdmin,controller.unpublishArticle);

module.exports = router;