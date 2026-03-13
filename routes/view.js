var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {

  res.json({ok: true, msg: "api is running"})
  // res.render("index");
});


module.exports = router;
