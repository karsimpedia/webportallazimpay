"use strict";

const controllerscetak = {};
const utilirs = require("./utils_v9");
const S = require("string");
const pad = require("utils-pad-string");

/* ===============================
   UTIL DASAR (AMAN)
================================ */

function pick(src = "", key = "", def = "") {
  try {
    if (!src.includes(key)) return def;
    return src.split(key)[1].split(",")[0];
  } catch {
    return def;
  }
}

function num(v, def = 0) {
  try {
    return parseInt(String(v).replace(/[^\d]/g, "")) || def;
  } catch {
    return def;
  }
}

function rp(n = 0) {
  return pad(utilirs.todesimal(num(n)).toString(), 12, { lpad: "." });
}

function footer(note = "Struk ini merupakan bukti pembayaran yang sah") {
  return `\n\n${note}\nTERIMA KASIH\r\n`;
}

/* ===============================
   BANK CODE (OY)
================================ */

const codebank = [
  { name: "BANK BRI", code: "002" },
  { name: "BANK MANDIRI", code: "008" },
  { name: "BANK BNI", code: "009" },
  { name: "BANK BCA", code: "014" },
  { name: "BANK SYARIAH INDONESIA", code: "451" },
  { name: "BANK OCBC NISP", code: "028" },
  { name: "BANK CIMB NIAGA", code: "022" },
];

function getBankNameByCode(code) {
  const b = codebank.find((x) => x.code === code);
  return b ? b.name : "BANK LAINNYA";
}

/* ===============================
   HANDLER STRUK
================================ */

/* === MULTIFINANCE (FIF / WOM / ADIRA / FNHCI) === */
function strukMultifinance(y, jasaloket) {
  const ket = y.keterangan || "";
  const waktu = y.waktu;
  let nama = y.namareseller || "";
  if (nama.length > 5) nama = nama.slice(0, -5);

  const idpel = y.tujuan;
  const produk = y.namaproduk;

  const namaPelanggan =
    pick(ket, "NAMAPELANGGAN:", "") || pick(ket, "NAMA:", "-");

  const periode = pick(ket, "PERIODE:", "") || pick(ket, "ANGSURANKE:", "-");

  const tenor = pick(ket, "TENOR:", "");

  const noRef = pick(ket, "REF2:", "") || pick(ket, "REF:", "-");

  const tagihan = num(pick(ket, "NOMINAL:", "0"));

  const admin = num(pick(ket, "ADMIN:", "0") || pick(ket, "ADM:", "0"));

  const denda = num(pick(ket, "DENDA:", "0"));

  const total = tagihan + admin + denda + jasaloket;

  return (
    "STRUK PEMBAYARAN MULTIFINANCE\n\n" +
    "Nama Outlet :" +
    nama +
    "\nTGL BAYAR   :" +
    waktu +
    "\nNO REF      :" +
    noRef +
    "\n----------------------------" +
    "\nFINANCE     :" +
    produk +
    "\nNO KONTRAK  :" +
    idpel +
    "\nNAMA        :" +
    namaPelanggan +
    "\nANGSURAN KE :" +
    periode +
    (tenor ? "\nTENOR       :" + tenor : "") +
    "\n\nRP TAG      :Rp " +
    rp(tagihan) +
    "\nRP ADMIN    :Rp " +
    rp(admin) +
    (denda > 0 ? "\nRP DENDA    :Rp " + rp(denda) : "") +
    "\nJASA LOKET  :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nTOTAL BAYAR :Rp " +
    rp(total) +
    footer("Struk ini merupakan bukti pembayaran yang sah")
  );
}
/* === MULTIFINANCE (FIF / WOM / ADIRA / FNHCI) === */
function strukMultifinance(y, jasaloket) {
  const ket = y.keterangan || "";
  const waktu = y.waktu;
  let nama = y.namareseller || "";
  if (nama.length > 5) nama = nama.slice(0, -5);

  const idpel = y.tujuan;
  const produk = y.namaproduk;

  const namaPelanggan =
    pick(ket, "NAMAPELANGGAN:", "") || pick(ket, "NAMA:", "-");

  const periode = pick(ket, "PERIODE:", "") || pick(ket, "ANGSURANKE:", "-");

  const tenor = pick(ket, "TENOR:", "");

  const noRef = pick(ket, "REF2:", "") || pick(ket, "REF:", "-");

  const tagihan = num(pick(ket, "NOMINAL:", "0"));

  const admin = num(pick(ket, "ADMIN:", "0") || pick(ket, "ADM:", "0"));

  const denda = num(pick(ket, "DENDA:", "0"));

  const total = tagihan + admin + denda + jasaloket;

  return (
    "STRUK PEMBAYARAN MULTIFINANCE\n\n" +
    "Nama Outlet :" +
    nama +
    "\nTGL BAYAR   :" +
    waktu +
    "\nNO REF      :" +
    noRef +
    "\n----------------------------" +
    "\nFINANCE     :" +
    produk +
    "\nNO KONTRAK  :" +
    idpel +
    "\nNAMA        :" +
    namaPelanggan +
    "\nANGSURAN KE :" +
    periode +
    (tenor ? "\nTENOR       :" + tenor : "") +
    "\n\nRP TAG      :Rp " +
    rp(tagihan) +
    "\nRP ADMIN    :Rp " +
    rp(admin) +
    (denda > 0 ? "\nRP DENDA    :Rp " + rp(denda) : "") +
    "\nJASA LOKET  :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nTOTAL BAYAR :Rp " +
    rp(total) +
    footer("Struk ini merupakan bukti pembayaran yang sah")
  );
}

/* === TELCO PASCABAYAR (TELKOM / HALO / XPLOR) === */
function strukTelco(y, jasaloket) {
  const ket = y.keterangan || "";
  const waktu = y.waktu;
  const nama = y.namareseller;
  const idpel = y.tujuan;
  const produk = y.namaproduk;

  const namaPelanggan =
    pick(ket, "NAMAPELANGGAN:", "") || pick(ket, "NAMA:", "-");

  const periode = pick(ket, "PERIODE:", "") || pick(ket, "BLTH:", "-");

  const ref =
    pick(ket, "REF2:", "") || pick(ket, "REF:", "") || pick(ket, "MID:", "-");

  const tagihan = num(pick(ket, "TAGIHAN:", "0") || pick(ket, "NOMINAL:", "0"));

  const admin = num(pick(ket, "ADM:", "0") || pick(ket, "ADMIN:", "0"));

  const total = tagihan + admin + jasaloket;

  return (
    "STRUK PEMBAYARAN TELCO PASCA\n\n" +
    "OUTLET      :" +
    nama +
    "\nTGL BAYAR   :" +
    waktu +
    "\nIDPEL       :" +
    idpel +
    "\nPRODUK      :" +
    produk +
    "\nNAMA        :" +
    namaPelanggan +
    "\nPERIODE     :" +
    periode +
    "\nNO REF      :" +
    ref +
    "\n\nRP TAG      :Rp " +
    rp(tagihan) +
    "\nRP ADMIN    :Rp " +
    rp(admin) +
    "\nJASA LOKET  :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nTOTAL BAYAR :Rp " +
    rp(total) +
    footer("Struk ini merupakan bukti pembayaran yang sah")
  );
}

/* === BPJS KESEHATAN === */
function strukBpjs(y, jasaloket) {
  const ket = y.keterangan || "";
  const waktu = y.waktu;
  const nama = y.namareseller;
  const idpel = y.tujuan;

  // parsing aman
  const namaPeserta = pick(ket, "NAMA:", "-");
  const noVa = pick(ket, "IDPEL:", "") || pick(ket, "NOVA:", "-");

  const peserta = pick(ket, "JMLKEL:", "1");

  const periode = pick(ket, "BLTH:", "-");

  const ref = pick(ket, "MID:", "-");

  const tagihan = num(pick(ket, "TAGIHAN:", "0"));

  const admin = num(pick(ket, "ADM:", "0") || pick(ket, "ADMIN:", "0"));

  const total = tagihan + admin + jasaloket;

  return (
    "STRUK PEMBAYARAN BPJS KESEHATAN\n\n" +
    "Nama Outlet :" +
    nama +
    "\nTGL BAYAR   :" +
    waktu +
    "\nIDPEL       :" +
    idpel +
    "\nNAMA        :" +
    namaPeserta +
    "\nNO VA       :" +
    noVa +
    "\nPESERTA     :" +
    peserta +
    "\nPERIODE     :" +
    periode +
    " BULAN" +
    "\nNO REF      :" +
    ref +
    "\n\nRP TAG      :Rp " +
    rp(tagihan) +
    "\nRP ADMIN    :Rp " +
    rp(admin) +
    "\nJASA LOKET  :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nTOTAL BAYAR :Rp " +
    rp(total) +
    footer("BPJS menyatakan struk ini sebagai bukti pembayaran yang sah")
  );
}

/* === PLN PASCABAYAR (PLN & PPLN) === */
function strukPlnPascabayar(y, jasaloket) {
  const ket = y.keterangan || "";
  const waktu = y.waktu;
  const nama = y.namareseller;
  const idpel = y.tujuan;

  // === parsing aman ===
  const namaPelanggan =
    pick(ket, "NAMAPELANGGAN:", "") || pick(ket, "NAMA:", "-");

  const tarif =
    pick(ket, "SUBSCRIBERSEGMENTATION:", "") || pick(ket, "TARIFDAYA:", "-");

  const daya = pick(ket, "POWERCONSUMINGCATEGORY:", "");

  const standAwal = pick(ket, "SLALWBP1:", "") || pick(ket, "STMETER:", "");

  const standAkhir = pick(ket, "SAHLWBP1:", "");

  const periode = pick(ket, "PERIODE:", "") || pick(ket, "BLTH:", "-");

  const ref = pick(ket, "REF2:", "") || pick(ket, "REF:", "-");

  const tagihan =
    num(pick(ket, "NOMINAL:", "0")) || num(pick(ket, "NOMINALPOKOK:", "0"));

  const admin = num(pick(ket, "ADMIN:", "0")) || num(pick(ket, "ADM:", "0"));

  const denda = num(pick(ket, "DENDA:", "0"));

  const total = tagihan + admin + denda + jasaloket;

  return (
    "STRUK PEMBAYARAN TAGIHAN LISTRIK\n\n" +
    "Nama Outlet :" +
    nama +
    "\nTGL BAYAR   :" +
    waktu +
    "\nIDPEL       :" +
    idpel +
    "\nNAMA        :" +
    namaPelanggan +
    "\nTARIF/DAYA  :" +
    tarif +
    (daya ? "/" + daya : "") +
    (standAwal && standAkhir
      ? "\nSTAND METER :" + standAwal + "-" + standAkhir
      : "") +
    "\nBLN/TH      :" +
    periode +
    "\nNO REF      :" +
    ref +
    "\n\nRP TAG PLN  :Rp " +
    rp(tagihan) +
    "\nADMIN       :Rp " +
    rp(admin) +
    (denda > 0 ? "\nDENDA       :Rp " + rp(denda) : "") +
    "\nJASA LOKET  :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nTOTAL BAYAR :Rp " +
    rp(total) +
    footer("PLN menyatakan struk ini sebagai bukti pembayaran yang sah")
  );
}

/* === TRANSFER BANK === */
function strukTransferBank(y, jasaloket) {
  const ket = y.keterangan;
  const waktu = y.waktu;
  let nama = y.namareseller || "";
  if (nama.length > 5) nama = nama.slice(0, -5);

  // === OY INDONESIA ===
  if (y.idterminal === "571") {
    const amount = num(pick(ket, ",AMOUNT:"));
    const kodebank = pick(ket, "RECIPIENTBANK:");
    const total = amount + jasaloket;

    return (
      "BUKTI TRANSFER ANTAR BANK\n\n" +
      "TANGGAL     :" +
      waktu +
      "\nREFF        :" +
      pick(ket, ",TRXID:") +
      "\n----------------------------" +
      "\nBANK TUJUAN :" +
      getBankNameByCode(kodebank) +
      "\nKode Bank   :" +
      kodebank +
      "\nNo.REKENING :" +
      pick(ket, ",RECIPIENTACCOUNT:") +
      "\nATAS NAMA   :" +
      pick(ket, ",RECIPIENTNAME:") +
      "\n\nJUMLAH      :Rp " +
      rp(amount) +
      "\nBIAYA       :Rp " +
      rp(jasaloket) +
      "\n----------------------------" +
      "\nTOTAL BAYAR :Rp " +
      rp(total) +
      "\n\nPENGIRIM    :LAZIM MULTIMEDIA" +
      "\nSTATUS      :" +
      pick(ket, ",MESSAGE:", "BERHASIL") +
      "\n----------------------------" +
      "\nDidukung Oleh OY Indonesia" +
      footer()
    );
  }

  // === DEFAULT (LINKQU / DLL) ===
  const amount = num(pick(ket, "AMOUNT:"));
  const total = amount + jasaloket;

  return (
    "BUKTI TRANSFER ANTAR BANK\n\n" +
    "NAMA OUTLET :" +
    nama +
    "\nTANGGAL     :" +
    waktu +
    "\nREFF        :" +
    pick(ket, "SERIALNUMBER:") +
    "\n----------------------------" +
    "\nBANK TUJUAN :" +
    pick(ket, "BANKNAME:") +
    "\nNo.REKENING :" +
    pick(ket, "ACCOUNTNUMBER:") +
    "\nATAS NAMA   :" +
    pick(ket, "ACCOUNTNAME:") +
    "\n\nJUMLAH      :Rp " +
    rp(amount) +
    "\nBIAYA       :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nTOTAL BAYAR :Rp " +
    rp(total) +
    footer()
  );
}

/* === PLN PRABAYAR === */
function strukPlnPrabayar(y, jasaloket) {
  const sn = y.sn || "";
  let nominal = num(y.nominal);
  if (nominal < 20000) nominal *= 1000;

  const total = nominal + jasaloket;

  return (
    "STRUK PEMBELIAN PLN PRABAYAR\n\n" +
    "Nama Outlet :" +
    y.namareseller +
    "\nWaktu       :" +
    y.waktu +
    "\nNo.METER    :" +
    y.tujuan +
    "\nNAMA        :" +
    (sn.split("/")[1] || "-") +
    "\nTD          :" +
    (sn.split("/")[2] || "-") +
    "/" +
    (sn.split("/")[3] || "-") +
    "\nKWH         :" +
    (sn.split("/")[4] || "-") +
    "\n\nNOMINAL     :Rp " +
    rp(nominal) +
    "\nJASA LOKET  :Rp " +
    rp(jasaloket) +
    "\n----------------------------" +
    "\nBAYAR       :Rp " +
    rp(total) +
    "\n\nTOKEN :" +
    "\n" +
    (sn.split("/")[0] || "-") +
    footer("Hubungi PLN 123 untuk info lebih lanjut")
  );
}

/* === PULSA / DATA === */
function strukPulsa(y, jasaloket) {
  let nominal = num(y.nominal);
  if (nominal < 20000) nominal *= 1000;

  return (
    "STRUK PEMBELIAN\n\n" +
    "Waktu     :" +
    y.waktu +
    "\nNo.Trx    :" +
    y.idtransaksi +
    "\nTujuan    :" +
    y.tujuan +
    "\nProduk    :" +
    y.namaproduk +
    "\n\nSN        :" +
    y.sn +
    "\nHarga     :Rp " +
    utilirs.todesimal(jasaloket) +
    footer()
  );
}

/* ===============================
   ROUTER UTAMA
================================ */

controllerscetak.cetakNew = async (req, res) => {
  try {
    const idtrx = req.body.idtrx;
    const jasaloket = num(req.body.jasaloket);

    const rows = await utilirs.runQuerySelectPromise(
      req,
      `SELECT 
        CONCAT(t.tanggal,' ',t.jam) AS waktu,
        t.namareseller,t.idtransaksi,t.kodeproduk,t.idterminal,
        t.keterangan,t.sn,t.tujuan,t.nominal,
        p.namaproduk,p.idoperator
      FROM transaksi t
      LEFT JOIN produk p ON t.idproduk=p.idproduk
      WHERE t.idtransaksi=? AND t.statustransaksi=1
      LIMIT 1`,
      [idtrx]
    );

    if (!rows.length)
      return res.json({ success: false, msg: "Data tidak ditemukan" });

    const y = rows[0];
    let msg = "";

    if (y.idoperator === "110") {
      msg = strukTransferBank(y, jasaloket);
    } else if (
      y.kodeproduk === "FIF" ||
      y.kodeproduk === "WOM" ||
      y.kodeproduk === "ADIRA" ||
      y.kodeproduk === "FNHCI"
    ) {
      msg = strukMultifinance(y, jasaloket);
    } else if (
      y.kodeproduk === "TELKOM" ||
      y.kodeproduk === "HALO" ||
      y.kodeproduk === "XPLOR"
    ) {
      msg = strukTelco(y, jasaloket);
    } else if (y.kodeproduk === "BPJSKS") {
      msg = strukBpjs(y, jasaloket);
    } else if (y.kodeproduk === "PLN" || y.kodeproduk === "PPLN") {
      msg = strukPlnPascabayar(y, jasaloket);
    } else if (y.idoperator === "37") {
      msg = strukPlnPrabayar(y, jasaloket);
    } else {
      msg = strukPulsa(y, jasaloket);
    }

    return res.json({
      success: true,
      source: 1,
      kodeproduk: y.kodeproduk,
      idtrx: y.idtransaksi,
      idterminal: y.idterminal,
      sn: y.sn,
      msg,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Terjadi kesalahan sistem" });
  }
};

module.exports = controllerscetak;
