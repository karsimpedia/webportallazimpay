var express = require("express");
var router = express.Router();
let trx = require("../controllers/h2h");
router.get("/trx", (req, res) => {
  res.json({ status: true, ket: "suksess" });
});

router.post("/trx", trx.payNow);
module.exports = router;
