"use strict";
const controllerX = {};
var utilirs = require("./utils_v9");
const moment = require("moment");
const md5 = require("md5");
const S = require("string");
const axios = require("axios");
const pad = require("utils-pad-string");

const api = require("../lib/serverUtamaClient");

controllerX.gantiKodeReferral = async (req, res) => {
  try {
    const uuid = "app:" + req.body.uuid;
    const kodeBaru = req.body.kodereferralbaru;

    if (!kodeBaru) {
      return res.json({
        success: false,
        msg: "Kode referral tidak boleh kosong",
      });
    }

    await api.put(`/reseller/referral`, {
      sender: uuid,
      code: kodeBaru,
    });

    // ✅ IRS-style response
    return res.json({
      success: true,
      msg: "Kode Referral Berhasil diubah",
    });
  } catch (err) {
    console.log(err);
    console.error("webportal ganti kode referral error:", err.message);

    // mapping error umum
    if (err.response?.status === 409) {
      return res.json({
        success: false,
        msg: "Kode Referral Telah digunakan, ganti yang lain",
      });
    }

    return res.json({
      success: false,
      msg: "Terjadi kesalahan server",
    });
  }
};

controllerX.getinfo = async (req, res) => {
  try {
    let xx = await utilirs.runQuerySelectPromise(
      req,
      "select version from serverfcm",
    );
    res.json({
      success: true,
      version: xx[0].version,
      info: {
        active: true,
        tax: 0,
        currency: "IDR",
        shipping: ["JNE", "TIKI", "GO-SEND"],
      },
    });
  } catch (error) {
    res.json({ success: false, msg: "error" });
  }
};

controllerX.regtoken = async (req, res) => {
  var appid = "app:" + req.body.uuid;
  var token = req.body.regid;

  try {
    let datainsert = {
      regtoken: token,
      appid: appid,
    };
    var x = await utilirs.runQuerySelectPromise(
      req,
      "insert into regfcm set ? ON DUPLICATE KEY UPDATE regtoken=?",
      [datainsert, token],
    );

    res.json({
      success: true,
      msg: "token registration successfully",
      tokenFcm: token,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error register" });
  }
};

controllerX.cekidtokenpln = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var idpln = req.body.idpln;

  const username = "zopiyuWy9JXW";
  const apiKey = "a763a4cb-5234-5aa9-afc2-81355e34653c";

  const sign = md5(username + apiKey + idpln);

  try {
    let jsonData = {
      username: username,
      customer_no: idpln,
      sign: sign,
    };
    const resp = await axios.post(
      "https://api.digiflazz.com/v1/inquiry-pln",
      jsonData,
    );

 
    return res.json({
      success: true,
      data: resp.data.data,
      // msg: "akun tidak ditemukan",
    });
  } catch (error) {
    console.log(error.data);
    res.json({ success: false, msg: "error" });
    //res.json({ success: false, msg: "bisa langsung hit aja" });
  }
};

controllerX.regtoken2 = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var token = req.body.regid;

  try {
    console.log(token);
    // let datainsert = {
    //   regtoken: token,
    //   appid: uuid,
    //   serverid: 1,
    //   app_version: req.body.app_version,
    //   device: req.body.device,
    //   os_version: req.body.os_version,
    //   serial: req.body.serial,
    // };
    // var x = await utilirs.runQuerySelectPromise(
    //   req,
    //   "insert into regfcm set ? ON DUPLICATE KEY UPDATE regtoken=?",
    //   [datainsert, token],
    // );

    res.json({
      success: true,
      msg: "token registration successfully",
      tokenFcm: token,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error register" });
  }
};

controllerX.sendpush = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var msg = req.body.msg;
  var title = req.body.title;
  try {
    var datars = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid,
    );
    if (datars.length > 0) {
      try {
        let resp = await utilirs.sendpush(req, uuid, msg, title);
        res.json(resp);
      } catch (error) {
        res.send("error");
      }
    } else {
      res.json({ success: false, msg: "akun tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.send("OKE");
  }
};

controllerX.updatekoordinat = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var koordinat = req.body.koordinat;
  try {
    var datars = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid,
    );
    if (datars.length > 0) {
      var idreseller = datars[0].idreseller;
      let ax = await utilirs.runQuerySelectPromise(
        req,
        "update masterreseller set koordinat=? where idreseller=?",
        [koordinat, idreseller],
      );
      res.send("OKE");
    } else {
      res.json({ success: false, msg: "akun tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.send("OKE");
  }
};

controllerX.cekPIN = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var fpin = req.body.pin;
  // fpin = utilirs.deryptaes256(fpin);

  try {
    var datars = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual,r.tipe,r.blokir,r.alamatreseller from masterreseller r left join hptrx h on r.idreseller=h.idreseller where h.hp=aes_encrypt(?,password((select jalurharga from info))) and r.pin=aes_encrypt(?,password((select jalurharga from info)))",
      [uuid, fpin],
    );
    if (datars.length > 0) {
      var idreseller = datars[0].idreseller;
      res.json({ success: true, msg: "valid" });
    } else {
      res.json({ success: false, msg: "PIN yang anda masukkan salah" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

controllerX.gantipin = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var fpin = req.body.pinlama;
  var pinbaru = req.body.pinbaru;
  var pinconf = req.body.pinconf;
  try {
    if (pinbaru != pinconf)
      return res.json({
        success: false,
        msg: "Pin baru dan Pin Confirmasi Tidak sama",
      });

    let resp = await api.post("reseller/change-pin", {
      sender: uuid,
      oldPin: fpin,
      newPin: pinbaru,
    });

    if (resp.data.success)
      return res.json({ success: true, msg: resp.data.msg });
    else return res.json({ success: false, msg: resp.data.msg });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

controllerX.gettiketdeposit = async (req, res) => {
  var uuid = "app:" + req.query.uuid;
  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var idreseller = cekdata[0].idreseller;

    let datadep = await utilirs.runQuerySelectPromise(
      req,
      "select idtiketdeposit,concat(tanggalreq,' ',jamreq) as waktu,bank,status,nominal from tiketdeposit where idreseller=? order by idtiketdeposit desc limit 10",
      idreseller,
    );
    res.json({ success: true, data: datadep });
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

controllerX.tiketdeposit = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var nominal = parseInt(req.body.jumlah);
  nominal = Math.round(nominal / 1000) * 1000;
  if (nominal < 50000) {
    res.json({ success: false, msg: "Nominal minimal 50.000" });
    return;
  }

  try {
    var request = await api.post("/api/trx/fund-receive", {
      sender: uuid,
      productCode: "TIKET_BANK",
      amount: nominal,
    });
    //console.log(request.data);

    const data = request.data;

    return res.json({
      success: true,
      msg: data.payment.note,
      jumlah: data.amountDue,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "error terjadi kesalahan" });
  }
};

controllerX.verifyotp = async (req, res) => {
  var hp = req.body.hp;
  var otp = req.body.otp;
  return res.json({ success: false, msg: "terjadi kesalahan" });
  try {
    let xdata = await utilirs.runQuerySelectPromise(
      req,
      "select * from otp where nomorhp=?",
      [hp],
    );
    if (xdata.length > 0) {
      var otpx = xdata[0].otp;
      if (otpx == otp) {
        res.json({ success: true, msg: "success" });
      } else {
        res.json({ success: false, msg: "otp salah" });
      }
    } else {
      res.json({ success: false, msg: "otp salah" });
    }
  } catch (error) {
    res.json({ success: false, msg: "terjadi kesalahan" });
  }
};

controllerX.sendotp = async (req, res) => {
  var hp = req.body.hp;
  return res.json({ success: false, msg: "terjadi kesalahan" });
  try {
    let x = await utilirs.runQuerySelectPromise(
      req,
      "delete from otp where nomorhp=?",
      [hp],
    );
    var otp1 = Math.floor(Math.random() * 9);
    var otp2 = Math.floor(Math.random() * 9);
    var otp3 = Math.floor(Math.random() * 9);
    var otp4 = Math.floor(Math.random() * 9);
    var otp5 = Math.floor(Math.random() * 9);
    var otp6 = Math.floor(Math.random() * 9);
    var string_otp =
      otp1.toString() +
      otp2.toString() +
      otp3.toString() +
      otp4.toString() +
      otp5.toString() +
      otp6.toString();
    let otpdata = {
      nomorhp: hp,
      idreseller: "",
      otp: md5(md5(string_otp)),
    };

    let tx =
      "app kode : " +
      string_otp +
      " kode ini bersifat RAHASIA, jangan berikan kepada siapapun";

    // save to outbox

    res.json({ success: true, msg: "success" });
  } catch (error) {
    res.json({ success: false, msg: "terjadi kesalahan:" + error });
  }
};

controllerX.rekapTrx = async (req, res) => {
  const uuid = "app:" + req.query.uuid;
  const tgl_awal = req.query.tanggalawal;
  const tgl_akhir = req.query.tanggalakhir;

  try {
    const apiRes = await api.get("/reseller/rekap-trx", {
      params: {
        sender: uuid,
        tanggalawal: tgl_awal,
        tanggalakhir: tgl_akhir,
      },
    });

    return res.json({
      success: true,
      data: apiRes.data?.data ?? [],
    });
  } catch (error) {
    console.error("rekapTrx proxy error:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: "Terjadi kesalahan err",
    });
  }
};

controllerX.historitrf = async (req, res) => {
  const uuid = "app:" + req.query.uuid;
  const { tanggalawal, tanggalakhir, count, cari, page } = req.query;

  try {
    // 🚀 PANGGIL SERVER UTAMA
    const response = await api.get("reseller/histori-transfer", {
      params: {
        sender: uuid,
        tanggalawal,
        tanggalakhir,
        count,
        cari,
        page,
      },
      headers: {
        // auth server utama (JWT / API KEY)
        "x-sender": uuid,
      },
    });

    const data = response?.data;

    // 🔁 TERUSKAN APA ADANYA (FORMAT SUDAH SESUAI)
    return res.json({
      success: data.success === true,
      count: data.count || 0,
      count_total: data.count_total || 0,
      pages: data.pages || page,
      data: data.data || [],
    });
  } catch (error) {
    console.error(
      "historitrf webportal error:",
      error?.response?.data || error,
    );
    return res.json({
      success: false,
      msg: "Terjadi kesalahan err",
    });
  }
};

controllerX.historitrx = async (req, res) => {
  try {
    const uuid = "app:" + req.query.uuid;

    const apiRes = await api.get("/reseller/histori-trx", {
      params: {
        sender: uuid,
        tanggalawal: req.query.tanggalawal,
        tanggalakhir: req.query.tanggalakhir,
        page: req.query.page || 1,
        cari: req.query.cari || "",
      },
      headers: {
        "x-sender": uuid,
      },
    });

    const data = apiRes.data;

    // pastikan data berupa array
    if (Array.isArray(data.data)) {
      data.data = data.data.map((item) => ({
        ...item,
        status: item.statustext, // 👈 tambahan
      }));
    }
console.log( data)
    return res.json(data);
  } catch (error) {
    console.error("proxy historiTrx:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: "Terjadi kesalahan err",
    });
  }
};

controllerX.historitopupsaldo = async (req, res) => {
  try {
    const uuid = "app:" + req.query.uuid;

    const apiRes = await api.get("/reseller/histori-topup-saldo", {
      params: {
        sender: uuid,
        tanggalawal: req.query.tanggalawal,
        tanggalakhir: req.query.tanggalakhir,
        page: req.query.page || 1,
        count: req.query.count,
        cari: req.query.cari || "",
      },
      headers: {
        "x-sender": uuid, // mekanisme auth internal kamu
      },
    });

    return res.json(apiRes.data);
  } catch (error) {
    console.error("proxy historiTopupSaldo:", error?.response?.data || error);
    return res.json({ success: false, msg: "terjadi kesalahan" });
  }
};

controllerX.historisaldo = async (req, res) => {
  try {
    const uuid = "app:" + req.query.uuid;

    const apiRes = await api.get("/reseller/histori-saldo", {
      params: {
        sender: uuid,
        tanggalawal: req.query.tanggalawal,
        tanggalakhir: req.query.tanggalakhir,
        page: req.query.page || 1,
        cari: req.query.cari || "",
      },
      headers: {
        "x-sender": uuid, // sesuai mekanisme auth internal kamu
      },
    });

    return res.json(apiRes.data);
  } catch (error) {
    console.error("proxy historiSaldo:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: "Terjadi kesalahan err",
    });
  }
};

controllerX.getmenuppob = async (req, res) => {
  return res.json({ success: false, msg: "terjadi kesalahan" });
  try {
    let menux = await utilirs.runQuerySelectPromise(
      req,
      "select * from app_menu",
    );
    res.json({ success: true, data: menux });
  } catch (error) {}
};

controllerX.getmenuppob_old = async (req, res) => {
  return res.json({ success: false, msg: "terjadi kesalahan" });
  /*
    {
        id: 1,
        label: "Grosir",
        images: "iconhppascax.png",
        type: 11,
        idoperator: 1,
        kodeproduk: "Grosir",
        home: true,
        url: "www.youtube.com"
    },
    */
  var menu = [
    {
      id: 1,
      label: "Pulsa",
      images: "iconhppascax.png",
      type: 9,
      idoperator: 1,
      kodeproduk: "PULSA",
      home: true,
      url: "www.youtube.com",
    },
    {
      id: 1,
      label: "WARTO",
      images: "iconwartox.png",
      type: 1,
      idoperator: 1,
      kodeproduk: "ASA",
      home: true,
      url: "www.youtube.com",
    },
    {
      id: 1,
      label: "LISTRIK PLN",
      images: "iconplnx.png",
      type: 1,
      idoperator: 1,
      kodeproduk: "PLN",
      home: true,
      url: "www.youtube.com",
    },
    {
      id: 1,
      label: "BPJS",
      images: "iconbpjsx.png",
      type: 1,
      idoperator: 1,
      home: true,
      kodeproduk: "BPJSKS",
      url: "www.youtube.com",
    },
    {
      id: 1,
      label: "TELKOM",
      images: "icontelkomx.png",
      type: 1,
      idoperator: 1,
      kodeproduk: "TELKOM",
      home: true,
      url: "https://m.tiket.com",
    },
    {
      id: 1,
      label: "PDAM",
      images: "iconpdamx.png",
      type: 3,
      idoperator: 1,
      kodeproduk: "PDAM",
      home: true,
      url: "https://m.tiket.com",
    },
    {
      id: 1,
      label: "HP PASCA",
      images: "iconhppascax.png",
      type: 3,
      idoperator: 73,
      kodeproduk: "TELKOM",
      home: true,
      url: "https://m.bukalapak.com",
    },
    {
      id: 1,
      label: "TV Satelit",
      images: "iconvouchertv.png",
      type: 3,
      idoperator: 72,
      kodeproduk: "TELKOM",
      home: true,
      url: "https://m.bukalapak.com",
    },
    {
      id: 1,
      label: "Multifinance",
      images: "iconhppascax.png",
      type: 3,
      idoperator: 71,
      kodeproduk: "-",
      home: true,
      url: "https://m.bukalapak.com",
    },
    {
      id: 1,
      label: "Gas Negara",
      images: "iconpgnx.png",
      type: 1,
      idoperator: 1,
      kodeproduk: "PGN",
      home: true,
      url: "https://m.bukalapak.com",
    },
    {
      id: 1,
      label: "VoucherTV",
      images: "iconvouchertv.png",
      type: 2,
      idoperator: "101,103",
      kodeproduk: "TELKOM",
      home: true,
      url: "https://m.bukalapak.com",
    },
    {
      id: 1,
      label: "EMoney",
      images: "iconemoneyx.png",
      type: 4,
      idoperator: "99,98,97,95,96",
      kodeproduk: "TELKOM",
      home: true,
      url: "https://m.bukalapak.com",
    },
    {
      id: 1,
      label: "Price List",
      images: "iconemoneyx.png",
      type: 10,
      idoperator: 1,
      kodeproduk: "PRICELIST",
      home: true,
      url: "https://m.tiket.com",
    },
  ];

  res.json({ success: true, data: menu });
};

controllerX.getva = async (req, res) => {
  var uuid = "app:" + req.query.uuid;
  return res.json({ success: false, msg: "terjadi kesalahan" });
  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var idreseller = cekdata[0].idreseller;
    var name = cekdata[0].namareseller;
    var regExpr = /[^a-zA-Z ]/g;
    name = name.replace(regExpr, "");

    try {
      var headers = {
        "User-Agent": "irs-9",
        "Content-Type": "application/json",
      };
      var datapost = {
        server_key: process.env.SERVER_KEY, //'SMdXxGnhie81MKlai8QRNlg81gp9snoMBLA9vNu99dgR9yhh3t9ZlACxCIe5S9',
        customer_id: idreseller,
        customer_name: name,
      };

      let resp = await axios.post(
        "https://api.aviana.id:9192/partner/getva",
        datapost,
        { headers: headers, timeout: 10000 },
      );
      res.json(resp.data);
    } catch (error) {
      console.log(error);
      res.json({ success: false, msg: error.code });
    }
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

controllerX.cekdevice = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.namapemilik,r.province_id,r.city_id,r.district_id,r.kodepos from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    res.json({
      success: true,
      isnew: false,
      idrs: cekdata[0].idreseller,
      nama: cekdata[0].namareseller,
      novtri: cekdata[0].ipstatic,
      saldo: cekdata[0].saldo,
      datars: cekdata[0],
    });
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

controllerX.CekEsisting = async (req, res) => {
  return res.json({ success: false, msg: "terjadi kesalahan" });
  try {
    var cekUser = await utilirs.runQuerySelectPromise(
      req,
      "SELECT r.idreseller FROM masterreseller r LEFT JOIN hptrx h ON r.idreseller=h.idreseller WHERE aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      [req.query.hp],
    );
    if (cekUser.length > 0) {
      res.json({ success: true, msg: "valid" });
    } else {
      res.json({ success: false, msg: "nomor tidak terdaftar" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "terjadi kesalahan" });
  }
};

controllerX.accountKit = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var phone = req.body.phone;
  var pin = req.body.pin;
  var idreseller;

  return res.json({ success: false, msg: "terjadi kesalahan" });
  // console.log(req.body);
  try {
    pin = utilirs.deryptaes256(pin.trim());
    var cekUser = await utilirs.runQuerySelectPromise(
      req,
      "SELECT r.idreseller,r.namareseller,r.saldo, r.blokir, r.komisi FROM masterreseller r LEFT JOIN hptrx h ON r.idreseller=h.idreseller WHERE aes_decrypt(h.hp,password((select jalurharga from info)))=? and r.pin=aes_encrypt(?,password((select jalurharga from info)))",
      [phone, pin],
    );
    if (cekUser.length > 0) {
      if (cekUser[0].blokir == 1) {
        res.json({
          success: false,
          msg: "Nomor HP telah diblokir",
          rc: 13,
        });
        return;
      } else {
        idreseller = cekUser[0].idreseller;
        var getProfile = await utilirs.runQuerySelectPromise(
          req,
          "SELECT r.idreseller,r.namareseller,r.saldo, r.blokir,r.* FROM masterreseller r LEFT JOIN hptrx h ON r.idreseller=h.idreseller WHERE h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4",
          [uuid],
        );
        // console.log(getProfile);
        if (getProfile.length > 0) {
          res.json({
            success: true,
            rc: 0,
            msg: "valid",
            idrs: getProfile[0].idreseller,
            namars: getProfile[0].namareseller,
            datars: getProfile[0],
            saldo: Intl.NumberFormat().format(getProfile[0].saldo),
          });
          return;
        } else {
          var getDevice = await utilirs.runQuerySelectPromise(
            req,
            "SELECT r.idreseller,r.namareseller,r.saldo, r.blokir FROM masterreseller r LEFT JOIN hptrx h ON r.idreseller=h.idreseller WHERE h.tipe=4 and r.idreseller = ?",
            [idreseller],
          );
          // console.log(getDevice);
          if (getDevice.length > 50) {
            res.json({
              success: false,
              msg: "Anda tidak dapat menambahkan device Anda (MAX 5 Device)",
              rc: 14,
            });
            return;
          } else {
            var insertHp = await utilirs.runQuerySelectPromise(
              req,
              "insert into hptrx value (0,?,aes_encrypt(?,password((select jalurharga from info))),4,0,1,now(),now())",
              [idreseller, uuid],
            );
            // console.log(insertHp);
            if (insertHp) {
              var cekAgain = await utilirs.runQuerySelectPromise(
                req,
                "SELECT r.idreseller,r.namareseller,r.saldo, r.blokir,r.* FROM masterreseller r LEFT JOIN hptrx h ON r.idreseller=h.idreseller WHERE h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4",
                [uuid],
              );
              if (cekAgain.length > 0) {
                res.json({
                  success: true,
                  rc: "00",
                  msg: "valid",
                  idrs: cekAgain[0].idreseller,
                  namars: cekAgain[0].namareseller,
                  datars: cekAgain[0],
                  saldo: Intl.NumberFormat().format(cekAgain[0].saldo),
                });
                return;
              }
            } else {
              // console.log("error bosku");
              res.json({
                success: false,
                msg: "terjadi kesalahan RC:99",
                rc: 14,
              });
              return;
            }
          }
        }
      }
    } else {
      res.json({
        success: false,
        msg: "data tidak ditemukan",
        rc: 12,
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "terjadi kesalahan",
      rc: 99,
    });
    return;
  }
};

controllerX.getme = async (req, res) => {
  var uuid = "app:" + req.query.uuid;

  let ada;
  let ok = true;
  try {
    ada = await api.get(`/reseller/me?sender=${uuid}`, {});
  } catch (error) {
    ok = false;
    console.log(error);
    return res.json({ success: false, msg: "akun tidak ditemukan" });
  }

  if (ok) {
    res.json({
      success: true,
      data: {
        idreseller: ada.data.reseller.id,

        nama: ada.data.reseller.name,
        saldo: ada.data.saldo.amount,
        poin: ada.data.points.balance,
        komisi: ada.data.commission.balance,
        jmldownline: ada.data.downline.total,
      },
    });
  } else {
    return res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

controllerX.UbahKodeReferral = async (req, res) => {
  try {
    var uuid = "app:" + req.body.uuid;
    let kodereferralbaru = req.body.kodereferralbaru;
    let kodereferrallama = req.body.kodereferrallama;
    //var cekdata = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.ym2 from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?", uuid);
    var cekdata = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.email,r.poin,r.komisi, r.alias from hptrx h left join masterreseller r on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid,
    );
    if (cekdata.length > 0) {
      var cekalias2 = await utilirs.runQuerySelectPromise(
        req,
        "SELECT namareseller,saldo,email,poin,komisi FROM masterreseller WHERE alias=? ",
        [kodereferralbaru],
      );
      if (cekalias2.length < 1) {
        await utilirs.runQuerySelectPromise(
          req,
          "update masterreseller set alias=? where idreseller=?",
          [kodereferralbaru, cekdata[0].idreseller],
        );
        res.json({
          success: true,
          msg: "Sukses update",
        });
      } else {
        res.json({
          success: false,
          msg: "Kode Referral Sudah Digunakan Orang Lain, silakan gunakan yang lain",
        });
      }
    } else {
      res.json({ success: false, msg: "data TIDAK ada" });
    }
  } catch (error) {
    console.log(error);
  }
};

controllerX.resetuser = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var username;
  var password;
  //  try {

  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var email = cekdata[0].email;
    var idreseller = cekdata[0].idreseller;
    var namareseller = cekdata[0].namareseller;
    let a = new Date().toISOString();
    username = md5(idreseller + a)
      .toString()
      .toUpperCase()
      .slice(-10);
    password = md5("avianah2h" + idreseller + a)
      .toString()
      .toUpperCase()
      .slice(-10);
    let b = await utilirs.runQuerySelectPromise(
      req,
      "update masterreseller set usernameweb=?,passwordweb=md5(md5(ucase(?))) where idreseller=?",
      [username, password, idreseller],
    );

    var pesanEmail =
      "Kpd Yth " +
      cekdata[0].namareseller +
      ", anda telah melakukan reset username dan password, Berikut adalah data credential untuk melakukan transaksi belistok.id,\n\r\n\r";

    pesanEmail += "\nNAMA     : " + namareseller;
    pesanEmail += "\nIDMITRA  : " + idreseller;
    pesanEmail += "\nUSERNAME : " + username;
    pesanEmail += "\nPASSWORD : " + password;
    pesanEmail += "\n\r\n\r\n\r";
    pesanEmail += "Terimakasih";

    var send = require("gmail-send")({
      user: "avianaaligator@gmail.com",
      pass: "mandala1122",
      to: email,
      subject: "[AUTO] RESET Credential belistok.id :" + namareseller,
      text: pesanEmail, // Plain text
      //html: pesanEmail            // HTML
    });

    send(
      {
        // Overriding default parameters
      },
      function (err, res) {
        // console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
      },
    );

    res.json({
      success: true,
      msg: "Username: " + username + " password: " + password,
    });
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }

  // } catch (error) {
  //   res.json({ success: false, msg: error });
  // }
};
controllerX.loginregister = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var email = req.body.email;
  var namapemilik = req.body.nama;
  var alamat = req.body.alamat;
  var namatoko = req.body.namatoko;
  var pin = req.body.pin;

  // check register of not
  try {
    var cekdata = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid,
    );

    if (cekdata.length > 0) {
      res.json({
        success: true,
        isnew: false,
        idrs: cekdata[0].idreseller,
        nama: cekdata[0].namareseller,
        novtri: cekdata[0].ipstatic,
        saldo: cekdata[0].saldo,
      });
    } else {
      var kota = "kota";
      var nomorhp = req.body.nomorhp;
      var novtri = req.body.novtri;
      var dataid = await utilirs.runQuerySelectPromise(
        req,
        "select generateidresellerbyupline('PA') as id",
        [namapemilik],
      );
      var idreseller = dataid[0].id;

      let a = new Date().toISOString();
      var userAPI = md5(idreseller + a)
        .toString()
        .toUpperCase()
        .slice(-10);
      var passAPI = md5("belistok.id" + idreseller + a)
        .toString()
        .toUpperCase()
        .slice(-10);

      var jenischip = "SD";
      var postdatavtri =
        "novtri=" +
        novtri +
        "&jenisvtri=" +
        jenischip +
        "&namaserver=" +
        namatoko +
        "&namapribadi=" +
        namapemilik +
        "&nohp=" +
        nomorhp +
        "&alamat=" +
        alamat +
        "&kota=" +
        kota +
        "&email=panji.pramana@gmail.com&password=" +
        passAPI;

      try {
        try {
          var resp = await axios.post(
            "http://daftarapi.mknvtri.id/directreg.aspx",
            postdatavtri,
          );
          var datalog = {
            novtri: novtri,
            log: JSON.stringify(resp.data),
          };
          let resulta = await utilirs.runQuerySelectPromise(
            req,
            "insert into logvtriapi set ?",
            datalog,
          );
        } catch (error) {}

        var dataregister = {
          idreseller: idreseller,
          alias: idreseller,
          namareseller: namatoko.toUpperCase(),
          namapemilik: namapemilik,
          alamatreseller: alamat,
          idupline: "-",
          email: email,
          telp: nomorhp,
          tambahanhargapribadi: 0,
          komisilangsung: 0,
          ipstatic: novtri,
          patokanhargajual: 1,
          aktif: 1,
          pendapatandownLine: 0,
          flagtambahdownLine: 0,
          ym2: passAPI,
        };

        try {
          let result = await utilirs.runQuerySelectPromise(
            req,
            "insert into masterreseller set ?",
            dataregister,
          );
          let result2 = await utilirs.runQuerySelectPromise(
            req,
            "update masterreseller set pin=aes_encrypt(?,password((select jalurharga from info))) where idreseller=?",
            [pin, idreseller],
          );
          let b = await utilirs.runQuerySelectPromise(
            req,
            "update masterreseller set usernameweb=?,passwordweb=md5(md5(ucase(?))) where idreseller=?",
            [userAPI, passAPI, idreseller],
          );
          var insertUID = await utilirs.runQuerySelectPromise(
            req,
            "insert into  hptrx (idreseller,hp,jenis,tipe,lasttrx,timeadd,aktif) value (?,aes_encrypt(?,password((select jalurharga from info))),?,?,now(),now(),1)",
            [idreseller, uuid, 0, 4],
          );

          var datava = await utilirs.runQuerySelectPromise(
            req,
            "select nova from virtualaccount where mitra='ASA' and gateway='JPA' order by id desc limit 1",
          );
          if (datava.length > 0) {
            var tempva = datava[0].nova;
            tempva = S(tempva).right(4).s;
            var inova = parseInt(tempva) + 1;
            let okx = pad(inova.toString(), 4, { lpad: "0" });
            let novas = "1320001" + okx;
            var dataregva = {
              mitra: "ASA",
              idreseller: idreseller,
              nova: novas,
              bank: "MANDIRI",
              gateway: "JPA",
              status: 1,
            };
            let cx = await utilirs.runQuerySelectPromise(
              req,
              "insert into virtualaccount set ?",
              [dataregva],
            );
          } else {
            try {
              var dataregva = {
                mitra: "ASA",
                idreseller: idreseller,
                nova: "13200010001",
                bank: "MANDIRI",
                gateway: "JPA",
                status: 1,
              };
              let c = await utilirs.runQuerySelectPromise(
                req,
                "insert into virtualaccount set ?",
                [dataregva],
              );
            } catch (error) {
              console.log(error);
            }
          }
        } catch (e) {
          console.log(e);
        }
        //console.log(data.email);
        var pesanEmail =
          "Kpd Yth " +
          namapemilik +
          ", Berikut adalah data credential untuk melakukan transaksi belistok.id,\n\r\n\r";

        pesanEmail += "\nNAMA     : " + namatoko;
        pesanEmail += "\nIDMITRA  : " + idreseller;
        pesanEmail += "\nPIN      : " + pin;
        pesanEmail += "\nUSERNAME : " + userAPI;
        pesanEmail += "\nPASSWORD : " + passAPI;
        pesanEmail += "\n\r\n\r\n\r";
        pesanEmail += "Terimakasih";

        var send = require("gmail-send")({
          user: "belistok.id@gmail.com",
          pass: "Mandala*1122",
          to: email,
          subject: "[AUTO] Credeantial belistok.id :" + namatoko,
          text: pesanEmail, // Plain text
          //html: pesanEmail            // HTML
        });

        send(
          {
            // Overriding default parameters
          },
          function (err, res) {
            // console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
          },
        );

        res.json({
          success: true,
          isnew: true,
          password: passAPI,
          msg: "Registration successfully ID:" + idreseller,
        });
      } catch (error) {
        console.log(error);
        res.json({ success: false, msg: error.response });
      }
    }
  } catch (error) {
    res.json({ success: false, msg: error });
  }
};
controllerX.getbanner = async (req, res) => {
  try {
    let dataslide = await utilirs.runQuerySelectPromise(
      req,
      "select * from app_banner",
    );
    res.json({ success: true, data: dataslide });
  } catch (error) {
    res.json({ success: true, data: [] });
  }

  /*
    res.json({
        success: true,
        total: 3,
        data: [
            {
                id: 2,
                image: "banner02.jpg",
                title: "Promo paket data"
            }, {
                id: 3,
                image: "banner03.png",
                title: "Pembayaran Mudah"
            }, {
                id: 4,
                image: "banner04.png",
                title: "Promo paket data"
            }
        ]
    });
    */
};

controllerX.getcategory = async (req, res) => {
  try {
    let category = await utilirs.runQuerySelectPromise(
      req,
      "select idoperator as id,namaoperator as name,alias as brief,imgurl as icon,'#E91E63' as color from operator where idoperator in (121,122,123,124)",
    );
    res.json({
      success: true,
      categories: category,
    });
    return;
  } catch (error) {
    res.json({
      success: false,
      categories: [],
    });
    return;
  }

  res.json({
    success: true,
    categories: [
      {
        id: 1,
        name: "Sembako",
        icon: "",
        brief: "Bahan pokok, beras gula minyak",
        color: "#50A50A",
      },
      {
        id: 2,
        name: "Ibu dan Bayi",
        icon: "",
        brief: "Pelengkapan bayi, susu diapers",
        color: "#8955D1",
      },
      {
        id: 3,
        name: "Makanan",
        icon: "",
        brief: "berbagai jenis makanan",
        color: "#07B2DD",
      },
      {
        id: 4,
        name: "Minuman",
        icon: "",
        brief: "minuman kaleng botol",
        color: "#3492ff",
      },
    ],
  });
};

controllerX.getprodukdetails = async (req, res) => {
  var id = req.query.id;

  res.json({
    success: true,
    product: {
      id: 1,
      name: "Beras putri 1Kg",
      image: "berasputri.jpg",
      price: 15000,
      price_discount: 14000,
      stock: 100,
      description: "beras putri enak",
      status: "1",
      created_at: moment().valueOf(),
      last_update: moment().valueOf(),
    },
  });
};

controllerX.getprodukecommerce = async (req, res) => {
  var page = req.query.page;
  var category_id = req.query.category_id;
  var col = req.query.col;
  var ord = req.query.ord;
  var count = req.query.count;

  res.json({
    success: true,
    count: 5,
    count_total: 5,
    pages: 1,
    products: [
      {
        id: 1,
        name: "Beras putri 1Kg",
        image: "berasputri.jpg",
        price: 15000,
        price_discount: 14000,
        stock: 100,
        description: "beras putri enak",
        status: "1",
        created_at: moment().valueOf(),
        last_update: moment().valueOf(),
      },
      {
        id: 2,
        name: "Beras Pulen 25Kg",
        image: "beraspulen.jpg",
        price: 125000,
        price_discount: 124000,
        stock: 100,
        description: "beras putri enak",
        status: "1",
        created_at: moment().valueOf(),
        last_update: moment().valueOf(),
      },
      {
        id: 3,
        name: "Telur Ayam 1Kg",
        image: "telurayam.png",
        price: 10000,
        price_discount: 9000,
        stock: 100,
        description: "beras putri enak",
        status: "1",
        created_at: moment().valueOf(),
        last_update: moment().valueOf(),
      },
      {
        id: 4,
        name: "Gulaku 200gr",
        image: "gulapasir.jpg",
        price: 12000,
        price_discount: 11000,
        stock: 100,
        description: "beras putri enak",
        status: "1",
        created_at: moment().valueOf(),
        last_update: moment().valueOf(),
      },
      {
        id: 5,
        name: "Minyak Goreng Bimolo 1lt",
        image: "bimoli.jpg",
        price: 7000,
        price_discount: 5000,
        stock: 50,
        description: "Minyak Goreng enak",
        status: "1",
        created_at: moment().valueOf(),
        last_update: moment().valueOf(),
      },
    ],
  });
};
controllerX.getnews = async (req, res) => {
  var page = req.body.page;
  var count = req.body.count;
  var cari = req.body.q;

  try {
    let anews = await utilirs.runQuerySelectPromise(
      req,
      "select id,title,breaf,content,image,status,UNIX_TIMESTAMP(created_at),UNIX_TIMESTAMP(update_at) as last_update from app_news",
    );
    res.json({
      status: true,
      count: anews.length,
      count_total: anews.length,
      pages: 1,
      news_infos: anews,
    });
  } catch (error) {
    res.json({ success: false, count: 0, count_total: 0, news_infos: [] });
  }

  /*
        {"status":true,"count":1,"count_total":1,"pages":1,"news_infos":[{"id":1,"title":"promo tsel 10","breaf":"promo menarik","content":"<ul><li>promo menarik</li><li>minimal 10 trx dalam 1 hari</li><li>tidak berlaku kelipatan</li></ul>",
        "image":"banner03.png","status":1,"created_at":"2019-03-20T17:01:02.000Z","last_update":"2019-03-21T12:52:02.000Z"}]}
 
       res.json({
           status: true,
           count: 2,
           count_total: 2,
           pages: 1,
           news_infos: [{
               id: 1,
               title: "promo irs maret",
               breaf: "lorem ipsum",
               content: "lorem ipsim",
               image: "banner03.png",
               status: 1,
               created_at: moment().valueOf(),
               last_update: moment().valueOf()
           }]
       });
       */
};

controllerX.getnewsdetail = async (req, res) => {
  var id = req.query.id;

  try {
    let anews = await utilirs.runQuerySelectPromise(
      req,
      "select id,title,breaf,content,image,status,UNIX_TIMESTAMP(created_at),UNIX_TIMESTAMP(update_at) as last_update from app_news where id=?",
      [id],
    );
    if (anews.length > 0) {
      res.json({
        status: true,
        count: anews.length,
        count_total: anews.length,
        pages: 1,
        news_info: anews[0],
      });
    } else {
      res.json({
        status: false,
        count: 0,
        count_total: 0,
        pages: 0,
        news_info: [],
      });
    }
  } catch (error) {
    res.json({ success: false, count: 0, count_total: 0, news_infos: [] });
  }
};

controllerX.Notification = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  // var uuid = req.body.id;

  try {
    var cekdata = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid,
    );

    if (cekdata.length > 0) {
      var notification = [];
      var dataSender = await utilirs.runQuerySelectPromise(
        req,
        "select idsender, tujuan, isi, jenissender from sender where tujuan=? and statussms = 1 order by idsender desc limit 10 ",
        [uuid],
      );
      if (dataSender.length > 0) {
        for (var i = 0; i < dataSender.length; i++) {
          let a = {
            isi: dataSender[i].isi,
            id: dataSender[i].idsender,
          };
          notification.push(a);
        }
      }
      res.json({ success: true, data: notification });
    } else {
      res.json({ success: false, msg: "UUID tidak terdaftar" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Terjadi Kesalahan" });
  }
};

module.exports = controllerX;
