"use strict";
const omniChannel = {};
var utilirs = require("./utils_v9");
const moment = require("moment");
const md5 = require("md5");
const S = require("string");
const axios = require("axios");

omniChannel.getProduct = async (req, res) => {
  try {
    let notujuan = req.body.tujuan;

    if (notujuan.startsWith("0")) {
      notujuan = "62" + notujuan.substr(1);
      notujuan = parseInt(notujuan);
    }

    const data = {
      msisdn: notujuan,
      subcategory: "",
      "no-captcha": true,
      initialize: false,
      captcha_type: "no-captcha",
      mlid: null,
      target: "",
    };
    let resp = await axios.post(
      "https://www.telkomsel.com/api/v2/package",
      data,
    );

    res.json({ data: resp.data });
  } catch (error) {
    res.json(error.response.data);
    console.log(error);
  }
};

omniChannel.Purchase = async (req, res) => {
  try {
    let notujuan = req.body.tujuan;
    let packageId = req.body.package_id;
    let deviceid = req.body.deviceid;

    if (notujuan.startsWith("0")) {
      notujuan = "62" + notujuan.substr(1);
      //notujuan = parseInt(notujuan);
    }

    const data = {
      msisdn: notujuan,
      embed: true,
      telcoPackage: [
        {
          packageId: packageId,
        },
      ],
    };
    let resp = await axios.post(
      "https://www.telkomsel.com/api/v2/order",
      data,
      {
        headers: {
          "device-id": deviceid,
        },
      },
    );

    res.json({ data: resp.data });
  } catch (error) {
    res.json({mgs: "error"});
    console.log(error);
  }
};

module.exports = omniChannel;
