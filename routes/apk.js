var express = require("express");

const { getDepositOptions, getDepositByCategory } = require("../controllers/apk/deposit.controller.js");
const getContactApk = require("../controllers/apk/contact.controller.js");
const getMenuApk = require("../controllers/apk/menu.controller.js");
const getHomeApk = require("../controllers/apk/home.controller.js");
const {
  getFavoriteMenu,
} = require("../controllers/apk/favoriteMenu.controller.js");
const router = express.Router();

router.get("/menu", getMenuApk);
router.get("/contact", getContactApk);
// router.get("/deposit", getDepositOptions);
router.get("/deposit", getDepositByCategory("VIRTUAL_ACCOUNT"));
router.get("/home", getHomeApk);
// APK
router.get("/menu-favorit", getFavoriteMenu);

module.exports = router;
