var express = require("express");
var router = express.Router();
var customeToken = require("../controllers/custometoken");
var paymentgateway = require("../controllers/paymentgateway");
var api = require("../controllers/api");
const TransactionController = require("../controllers/transactions");
var pricelist = require("../controllers/pricelist");
var cetak = require("../controllers/cetakstruk");
const cetakBaru = require("../controllers/cetak.controller")

var Downline = require("../controllers/downline");
var Hadiah = require("../controllers/poinreward");
var Komisi = require("../controllers/komisi");
let linkqupay = require("../controllers/linkquPay");
var ProductControllers = require("../controllers/product");
let cetaknew = require("../controllers/controllerscetak");
var avianaPay = require("../controllers/avianaPay");
var VoucherFisikControllers = require("../controllers/voucherfisik");
const ctrl = require("../controllers/receiptTemplate.controller");
router.post("/receipt",  ctrl.getReceiptByTransaction);
// router.get("/hadiah", Hadiah.listhadiah);
// router.get("/hadiah/reward", Hadiah.getRewards);
// router.post("/hadiah/redeem", Hadiah.redeemNow);

// router.post("/auth/custometoken", customeToken.authtoken);
// router.post("/loginexistingphone", customeToken.loginexistingphone);
// router.post("/topupdepositinv", paymentgateway.createInv);

// router.post("/auth/cektoken", customeToken.cektoken);

// router.get("/category", api.getcategory);

// router.post("/resetcredential", api.resetuser);
// router.post("/loginregister", api.loginregister);

router.get("/getme", api.getme);
// router.post("/cekpin", api.cekPIN);
// router.post("/cekdevice", api.cekdevice);
// router.post("/cekregister", api.CekEsisting);
// router.post("/accountKit", api.accountKit);
router.post("/register", Downline.regonline);
router.get("/downline", Downline.getdownline);
router.post("/regdownline", Downline.regdownline);
router.post("/markup", Downline.EditSelisih);

router.get("/komisi", Komisi.HistoriKomisi); //belum
router.post("/komisi", Komisi.RedeemKomisi);

router.post("/trx", TransactionController.payNow);
router.post("/transfer", Downline.TransferBalance);
router.post("/transferinq", Downline.TrfINQ);

router.get("/rekaptrx", api.rekapTrx);
router.get("/historisaldo", api.historisaldo);
router.get("/historitrx", api.historitrx);
router.get("/historitrf", api.historitrf);
router.get("/historitopupdeposit", api.historitopupsaldo);

router.post("/getoperatorbytujuan", ProductControllers.getOperatorByTujuan);
router.post(
  "/getoperatorfiltertujuanx",
  ProductControllers.getOperatorFIlterByTujuan,
);
// router.post("/produktoken", ProductControllers.produktoken);
// router.post("/getpdam", ProductControllers.getPDAM);
router.post("/getprodukbyoperator", ProductControllers.getProductByOperator);
router.post("/getprodukbytujuan", ProductControllers.getProductByTujuan);
router.post(
  "/getprodukdatabytujuan",
  ProductControllers.getProductDataByTujuan,
);
router.post("/getoperator", ProductControllers.getoperator);

// router.post("/produkfisik", VoucherFisikControllers.getProductsFisik);
// router.post("/vouchercode", VoucherFisikControllers.getVouCherCode);

router.post("/pricelist", pricelist.pricelist);
router.post("/pricelistgroup", pricelist.pricelistgroup);

// router.post("/sendotp", api.sendotp);
// router.post("/verifyotp", api.verifyotp);

router.post("/deposit/tiket", api.tiketdeposit);
router.get("/deposit/tiket", api.gettiketdeposit);
// router.get("/deposit/va", api.getva);
// router.post("/avianapay/kaspro", avianaPay.callback_kaspro);
// router.post("/avianapay/alfamart", avianaPay.paymentcodealfa);
// router.post("/avianapay/wallets", avianaPay.ovo_payment);
// router.post("/avianapay/wallets/percent", avianaPay.ovo_paymentPercent);

router.post("/linkqupay/retail", linkqupay.paymentcodeRetail);
router.post("/linkqupay/qris", linkqupay.getQrisPayment);
router.post("/linkqupay/va-onetime", linkqupay.virtualAccoutOnetime);
router.post("/linkqupay/ovo", linkqupay.OvoPushPayment);
router.post("/linkqupay/bank-unik", linkqupay.TransferKodeUnik);

router.post("/gantipin", api.gantipin);
// router.post("/lokasi", api.updatekoordinat);

router.post("/regtoken", api.regtoken);
// router.post("/regtoken2", api.regtoken2);
// router.post("/sendpush", api.sendpush);

router.post("/cekidtokenpln", api.cekidtokenpln);

router.post("/cetak", ctrl.getReceiptByTransaction );
//router.post("/cetak", cetaknew.cetakNew);
router.post("/gantikodereferral", api.gantiKodeReferral);
// router.post("/getnotif", api.Notification);

module.exports = router;
