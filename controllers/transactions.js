"use strict";
const TransactionController = {};
let api = require("../lib/serverUtamaClient.js");
function rupiah(value) {
  const n = Number(value || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

function col(label, value, width = 12) {
  return label.padEnd(width, " ") + ": " + value;
}

function mapStatusToLegacy(data = {}) {
  const status = String(data.status || "").toUpperCase();

  const name = data.customerName ?? data.extra?.customerNo ?? "";
  const tagihan = data.amountDue ?? 0;
  const admin = data.adminFee ?? 0;
  const totalTag = data.sellingPrice ?? 0;
  const harga = data.sellPrice ?? 0;
  const dest = data.msisdn ?? "";
  const typeTrx = data.type;

  let msg = String(data.message || data.msg || "").trim();

  if (
    ["TAGIHAN_INQUIRY", "EWALLET_INQUIRY", "TRANSFER_BANK_INQUIRY"].includes(
      typeTrx,
    ) &&
    status === "WAITING"
  ) {
    msg = [
      col("Id Number", dest),
      col("Customer", name),
      col("Tagihan", rupiah(tagihan)),
      col("Admin", rupiah(admin)),
      col("Total", rupiah(totalTag)),
      col("Harga", rupiah(harga)),
    ].join("\n");
  }

  if (status === "SUCCESS") {
    return {
      success: true,
      rc: data.rc || "1",
      idtransaksi: data.trxId,
      sn: data.serial || data.sn || data.supplierRef || data.ref,
      msg: "Transaksi berhasil",
    };
  }

  if (status === "FAILED") {
    const lowerMsg = msg.toLowerCase();

    const hiddenErrorKeywords = [
      "saldo",
      "balance",
      "insufficient",
      "not enough balance",
      "provider balance",
      "deposit",
      "cut off",
      "gateway error",
      "internal error",
      "timeout",
      "auth failed",
      "signature invalid",
      "forbidden",
      "unauthorized",
      "sql",
      "database",
      "exception",
      "server error",
    ];

    const shouldHideMsg = hiddenErrorKeywords.some((keyword) =>
      lowerMsg.includes(keyword),
    );

    return {
      success: false,
      rc: data.rc || "2",
      msg: shouldHideMsg ? "Transaksi Gagal" : msg || "Transaksi Gagal",
    };
  }

  if (["PENDING", "WAITING", "PROCESSING"].includes(status)) {
    return {
      success: true,
      rc: data.rc || "0068",
      msg: msg || "Transaksi sedang diproses",
    };
  }

  return {
    success: false,
    rc: data.rc || "99",
    msg: msg || "Status tidak dikenal",
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

  console.log(req.body);
  // ✅ PARSING TUJUAN + NOMINAL
  const { msisdn, nominal: parsedNominal } = parseTujuanWithNominal(
    tujuan,
    nominal,
  );

  if (!msisdn) {
    return res.json({
      success: false,
      rc: "0018",
      msg: "Nomor tujuan tidak valid",
    });
  }

  const finalNominal = parsedNominal;
  const appid = "app:" + uuid;

  try {
    const response = await api.post("/api/trx/apk", {
      sender: appid,
      productCode: kodeproduk,
      tujuan: msisdn, // ⬅️ tujuan bersih
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
    console.error("webportal payNow error:", error?.response || error);

    return res.json({
      success: false,
      produk: kodeproduk,
      tujuan: msisdn,
      reffid: idtrx,
      rc: "99",
      msg: error?.response?.data?.error || "Gagal menghubungi server utama",
    });
  }
};

TransactionController.hapusAkun = async (req, res) => {
  try {
    const uuid = "app:" + req.body.uuid;

    const apiRes = await api.delete("/reseller/delete_me", {
      data: {
        sender: uuid,
        pin: req.body.pin,
      },
    });

    return res.json({ success: true, msg: "akun berhasil dihapus" });
  } catch (error) {
    console.error("proxy DeleteAKun:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: error?.response?.data.message || "Gagal hapus akun",
    });
  }
};

module.exports = TransactionController;
