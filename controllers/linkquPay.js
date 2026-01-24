"use strict";
const controllers = {};
var utilirs = require("./utils_v9");
const moment = require("moment");
const md5 = require("md5");
const axios = require("axios");
const S = require("string");
const crypto = require("crypto");
const api = require("../lib/serverUtamaClient");
const { channel } = require("diagnostics_channel");
const serverKey = "tiYrUOD65qaYcWdt5W6EPU8s";
const clientId = "90328ab5-1af3-4faf-8b60-0f72652d41e3";
const BASE_URL = "https://gateway.linkqu.id/linkqu-partner";
controllers.callback_va_get = async (req, res) => {
  res.json({ success: true, msg: "mantaps..." });
};

controllers.callback_va = async (req, res) => {};

controllers.callback_inv = async (req, res) => {};

controllers.paymentcodeRetail = async (req, res) => {
  let uuid = "app:" + req.body.uuid;
  let amount = parseInt(req.body.jml);
  let method = req.body.method;

  try {
    var request = await api.post("/api/trx/fund-receive", {
      sender: uuid,
      productCode: method,
      amount: amount,
      identifier: uuid,
      deviceType: "APP",
      msisdn: "082211108088",
      channel: "RETAIL",
    });
    //console.log(request.data);

    const data = request.data;
    const responData = {
      amount: data.amount,
      expired: data.expiresAt,
      bank_code: data.payment.bankCode ,
      bank_name: data.payment.bankName ,
      customer_phone: data.payment.customerPhone,
      response_desc: "Virtual Account Successfully Created",
      virtual_account: data.payment.vaNumber ,
      payment_code: data.payment.paymentCode ,
      retail_code: data.payment.retailName ,
    };
    return res.json({
      success: true,
      data: responData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error terjadi kesalahan" });
  }
};

controllers.getQrisPayment = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = req.body.jml;
  var method = req.body.method;
  var exp = moment().add(1, "days").format("YYYYMMDDhhmmss");

  try {
    var request = await api.post("/api/trx/fund-receive", {
      sender: uuid,
      productCode: method,
      amount: amount,
    });
    //console.log(request.data);

    const data = request.data;
    // const responData = {
    //   amount: data.amount,
    //   expired: data.expiresAt,
    //   bank_code: data.payment.bankCode || null,
    //   bank_name: data.payment.bankName || null,
    //   customer_phone: data.payment.customerPhone,
    //   response_desc: "Virtual Account Successfully Created",
    //   virtual_account: data.payment.vaNumber || null,
    //   payment_code: data.payment.paymentCode || null,
    //   retail_code: data.payment.store || null,
    // };
    return res.json({
      success: true,
      data: data.payment.raw,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error terjadi kesalahan" });
  }
};

controllers.virtualAccoutOnetime = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = parseInt(req.body.jml);
  var method = req.body.method;
  let bankCode = req.body.code_bank;

  // const BASE_URL = "https://gateway.linkqu.id";
  try {
    var request = await api.post("/api/trx/fund-receive", {
      sender: uuid,
      productCode: bankCode,
      amount: amount,
      deviceType: "APP",
      identifier: uuid,
      msisdn: "082211108088",
      channel: "va",
    });
    console.log(request);

    const data = request.data;
    const responData = {
      amount: data.amount,
      expired: data.expiresAt,
      bank_code: data.payment.bankCode || null,
      bank_name: data.payment.bankName || null,
      customer_phone: data.payment.customerPhone,
      response_desc: data.payment.message,
      virtual_account: data.payment.vaNumber || null,
      payment_code: data.payment.paymentCode || null,
      retail_code: data.payment.store || null,
    };

    return res.json({
      success: true,
      data: responData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error terjadi kesalahan" });
  }
};

controllers.TransferKodeUnik = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = parseInt(req.body.jml);
  let bankCode = req.body.code_bank;


  try {
    const request = await api.post("/api/trx/fund-receive", {
      sender: uuid,
      productCode: bankCode,
      identifier: uuid,
      deviceType: "APP",  
       msisdn: "082211108088",   
      amount: amount,
    });
    //console.log(request.data);

    const data = request.data;
    const responData = {
      amount: data.amount,
      bank_code: data.payment.bankCode || null,
      bank_name: data.payment.bankName || null,
      unique_amount: data.payment.uniqueAmount,
      total_amount: data.payment.totalAmount,
      customer_phone: data.payment.customerPhone,
      accountname: data.payment.accountName,
      accountnumber: data.payment.accountNumber,

      response_desc: data.message,
    };

    return res.json({
      success: true,
      data: responData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Error" });
  }
};

controllers.OvoPushPayment = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = req.body.jml;
  var method = req.body.method;
  let ewallet_phone = req.body.ewallet_phone;

  try {
    var request = await api.post("/api/trx/fund-receive", {
      sender: uuid,
      productCode: method,
      amount: amount,
      msisdn: ewallet_phone,
    });
    //console.log(request.data);

    const data = request.data;
    const responData = {
      amount: data.amount,
      expired: data.expiresAt,
      bank_code: data.payment.bankCode || null,
      bank_name: data.payment.bankName || null,
      customer_phone: data.payment.customerPhone,
      response_desc: "Virtual Account Successfully Created",
      virtual_account: data.payment.vaNumber || null,
      payment_code: data.payment.paymentCode || null,
      retail_code: data.payment.store || null,
    };

    return res.json({
      success: true,
      data: responData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error terjadi kesalahan" });
  }
};

module.exports = controllers;
