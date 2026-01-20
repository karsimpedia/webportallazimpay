"use strict";
const controllers = {};
var utilirs = require("./utils_v9");
const moment = require("moment");
const md5 = require("md5");
const axios = require("axios");
const S = require("string");

controllers.callback_va_get = async (req, res) => {
  res.json({ success: true, msg: "mantaps..." });
};

controllers.callback_kaspro = async (req, res) => {
  /*
    if (req.connection.remoteAddress.split(':')[3] != '114.141.55.67') {
        res.json({
            success: false,
            rc: 13,
            msg: 'IP Tidak Valid',
            ip: req.connection.remoteAddress.split(':')[3]
        }); return;
    }
    */
  try {
    var uuid = "app:" + req.body.uuid;
    var hash = req.body.hash;
    var amount = req.body.amount;
    const invoice = req.body.reff;
    if ((hash = !md5(md5(invoice + amount + process.env.SECRET)))) {
      res.json({ success: false, msg: "hashing not valid" });
      return;
    }
    var amoment = moment();
    var tglTrx = amoment.format("YYYY/MM/DD");
    var jamTrx = amoment.format("HH:mm:ss");
    const email = "";
    const timestamp = new Date();

    const desc = "Topup via Kaspro Merchant";
    const payment_code = req.body.bank;

    var cekdata = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid
    );
    if (cekdata.length > 0) {
      var idreseller = cekdata[0].idreseller;
      var namareseller = cekdata[0].namareseller;
      var insertdata = {
        amount: amount,
        idreseller: idreseller,
        email: "",
        invoice: invoice,
        status: 1,
        description: desc,
        kodeakun: process.env.KODE_AKUN_PAYMENT_GTW,
        created_at: tglTrx + " " + jamTrx,
        payment_code: "",
        payment_method: "KasPro-merchant"
      };
      await utilirs.runQuerySelectPromise(
        req,
        "insert into alfamart_payment set ?",
        [insertdata]
      );
      var pesan =
        "Topup via Kaspro Ref:" + invoice + " sebesar " + amount + " Berhasil";

      var datahp = await utilirs.runQuerySelectPromise(
        req,
        "select aes_decrypt(hp,password((select jalurharga from info))) as hp from hptrx where idreseller=?",
        [idreseller]
      );
      if (datahp.length > 0) {
        await Promise.all(
          datahp.map(async row => {
            var datasender = {
              idreseller: idreseller,
              namareseller: namareseller,
              tujuan: row.hp.toString("utf8"),
              statussms: 0,
              isi: pesan,
              jenissender: 1,
              idterminalpakai: -1,
              namaterminal: "",
              tanggal: tglTrx,
              jam: jamTrx
            };

            try {
              let a = await utilirs.runQuerySelectPromise(
                req,
                "insert into sender set ?",
                datasender
              );
            } catch (error) {
              console.log(error);
            }
          })
        );
      }
      res.json({ success: true, messge: "Topup success" });
    } else {
      res.json({ success: true, messge: "member not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, messge: "Topup successXXX" });
  }
  return;
};

controllers.callback_va = async (req, res) => {
  if (req.connection.remoteAddress.split(":")[3] != "114.141.55.67") {
    res.json({
      success: false,
      rc: 13,
      msg: "IP Tidak Valid",
      ip: req.connection.remoteAddress.split(":")[3]
    });
    return;
  }
  try {
    var amoment = moment();
    var tglTrx = amoment.format("YYYY/MM/DD");
    var jamTrx = amoment.format("HH:mm:ss");
    var amount = req.body.nominal;
    const idreseller = req.body.memberid;
    const email = "";
    const timestamp = new Date();
    const invoice = req.body.reff;
    const desc = "Topup via virtual account";
    const payment_code = req.body.bank;
    amount = amount - 5000;
    var cekdata = await utilirs.runQuerySelectPromise(
      req,
      "select namareseller from masterreseller where idreseller=?",
      idreseller
    );
    if (cekdata.length > 0) {
      var namareseller = cekdata[0].namareseller;
      var insertdata = {
        amount: amount,
        idreseller: idreseller,
        email: "",
        invoice: invoice,
        status: 1,
        description: desc,
        kodeakun: process.env.KODE_AKUN_PAYMENT_GTW,
        created_at: tglTrx + " " + jamTrx,
        payment_code: "",
        payment_method: payment_code
      };
      await utilirs.runQuerySelectPromise(
        req,
        "insert into alfamart_payment set ?",
        [insertdata]
      );
      var pesan = "Topup " + payment_code + " sebesar " + amount + " Berhasil";

      var datahp = await utilirs.runQuerySelectPromise(
        req,
        "select aes_decrypt(hp,password((select jalurharga from info))) as hp from hptrx where idreseller=?",
        [idreseller]
      );
      if (datahp.length > 0) {
        await Promise.all(
          datahp.map(async row => {
            var datasender = {
              idreseller: idreseller,
              namareseller: namareseller,
              tujuan: row.hp.toString("utf8"),
              statussms: 0,
              isi: pesan,
              jenissender: 1,
              idterminalpakai: -1,
              namaterminal: "",
              tanggal: tglTrx,
              jam: jamTrx
            };

            try {
              let a = await utilirs.runQuerySelectPromise(
                req,
                "insert into sender set ?",
                datasender
              );
            } catch (error) {
              console.log(error);
            }
          })
        );
      }
      res.json({ success: true, messge: "Topup success" });
    } else {
      res.json({ success: true, messge: "member not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, messge: "Topup successXXX" });
  }
  return;
};

controllers.callback_inv = async (req, res) => {
  if (req.connection.remoteAddress.split(":")[3] != "114.141.55.67") {
    res.json({
      success: false,
      rc: 13,
      msg: "IP Tidak Valid",
      ip: req.connection.remoteAddress.split(":")[3]
    });
    return;
  }

  try {
    var response = req.body;
    var invoice = response.invoice;
    var status = req.body.status;

    if (invoice != undefined) {
      let a = await utilirs.runQuerySelectPromise(
        req,
        "select a.idreseller,r.namareseller,a.amount from alfamart_payment a left join masterreseller r on a.idreseller=r.namareseller where a.invoice=? and status<>1",
        [invoice]
      );
      if (a.length > 0) {
        var idreseller = a[0].idreseller;
        var namareseller = a[0].namareseller;

        await utilirs.runQuerySelectPromise(
          req,
          "UPDATE alfamart_payment SET status=? WHERE invoice=?",
          [status, invoice]
        );

        var pesan =
          "Topup sebesar " + a[0].amount + " Berhasil reff:" + invoice;

        var datahp = await utilirs.runQuerySelectPromise(
          req,
          "select aes_decrypt(hp,password((select jalurharga from info))) as hp from hptrx where idreseller=?",
          [idreseller]
        );
        if (datahp.length > 0) {
          let amoment = moment();
          let tglTrx = amoment.format("YYYY/MM/DD");
          let jamTrx = amoment.format("HH:mm:ss");

          await Promise.all(
            datahp.map(async row => {
              var datasender = {
                idreseller: idreseller,
                namareseller: namareseller,
                tujuan: row.hp.toString("utf8"),
                statussms: 0,
                isi: pesan,
                jenissender: 1,
                idterminalpakai: -1,
                namaterminal: "",
                tanggal: tglTrx,
                jam: jamTrx
              };

              try {
                let a = await utilirs.runQuerySelectPromise(
                  req,
                  "insert into sender set ?",
                  datasender
                );
              } catch (error) {
                console.log(error);
              }
            })
          );
        }
      } else {
        res.json({ success: false, msg: "inv not found" });
        return;
      }
    }
    res.json(response);
    return;
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Error" });
  }
};

controllers.paymentcodealfa = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = parseInt(req.body.jml);
  const BASE_URL = "https://api.aviana.id:9192";
  var amoment = moment();
  var tglTrx = amoment.format("YYYY/MM/DD");
  var jamTrx = amoment.format("HH:mm:ss");

  try {
    var datars = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid
    );
    if (datars.length > 0) {
      var idreseller = datars[0].idreseller;
      var namareseller = datars[0].namareseller;

      const invoice = "INV" + idreseller + utilirs.generateNumber10();
      var url = `${BASE_URL}/partner/paymentcode`;
      var method = "alfamart";
      var jsonData = {
        server_key: req.body.server_key,
        inv: invoice,
        name: namareseller,
        amount: amount,
        desc: "topup deposit"
      };

      try {
        var batas = moment()
          .add(1, "days")
          .format("YYYY-MM-DD hh:mm:ss");

		var request = await axios.post(url, jsonData, { timeout: 30000 });
        //console.log(request.data);
        const payment_code = request.data.available_retail_outlets[0].payment_code;
        amount = amount - 5000;
        var insertdata = {
          amount: amount,
          idreseller: idreseller,
          email: "",
          invoice: invoice,
          status: 0,
          description: jsonData.desc,
          kodeakun: process.env.KODE_AKUN_PAYMENT_GTW,
          created_at: tglTrx + " " + jamTrx,
          payment_code: payment_code,
          payment_method: method
        };
        await utilirs.runQuerySelectPromise(
          req,
          "insert into alfamart_payment set ?",
          [insertdata]
        );

        var pesan =
          "Topup Deposit Alfamart \nKode Pembayaran:" +
          payment_code +
          " \nSebelum " +
          batas;
        var datasender = {
          idreseller: idreseller,
          namareseller: namareseller,
          tujuan: uuid,
          statussms: 0,
          isi: pesan,
          jenissender: 1,
          idterminalpakai: -1,
          namaterminal: "",
          tanggal: tglTrx,
          jam: jamTrx
        };

        try {
          await utilirs.runQuerySelectPromise(
            req,
            "insert into sender set ?",
            datasender
          );
        } catch (error) {
          console.log(error);
        }

        res.json({
          success: true,
          data: request.data.available_retail_outlets[0]
        });
      } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "error terjadi kesalahan" });
      }
    } else {
      res.json({ success: false, msg: "akun tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Error" });
  }
};

controllers.ovo_payment = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = req.body.jml;
  const BASE_URL = "https://api.aviana.id:9192";

  try {
    var datars = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid
    );
    if (datars.length > 0) {
      var idreseller = datars[0].idreseller;
      var namareseller = datars[0].namareseller;

      const invoice = "INV" + idreseller + utilirs.generateNumber10();
      var url = `${BASE_URL}/partner/wallets`;
      var method = req.body.ewallet_type;
      var jsonData = {
        server_key: req.body.server_key,
        inv: invoice,
        name: namareseller,
        phone: req.body.phone,
        amount: amount,
        ewallet_type: "OVO",
        desc: "topup deposit"
      };

      try {
        let amoment = moment();
        let tglTrx = amoment.format("YYYY/MM/DD");
        let jamTrx = amoment.format("HH:mm:ss");

        var request = await axios.post(url, jsonData, { timeout: 90000 });
        console.log("OVO:" + request.data);
        if (typeof request.data.ewallet_transaction_id == "undefined") {
          res.json({ success: false, msg: request.data.data.message });
        } else {
          amount = amount - 5000;

          var insertdata = {
            amount: amount,
            idreseller: idreseller,
            email: "",
            invoice: invoice,
            status: 1,
            description: jsonData.desc,
            kodeakun: process.env.KODE_AKUN_PAYMENT_GTW,
            created_at: tglTrx + " " + jamTrx,
            payment_code: request.data.ewallet_transaction_id,
            payment_method: method
          };
          await utilirs.runQuerySelectPromise(
            req,
            "insert into alfamart_payment set ?",
            [insertdata]
          );

          let msg =
            "Topup via " +
            req.body.ewallet_type +
            " " +
            amount +
            " Berhasil ReffID:" +
            request.data.ewallet_transaction_id;

          var datasender = {
            idreseller: idreseller,
            namareseller: namareseller,
            tujuan: uuid,
            statussms: 0,
            isi: msg,
            jenissender: 1,
            idterminalpakai: -1,
            namaterminal: "",
            tanggal: tglTrx,
            jam: jamTrx
          };

          try {
            let a = await utilirs.runQuerySelectPromise(
              req,
              "insert into sender set ?",
              datasender
            );
          } catch (error) {
            console.log(error);
          }

          res.json({ success: true, msg: msg });
        }
      } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "error terjadi kesalahan" });
      }
    } else {
      res.json({ success: false, msg: "akun tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Error" });
  }
};

controllers.ovo_paymentPercent = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var amount = req.body.jml;
  var amount_asli = req.body.jmlasli;
  const BASE_URL = "https://api.aviana.id:9192";

  try {
    var datars = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid
    );
    if (datars.length > 0) {
      var idreseller = datars[0].idreseller;
      var namareseller = datars[0].namareseller;

      const invoice = "INV" + idreseller + utilirs.generateNumber10();
      var url = `${BASE_URL}/partner/wallets`;
      var method = req.body.ewallet_type;
      var jsonData = {
        server_key: req.body.server_key,
        inv: invoice,
        name: namareseller,
        phone: req.body.phone,
        amount: amount,
        ewallet_type: "OVO",
        desc: "topup deposit"
      };

      try {
        let amoment = moment();
        let tglTrx = amoment.format("YYYY/MM/DD");
        let jamTrx = amoment.format("HH:mm:ss");

        var request = await axios.post(url, jsonData, { timeout: 90000 });
        console.log("OVO:" + request.data);
        if (typeof request.data.ewallet_transaction_id == "undefined") {
          res.json({ success: false, msg: request.data.data.message });
        } else {
          amount = amount - amount_asli * 0.03;

          var insertdata = {
            amount: amount,
            idreseller: idreseller,
            email: "",
            invoice: invoice,
            status: 1,
            description: jsonData.desc,
            kodeakun: process.env.KODE_AKUN_PAYMENT_GTW,
            created_at: tglTrx + " " + jamTrx,
            payment_code: request.data.ewallet_transaction_id,
            payment_method: method
          };
          await utilirs.runQuerySelectPromise(
            req,
            "insert into alfamart_payment set ?",
            [insertdata]
          );

          let msg =
            "Topup via " +
            req.body.ewallet_type +
            " " +
            amount +
            " Berhasil ReffID:" +
            request.data.ewallet_transaction_id;

          var datasender = {
            idreseller: idreseller,
            namareseller: namareseller,
            tujuan: uuid,
            statussms: 0,
            isi: msg,
            jenissender: 1,
            idterminalpakai: -1,
            namaterminal: "",
            tanggal: tglTrx,
            jam: jamTrx
          };

          try {
            let a = await utilirs.runQuerySelectPromise(
              req,
              "insert into sender set ?",
              datasender
            );
          } catch (error) {
            console.log(error);
          }

          res.json({ success: true, msg: msg });
        }
      } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "error terjadi kesalahan" });
      }
    } else {
      res.json({ success: false, msg: "akun tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Error" });
  }
};

module.exports = controllers;
