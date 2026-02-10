"use strict";
const controllerX = {};
var utilirs = require("./utils_v9");
const moment = require("moment");
const md5 = require("md5");
const S = require("string");
const pad = require("utils-pad-string");
const ProductControllers = require("./product");
const api = require("../lib/serverUtamaClient");

controllerX.pricelist = async (req, res) => {
  const uuid = "app:" + req.body.uuid;
  const cari = req.body.cari || "";

  try {
    const request = await api.get("/reseller/pricelist", {
      params: {
        sender: uuid,
        cari: cari,
      },
    });

    return res.json({
      success: true,
      data: request.data,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.json({
      success: false,
      msg: "terjadi kesalahan server",
    });
  }
};

controllerX.pricelistgroup = async (req, res) => {
  const uuid = "app:" + req.body.uuid;

  try {
    const request = await api.get("/reseller/pricelistgroup", {
      params: {
        sender: uuid,
      },
    });

    return res.json({
      success: true,
      data: request.data,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.json({
      success: false,
      msg: "terjadi kesalahan server",
    });
  }
};

module.exports = controllerX;
