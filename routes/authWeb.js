var express = require("express");
var router = express.Router();
let iconApk = require("../controllers/auth_web/consoleApk");
const ContackApk = require("../controllers/auth_web/contactApk");
let omnichannel = require("../controllers/omniTelkomsel");
let ceknomor = require("../controllers/cekNomohp");
const DepositBank = require("../controllers/auth_web/DepositBank");
let VaBankReady = require("../controllers/auth_web/VaBankReady");
let LinqkuDepositUniq = require("../controllers/auth_web/DepositUniqueByLinqu");
const {
    sendPush,
    loginByPhone,
    loginWebTrx,
    validasiToken,
    otpVerify,
    forgotPinRec,
    forgotPinVerifyOtp,
    forgotPinFinal,
    callBackLinqu,
    RegisterUSer,
    loginByPhoneV2,
    otpVerifyV2,
    validasiTokenV2,
    LoginNewSession,
} = require("../controllers/auth_web/index.js");

router.post("/login", loginWebTrx);
router.post("/loginhp", loginByPhone);
router.post("/otpverify", otpVerify);
router.post("/validasitoken", validasiToken);
router.post("/loginhp/v2", loginByPhoneV2);
router.post("/otpverify/v2", otpVerifyV2);
router.post("/validasitoken/v2", validasiTokenV2);
router.post("/newsession", LoginNewSession);

router.post("/forgotpin", forgotPinRec);
router.post("/forgototpverify", forgotPinVerifyOtp);
router.post("/ubahpin", forgotPinFinal);
router.post("/assetsapk", iconApk);
router.post("/kontact", ContackApk);
router.post("/listdeposit", DepositBank);
router.post("/va-bank", VaBankReady);
router.post("/deposit-kode-unik-bank-linkqu", LinqkuDepositUniq);
router.post("/register", RegisterUSer);
router.post("/callback-linkqu", callBackLinqu);
//router.get("/sendpush", sendPush);

router.post("/omni/list", omnichannel.getProduct);
router.post("/omni/order", omnichannel.Purchase);
router.post("/ceknomor", ceknomor);

module.exports = router;