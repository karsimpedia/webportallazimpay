const express = require("express");
const router = express.Router();

const menu = require("../controllers/admin.menu.controller");
const deposit = require("../controllers/admin.deposit.controller");
const bank = require("../controllers/admin.bank.controller");
const banner = require("../controllers/admin.banner.controller");
const contact = require("../controllers/admin.contact.controller");
const running = require("../controllers/admin.runningtext.controller");
const favoritMenu = require("../controllers/admin.favoriteMenu.controller");
const auth = require("../controllers/admin.auth.controller");

router.post("/login", auth.login);
router.post("/logout", auth.logout);

// MENU

router.get("/menu/:id", menu.getMenuById);
router.put("/menu/:id", menu.updateMenu);
router.delete("/menu/:id", menu.deleteMenu);
router.post("/menu", menu.createMenu);
router.get("/menu", menu.getMenu);

router.get("/favorite-menu", favoritMenu.getFavoriteMenu);
router.get("/favorite-menu/:id", favoritMenu.getFavoriteMenuById);
router.delete("/favorite-menu/:id", favoritMenu.deleteFavoriteMenu);
router.put("/favorite-menu/:id", favoritMenu.updateFavoriteMenu);
router.post("/favorite-menu", favoritMenu.createFavoriteMenu);


// DEPOSIT
router.put("/deposit/method/:id", deposit.updateDepositMethod);
router.get("/deposit/method/:id", deposit.getDepositMethodById);
router.delete("/deposit/method/:id", deposit.deleteDepositMethod);
router.post("/deposit/method", deposit.createDepositMethod);
router.get("/deposit/method", deposit.getDepositMethod);

// BANK
router.put("/deposit/bank/:id", bank.updateDepositBank);
router.get("/deposit/bank/:id", bank.getDepositBankById);
router.delete("/deposit/bank/:id", bank.deleteDepositBank);
router.post("/deposit/bank", bank.createDepositBank);
router.get("/deposit/bank", bank.getDepositBank);

// BANNER
router.put("/banner/:id", banner.updateBanner);
router.delete("/banner/:id", banner.deleteBanner);
router.get("/banner/:id", banner.getBannerByid);
router.get("/banner", banner.getBanner);
router.post("/banner", banner.createBanner);

// CONTACT
router.put("/contact/:id", contact.updateContactApk);
router.get("/contact/:id", contact.getContactApkById);
router.delete("/contact/:id", contact.deleteContactApk);
router.post("/contact", contact.createContactApk);
router.get("/contact", contact.getContactApk);


// RUNNING TEXT
router.put("/running-text/:id", running.updateRunningText);
router.get("/running-text/:id", running.getRunningTextById);
router.get("/running-text", running.getRunningText);
router.delete("/running-text/:id", running.deleteRunningText);
router.post("/running-text", running.createRunningText);

module.exports = router;
