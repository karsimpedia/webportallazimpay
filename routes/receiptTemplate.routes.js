const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/receiptTemplate.controller");
const { verifyAdmin, requireSuperAdmin } = require("../middlewares/adminAuth");

// ===== Template CRUD =====
router.get("/receipt-template", verifyAdmin, ctrl.listTemplates);
router.post("/receipt-template", verifyAdmin, requireSuperAdmin, ctrl.createTemplate);
router.get("/receipt-template/:id", verifyAdmin, ctrl.getTemplateById);
router.put("/receipt-template/:id", verifyAdmin, requireSuperAdmin, ctrl.updateTemplate);
router.delete("/receipt-template/:id", verifyAdmin, requireSuperAdmin, ctrl.deleteTemplate);

// preview render manual (untuk editor template di dashboard)
router.post("/receipt-template/:id/preview", verifyAdmin, ctrl.previewTemplate);

// ===== Receipt dari transaksi =====
router.get("/receipt/:trxId", verifyAdmin, ctrl.getReceiptByTransaction);

module.exports = router;
