const express = require("express");
const router = express.Router();
const controller = require("../../controllers/blog/blogCategory.controller");
const { verifyAdmin, requireSuperAdmin } = require("../../middlewares/adminAuth");
router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);
router.post("/", verifyAdmin, controller.createCategory);
router.put("/:id", verifyAdmin, controller.updateCategory);
router.delete("/:id",verifyAdmin, controller.deleteCategory);

module.exports = router;