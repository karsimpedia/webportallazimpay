

var express = require("express");


const getDepositOptions = require("../controllers/apk/deposit.controller.js")
const getContactApk = require("../controllers/apk/contact.controller.js")
const getMenuApk = require("../controllers/apk/menu.controller.js")
const getHomeApk = require("../controllers/apk/home.controller.js")
const router = express.Router();

router.get("/menu", getMenuApk);
router.get("/contact", getContactApk);
router.get("/deposit", getDepositOptions);
router.get("/home", getHomeApk);

module.exports = router;
