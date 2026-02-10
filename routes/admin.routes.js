const express = require("express");
const router = express.Router();

const menu = require("../controllers/admin.menu.controller");
const deposit = require("../controllers/admin.deposit.controller");
const bank = require("../controllers/admin.bank.controller");
const banner = require("../controllers/admin.banner.controller");
const contact = require("../controllers/admin.contact.controller");
const running = require("../controllers/admin.runningtext.controller");

// MENU

router.put("/menu/:id", menu.updateMenu);
router.delete("/menu/:id", menu.deleteMenu);
router.post("/menu", menu.createMenu);

// DEPOSIT
router.put("/deposit/method/:id", deposit.updateDepositMethod);
router.delete("/deposit/method/:id", deposit.deleteDepositMethod);
router.post("/deposit/method", deposit.createDepositMethod);


// BANK
router.put("/deposit/bank/:id", bank.updateDepositBank);
router.delete("/deposit/bank/:id", bank.deleteDepositBank);
router.post("/deposit/bank", bank.createDepositBank);

// BANNER
router.put("/banner/:id", banner.updateBanner);
router.delete("/banner/:id", banner.deleteBanner);
router.post("/banner", banner.createBanner);

// CONTACT
router.put("/contact/:id", contact.updateContactApk);
router.delete("/contact/:id", contact.deleteContactApk);
router.post("/contact", contact.createContactApk);

// RUNNING TEXT
router.put("/running-text/:id", running.updateRunningText);
router.delete("/running-text/:id", running.deleteRunningText);
router.post("/running-text", running.createRunningText);

module.exports = router;
