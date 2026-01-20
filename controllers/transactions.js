"use strict";
const TransactionController = {};
let api = require("../lib/serverUtamaClient.js");

function mapStatusToLegacy(data = {}) {
  const status = String(data.status || "").toUpperCase();

  if (status === "SUCCESS") {
    return {
      success: true,
      rc: "1",
      sn: data.serial || data.sn || data.supplierRef || data.ref,
      msg: data.msg || data.message || "Transaksi berhasil",
    };
  }

  if (status === "FAILED") {
    return {
      success: false,
      rc: "2",
      msg: data.msg || data.message || "Transaksi gagal",
    };
  }

  if (["PENDING", "WAITING", "PROCESSING"].includes(status)) {
    return {
      success: true,
      rc: "0068",
      msg: data.msg || data.message || "Transaksi sedang diproses",
    };
  }

  return {
    success: false,
    rc: "99",
    msg: data.msg || data.message || "Status tidak dikenal",
  };
}

function parseTujuanWithNominal(rawTujuan, bodyNominal) {
  if (!rawTujuan) {
    return { msisdn: null, nominal: bodyNominal || null };
  }

  const str = String(rawTujuan).trim();

  if (str.includes(".")) {
    const [rawMsisdn, rawNominal] = str.split(".", 2);
    return {
      msisdn: rawMsisdn.replace(/[^\d]/g, ""),
      nominal: rawNominal ? Number(rawNominal.replace(/[^\d]/g, "")) : null,
    };
  }

  return {
    msisdn: str.replace(/[^\d]/g, ""),
    nominal: bodyNominal || null,
  };
}

TransactionController.payNow = async (req, res) => {
  const {
    kodeproduk,
    tujuan,
    idtrx,
    pin,
    jenis,
    forcetrx,
    uuid,
    wait,
    nominal,
  } = req.body;

  // ✅ PARSING TUJUAN + NOMINAL
  const { msisdn, nominal: parsedNominal } =
    parseTujuanWithNominal(tujuan, nominal);

  if (!msisdn) {
    return res.json({
      success: false,
      rc: "0018",
      msg: "Nomor tujuan tidak valid",
    });
  }

  const finalNominal = parsedNominal;
  const furl = "app:" + uuid;

  try {
    const response = await api.post("/api/trx/apk", {
      sender: furl,
      productCode: kodeproduk,
      tujuan: msisdn,      // ⬅️ tujuan bersih
      idtrx,
      pin,
      forcetrx,
      typeTrx: jenis,
      wait,
      nominal: finalNominal, // ⬅️ NOMINAL FIX
    });

    const data = response?.data || {};
    const legacy = mapStatusToLegacy(data);

    return res.json({
      ...legacy,
      produk: kodeproduk,
      tujuan: msisdn,
      reffid: idtrx,
      confirm: data.confirm || undefined,
    });
  } catch (error) {
    console.error("webportal payNow error:", error?.response?.data || error);

    return res.json({
      success: false,
      produk: kodeproduk,
      tujuan: msisdn,
      reffid: idtrx,
      rc: "99",
      msg: "Gagal menghubungi server utama",
    });
  }
};

module.exports = TransactionController;
