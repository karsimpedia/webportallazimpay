"use strict";
const controllerscetak = {};
var utilirs = require("./utils_v9");
const moment = require("moment");
const md5 = require("md5");
const axios = require("axios");
const S = require("string");
const pad = require("utils-pad-string");

const codebank = [
  {
    name: "BANK BRI",
    code: "002",
  },
  {
    name: "BANK EKSPOR INDONESIA",
    code: "003",
  },
  {
    name: "BANK MANDIRI",
    code: "008",
  },
  {
    name: "BANK BNI",
    code: "009",
  },
  {
    name: "BANK BNI SYARIAH",
    code: "427",
  },
  {
    name: "BANK DANAMON",
    code: "011",
  },
  {
    name: "PERMATA BANK",
    code: "013",
  },
  {
    name: "BANK BCA",
    code: "014",
  },
  {
    name: "BANK BII",
    code: "016",
  },
  {
    name: "BANK PANIN",
    code: "019",
  },
  {
    name: "BANK ARTA NIAGA KENCANA",
    code: "020",
  },
  {
    name: "BANK NIAGA",
    code: "022",
  },
  {
    name: "BANK BUANA IND",
    code: "023",
  },
  {
    name: "BANK LIPPO",
    code: "026",
  },
  {
    name: "BANK NISP",
    code: "028",
  },
  {
    name: "AMERICAN EXPRESS BANK LTD",
    code: "030",
  },
  {
    name: "CITIBANK N.A.",
    code: "031",
  },
  {
    name: "JP. MORGAN CHASE BANK, N.A.",
    code: "032",
  },
  {
    name: "BANK OF AMERICA, N.A",
    code: "033",
  },
  {
    name: "ING INDONESIA BANK",
    code: "034",
  },
  {
    name: "BANK MULTICOR TBK.",
    code: "036",
  },
  {
    name: "BANK ARTHA GRAHA",
    code: "037",
  },
  {
    name: "BANK CREDIT AGRICOLE INDOSUEZ",
    code: "039",
  },
  {
    name: "THE BANGKOK BANK COMP. LTD",
    code: "040",
  },
  {
    name: "THE HONGKONG & SHANGHAI B.C.",
    code: "041",
  },
  {
    name: "THE BANK OF TOKYO MITSUBISHI UFJ LTD",
    code: "042",
  },
  {
    name: "BANK SUMITOMO MITSUI INDONESIA",
    code: "045",
  },
  {
    name: "BANK DBS INDONESIA",
    code: "046",
  },
  {
    name: "BANK RESONA PERDANIA",
    code: "047",
  },
  {
    name: "BANK MIZUHO INDONESIA",
    code: "048",
  },
  {
    name: "STANDARD CHARTERED BANK",
    code: "050",
  },
  {
    name: "BANK ABN AMRO",
    code: "052",
  },
  {
    name: "BANK KEPPEL TATLEE BUANA",
    code: "053",
  },
  {
    name: "BANK CAPITAL INDONESIA, TBK.",
    code: "054",
  },
  {
    name: "BANK BNP PARIBAS INDONESIA",
    code: "057",
  },
  {
    name: "BANK UOB INDONESIA",
    code: "058",
  },
  {
    name: "KOREA EXCHANGE BANK DANAMON",
    code: "059",
  },
  {
    name: "RABOBANK INTERNASIONAL INDONESIA",
    code: "060",
  },
  {
    name: "ANZ PANIN BANK",
    code: "061",
  },
  {
    name: "DEUTSCHE BANK AG.",
    code: "067",
  },
  {
    name: "BANK WOORI INDONESIA",
    code: "068",
  },
  {
    name: "BANK OF CHINA LIMITED",
    code: "069",
  },
  {
    name: "BANK BUMI ARTA",
    code: "076",
  },
  {
    name: "BANK EKONOMI",
    code: "087",
  },
  {
    name: "BANK ANTARDAERAH",
    code: "088",
  },
  {
    name: "BANK HAGA",
    code: "089",
  },
  {
    name: "BANK IFI",
    code: "093",
  },
  {
    name: "BANK CENTURY, TBK.",
    code: "095",
  },
  {
    name: "BANK MAYAPADA",
    code: "097",
  },
  {
    name: "BANK JABAR",
    code: "110",
  },
  {
    name: "BANK DKI",
    code: "111",
  },
  {
    name: "BPD DIY",
    code: "112",
  },
  {
    name: "BANK JATENG",
    code: "113",
  },
  {
    name: "BANK JATIM",
    code: "114",
  },
  {
    name: "BPD JAMBI",
    code: "115",
  },
  {
    name: "BPD ACEH",
    code: "116",
  },
  {
    name: "BANK SUMUT",
    code: "117",
  },
  {
    name: "BANK NAGARI",
    code: "118",
  },
  {
    name: "BANK RIAU",
    code: "119",
  },
  {
    name: "BANK SUMSEL",
    code: "120",
  },
  {
    name: "BANK LAMPUNG",
    code: "121",
  },
  {
    name: "BPD KALSEL",
    code: "122",
  },
  {
    name: "BPD KALIMANTAN BARAT",
    code: "123",
  },
  {
    name: "BPD KALTIM",
    code: "124",
  },
  {
    name: "BPD KALTENG",
    code: "125",
  },
  {
    name: "BPD SULSEL",
    code: "126",
  },
  {
    name: "BANK SULUT",
    code: "127",
  },
  {
    name: "BPD NTB",
    code: "128",
  },
  {
    name: "BPD BALI",
    code: "129",
  },
  {
    name: "BANK NTT",
    code: "130",
  },
  {
    name: "BANK MALUKU",
    code: "131",
  },
  {
    name: "BPD PAPUA",
    code: "132",
  },
  {
    name: "BANK BENGKULU",
    code: "133",
  },
  {
    name: "BPD SULAWESI TENGAH",
    code: "134",
  },
  {
    name: "BANK SULTRA",
    code: "135",
  },
  {
    name: "BANK NUSANTARA PARAHYANGAN",
    code: "145",
  },
  {
    name: "BANK SWADESI",
    code: "146",
  },
  {
    name: "BANK MUAMALAT",
    code: "147",
  },
  {
    name: "BANK MESTIKA",
    code: "151",
  },
  {
    name: "BANK METRO EXPRESS",
    code: "152",
  },
  {
    name: "BANK SHINTA INDONESIA",
    code: "153",
  },
  {
    name: "BANK MASPION",
    code: "157",
  },
  {
    name: "BANK HAGAKITA",
    code: "159",
  },
  {
    name: "BANK GANESHA",
    code: "161",
  },
  {
    name: "BANK WINDU KENTJANA",
    code: "162",
  },
  {
    name: "HALIM INDONESIA BANK",
    code: "164",
  },
  {
    name: "BANK HARMONI INTERNATIONAL",
    code: "166",
  },
  {
    name: "BANK KESAWAN",
    code: "167",
  },
  {
    name: "BANK TABUNGAN NEGARA (PERSERO)",
    code: "200",
  },
  {
    name: "BANK HIMPUNAN SAUDARA 1906, TBK .",
    code: "212",
  },
  {
    name: "BANK TABUNGAN PENSIUNAN NASIONAL",
    code: "213",
  },
  {
    name: "BANK SWAGUNA",
    code: "405",
  },
  {
    name: "BANK JASA ARTA",
    code: "422",
  },
  {
    name: "BANK MEGA",
    code: "426",
  },
  {
    name: "BANK JASA JAKARTA",
    code: "427",
  },
  {
    name: "BANK BUKOPIN",
    code: "441",
  },
  {
    name: "BANK SYARIAH MANDIRI",
    code: "451",
  },
  {
    name: "BANK BISNIS INTERNASIONAL",
    code: "459",
  },
  {
    name: "BANK SRI PARTHA",
    code: "466",
  },
  {
    name: "BANK JASA JAKARTA",
    code: "472",
  },
  {
    name: "BANK BINTANG MANUNGGAL",
    code: "484",
  },
  {
    name: "BANK BUMIPUTERA",
    code: "485",
  },
  {
    name: "BANK YUDHA BHAKTI",
    code: "490",
  },
  {
    name: "BANK MITRANIAGA",
    code: "491",
  },
  {
    name: "BANK AGRO NIAGA",
    code: "494",
  },
  {
    name: "BANK INDOMONEX",
    code: "498",
  },
  {
    name: "BANK ROYAL INDONESIA",
    code: "501",
  },
  {
    name: "BANK ALFINDO",
    code: "503",
  },
  {
    name: "BANK SYARIAH MEGA",
    code: "506",
  },
  {
    name: "BANK INA PERDANA",
    code: "513",
  },
  {
    name: "BANK HARFA",
    code: "517",
  },
  {
    name: "PRIMA MASTER BANK",
    code: "520",
  },
  {
    name: "BANK PERSYARIKATAN INDONESIA",
    code: "521",
  },
  {
    name: "BANK AKITA",
    code: "525",
  },
  {
    name: "LIMAN INTERNATIONAL BANK",
    code: "526",
  },
  {
    name: "ANGLOMAS INTERNASIONAL BANK",
    code: "531",
  },
  {
    name: "BANK DIPO INTERNATIONAL",
    code: "523",
  },
  {
    name: "BANK KESEJAHTERAAN EKONOMI",
    code: "535",
  },
  {
    name: "BANK UIB",
    code: "536",
  },
  {
    name: "BANK ARTOS IND",
    code: "542",
  },
  {
    name: "BANK PURBA DANARTA",
    code: "547",
  },
  {
    name: "BANK MULTI ARTA SENTOSA",
    code: "548",
  },
  {
    name: "BANK MAYORA",
    code: "553",
  },
  {
    name: "BANK INDEX SELINDO",
    code: "555",
  },
  {
    name: "BANK VICTORIA INTERNATIONAL",
    code: "566",
  },
  {
    name: "BANK EKSEKUTIF",
    code: "558",
  },
  {
    name: "CENTRATAMA NASIONAL BANK",
    code: "559",
  },
  {
    name: "BANK FAMA INTERNASIONAL",
    code: "562",
  },
  {
    name: "BANK SINAR HARAPAN BALI",
    code: "564",
  },
  {
    name: "BANK HARDA",
    code: "567",
  },
  {
    name: "BANK FINCONESIA",
    code: "945",
  },
  {
    name: "BANK MERINCORP",
    code: "946",
  },
  {
    name: "BANK MAYBANK INDOCORP",
    code: "947",
  },
  {
    name: "BANK OCBC – INDONESIA",
    code: "948",
  },
  {
    name: "BANK CHINA TRUST INDONESIA",
    code: "949",
  },
  {
    name: "BANK COMMONWEALTH",
    code: "950",
  },
  {
    name: "BANK BJB SYARIAH",
    code: "425",
  },
  {
    name: "BPR KS (KARYAJATNIKA SEDAYA)",
    code: "688",
  },
  {
    name: "INDOSAT DOMPETKU",
    code: "789",
  },
  {
    name: "TELKOMSEL TCASH",
    code: "911",
  },
  {
    name: "LINKAJA",
    code: "911",
  },
];

function getBankNameByCode(bankCode) {
  const bank = codebank.find((bank) => bank.code === bankCode);
  return bank ? bank.name : "Bank tidak ditemukan"; // Mengembalikan nama bank jika ditemukan, jika tidak mengembalikan pesan kesalahan
}

controllerscetak.cetak = async (req, res) => {};
controllerscetak.cetak2 = async (req, res) => {
  let y;

  let idoprt = req.body.idpel;
  let idtrx = req.body.idtrx;
  console.log(idtrx);
  try {
    var jasaloket = parseInt(req.body.jasaloket);

    if (idtrx > 0) {
      y = await utilirs.runQuerySelectPromise(
        req,
        "select concat(t.tanggal,' ',t.jam) as waktu,t.namareseller,t.idtransaksi,t.kodeproduk,t.idterminal,t.keterangan,t.sn,t.tujuan,t.nominal,p.namaproduk,p.idoperator from transaksi t left join produk p on t.idproduk=p.idproduk where t.idtransaksi=? and t.jenistransaksi<>5 and t.statustransaksi=1 order by t.idtransaksi desc limit 1",
        [idtrx],
      );
    } else {
      y = await utilirs.runQuerySelectPromise(
        req,
        "select concat(t.tanggal,' ',t.jam) as waktu,t.namareseller,t.idtransaksi,t.kodeproduk,t.idterminal,t.keterangan,t.sn,t.tujuan,t.nominal,p.namaproduk,p.idoperator from transaksi t left join produk p on t.idproduk=p.idproduk where t.tujuan=? and t.jenistransaksi<>5 and t.statustransaksi=1 order by t.idtransaksi desc limit 1",
        [idoprt],
      );
    }
    // console.log(y);
    if (y.length > 0) {
      if (y[0].kodeproduk == "PLN") {
        var nama = y[0].namareseller;
        var waktu = y[0].waktu;
        var ket = y[0].keterangan;
        let idpel = y[0].tujuan;
        let tagihan = ket.split("NOMINAL:")[1].split(",")[0];
        //let tagihan = 74139;
        tagihan = S(tagihan).replaceAll(".", "");
        let adminbank = ket.split("ADMIN:")[1].split(",")[0];
        adminbank = S(adminbank).replaceAll(",", "");
        let totalbayar = parseInt(tagihan) + parseInt(adminbank);
        totalbayar = totalbayar + jasaloket;
        //var jml = parseInt(ket.split("@JML:")[1].split("@")[0]);
        struk =
          "STRUK PEMBAYARAN TAGIHAN LISTRIK\n\r" +
          "\nNama Outlet :" +
          nama +
          "\nTGL BAYAR   :" +
          waktu +
          "\nIDPEL       :" +
          idpel +
          "\nNAMA        :" +
          ket.split("NAMAPELANGGAN:")[1].split(",")[0] +
          "\nTARIF DAYA  :" +
          ket.split("SUBSCRIBERSEGMENTATION:")[1].split(",")[0] +
          "/" +
          ket.split("POWERCONSUMINGCATEGORY:")[1].split(",")[0] +
          "\nSTAND METER :" +
          ket.split("SLALWBP1:")[1].split(",")[0] +
          "-" +
          ket.split("SAHLWBP1:")[1].split(",")[0] +
          "\nBLN/TH      :" +
          ket.split("PERIODE:")[1].split(",")[0] +
          //"\nJML         :" + jml.toString() +
          "\nNO REF      :" +
          ket.split("REF2:")[1].split(",")[0] +
          "\n\nRP TAG PLN  :RP." +
          pad(utilirs.todesimal(tagihan).toString(), 12, { lpad: "." }) +
          "\nADMIN       :RP." +
          pad(utilirs.todesimal(adminbank).toString(), 12, { lpad: "." }) +
          "\nJASA LOKET  :Rp." +
          pad(utilirs.todesimal(jasaloket).toString(), 12, { lpad: "." }) +
          "\n\nTOTAL BAYAR :RP." +
          pad(utilirs.todesimal(totalbayar).toString(), 12, { lpad: "." }) +
          "\n\nPLN menyatakan struk ini sebagai bukti pembayaran yang sah\n" +
          "\nTERIMA KASIH\r\n";
        res.json({
          success: true,
          source: 1,
          kodeproduk: y[0].kodeproduk,
          idtrx: y[0].idtransaksi,
          idterminal: y[0].idterminal,
          sn: y[0].sn,
          msg: struk,
        });
        return;
      } else {
        if (y[0].kodeproduk == "PPLN") {
          var nama = y[0].namareseller;
          var waktu = y[0].waktu;
          var ket = y[0].keterangan;
          let idpel = y[0].tujuan;
          let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
          //let tagihan = 74139;
          tagihan = S(tagihan).replaceAll(".", "");
          let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
          adminbank = S(adminbank).replaceAll(",", "");
		  let denda = ket.split("DENDA:")[1].split(",")[0];
          denda = S(denda).replaceAll(",", "");
          let totalbayar = parseInt(tagihan) + parseInt(adminbank) + parseInt(denda);
          totalbayar = totalbayar + jasaloket;
          //var jml = parseInt(ket.split("@JML:")[1].split("@")[0]);
          struk =
            "STRUK PEMBAYARAN TAGIHAN LISTRIK\n\r" +
            "\nNama Outlet :" +
            nama +
            "\nTGL BAYAR   :" +
            waktu +
            "\nIDPEL       :" +
            idpel +
            "\nNAMA        :" +
            ket.split("CUSTOMERNAME:")[1].split(",")[0] +
            "\nTARIF DAYA  :" +            
            ket.split("TARIF:")[1].split(",")[0] +
            //"\nSTAND METER :" +
            //ket.split("STMETER:")[1].split(",")[0] +            
            "\nBLN/TH      :" +
            ket.split("PERIODE:")[1].split(",")[0] +
            //"\nJML         :" + jml.toString() +
            "\nNO SN      :" +
            ket.split("SN:")[1].split(",")[0] +
            "\n\nRP TAG PLN  :RP." +
            pad(utilirs.todesimal(tagihan).toString(), 12, { lpad: "." }) +
            "\nADMIN       :RP." +
            pad(utilirs.todesimal(adminbank).toString(), 12, { lpad: "." }) +
			"\nDENDA      :RP." +
            pad(utilirs.todesimal(denda).toString(), 12, { lpad: "." }) +
            "\nJASA LOKET  :Rp." +
            pad(utilirs.todesimal(jasaloket).toString(), 12, { lpad: "." }) +
            "\n\nTOTAL BAYAR :RP." +
            pad(utilirs.todesimal(totalbayar).toString(), 12, { lpad: "." }) +
            "\n\nPLN menyatakan struk ini sebagai bukti pembayaran yang sah\n" +
            "\nTERIMA KASIH\r\n";
          res.json({
            success: true,
            source: 1,
            kodeproduk: y[0].kodeproduk,
            idtrx: y[0].idtransaksi,
            idterminal: y[0].idterminal,
            sn: y[0].sn,
            msg: struk,
          });
          return;
        } else {
          if (y[0].kodeproduk == "BPJSKS") {
            var nama = y[0].namareseller;
            var waktu = y[0].waktu;
            var ket = y[0].keterangan;
            let idpel = y[0].tujuan;
            let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
            tagihan = S(tagihan).replaceAll(",", "");
            let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
            // let adminbank = ket.split("/ADMIN:")[1].split("/")[0];
            adminbank = S(adminbank).replaceAll(".", "");
            let totalbayar = parseInt(tagihan) + parseInt(adminbank);
            totalbayar = totalbayar + jasaloket;
            // var jml = parseInt(ket.split("PERIODE:")[1].split("#")[0]);
            struk =
              "STRUK PEMBAYARAN BPJS KESEHATAN\n\r" +
              "\nNama Outlet :" +
              nama +
              "\nTGL BAYAR   :" +
              waktu +
              "\nIDPEL       :" +
              idpel +
              "\nNAMA        :" +
              ket.split("CUSTOMERNAME:")[1].split(",")[0] +
              "\nNO VA       :" +
              ket.split("MSISDN:")[1].split(",")[0] +
              "\nPESERTA     :" + ket.split("JUMLAHPESERTA:")[1].split(",")[0] +
              "\nPERIODE     :" +
              ket.split("PERIODE:")[1].split(",")[0] +
              "Bulan" +
              "\nNO REF      :" +
              ket.split("SN:")[1].split(",")[0] +
              "\n\nRP TAG      :RP." +
              pad(utilirs.todesimal(tagihan).toString(), 12, { lpad: "." }) +
              "\nRP Admin    :RP." +
              pad(utilirs.todesimal(adminbank).toString(), 12, { lpad: "." }) +
              "\nJASA LOKET  :Rp." +
              pad(utilirs.todesimal(jasaloket).toString(), 12, { lpad: "." }) +
              "\nTOTAL BAYAR :RP." +
              pad(utilirs.todesimal(totalbayar).toString(), 12, { lpad: "." }) +
              "\n\nBPJS menyatakan struk ini sebagai bukti pembayaran yang sah\n" +
              "\nTERIMA KASIH\r\n";
            res.json({
              success: true,
              source: 1,
              kodeproduk: y[0].kodeproduk,
              idtrx: y[0].idtransaksi,
              idterminal: y[0].idterminal,
              sn: y[0].sn,
              msg: struk,
            });
            return;
          } else {
            if (y[0].kodeproduk == "WOM" || y[0].kodeproduk == "FNHCI") {
              var nama = y[0].namareseller;
              nama = nama.slice(0, -5);
              var waktu = y[0].waktu;
              var ket = y[0].keterangan;
              let idpel = y[0].tujuan;
              let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
              tagihan = S(tagihan).replaceAll(",", "");
              //let denda = ket.split("DENDA:")[1].split(",")[0];
              //denda = S(denda).replaceAll(",", "");
              //if (denda < 1) {
              //    denda = 0;
              // };
              //let biaya = ket.split(",BIAYA:")[1].split(",")[0];
              //biaya = S(biaya).replaceAll(",", "");
              let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
              adminbank = S(adminbank).replaceAll(".", "");
              let totalbayar = parseInt(tagihan) + parseInt(adminbank);
              totalbayar = totalbayar + jasaloket;
              // var jml = parseInt(ket.split("/PERIODE:")[1].split("/")[0]);
              struk =
                "STRUK PEMBAYARAN MULTIFINNANCE \n\r" +
                "\nNama Outlet :" +
                nama +
                "\nTGL BAYAR   :" +
                waktu +
                "\nNO REF      :" +
                ket.split("SN")[1].split(",")[0] +
                "\n---------------------------- " +
                "\nFINANCE     :" +
                y[0].namaproduk +
                "\nNO KONTRAK  :" +
                idpel +
                "\nNAMA        :" +
                ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                "\nANGSURAN KE :" +
                ket.split("PERIODE:")[1].split(",")[0] + //"/" + ket.split(",TOTANGS:")[1].split(",")[0] +
                "\nTENOR       :" +
                ket.split("TENOR:")[1].split(",")[0] +
                //"\nPLATFORM    :" + ket.split(",PLATFORM:")[1].split(",")[0] +

                //"\nJML         :" + jml.toString() +
                "\n\nRP TAG      :RP." +
                pad(utilirs.todesimal(tagihan).toString(), 12, { lpad: "." }) +
                "\nRP ADMIN    :RP." +
                pad(utilirs.todesimal(adminbank).toString(), 12, {
                  lpad: ".",
                }) +
                //"\nRP DENDA    :RP." + pad(utilirs.todesimal(denda).toString(), 12, { lpad: "." }) +
                //"\nRP BIAYA    :RP." + pad(utilirs.todesimal(biaya).toString(), 12, { lpad: "." }) +
                "\nJASA LOKET  :Rp." +
                pad(utilirs.todesimal(jasaloket).toString(), 12, {
                  lpad: ".",
                }) +
                "\n---------------------------- " +
                "\nTOTAL BAYAR :RP." +
                pad(utilirs.todesimal(totalbayar).toString(), 12, {
                  lpad: ".",
                }) +
                "\n\nWOM menyatakan struk ini sebagai bukti pembayaran yang sah\n" +
                "\nTERIMA KASIH\r\n";
              res.json({
                success: true,
                source: 1,
                kodeproduk: y[0].kodeproduk,
                idtrx: y[0].idtransaksi,
                idterminal: y[0].idterminal,
                sn: y[0].sn,
                msg: struk,
              });
              return;
            } else {
              if (y[0].kodeproduk == "FIF") {
                var nama = y[0].namareseller;
                nama = nama.slice(0, -5);
                var waktu = y[0].waktu;
                var ket = y[0].keterangan;
                let idpel = y[0].tujuan;
                let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
                tagihan = S(tagihan).replaceAll(".", "");
                //let denda = ket.split("DENDA")[1].split(",")[0];
                //denda = S(denda).replaceAll(".", "");
                //let biaya = ket.split(",BIAYA:")[1].split(",")[0];
                //biaya = S(biaya).replaceAll(",", "");
                let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
                adminbank = S(adminbank).replaceAll(".", "");
                let totalbayar = parseInt(tagihan) + parseInt(adminbank);
                totalbayar = totalbayar + jasaloket;
                var jml = parseInt(ket.split("PERIODE:")[1].split(",")[0]);
                struk =
                  "STRUK PEMBAYARAN FIF \n\r" +
                  "\nNama Outlet :" +
                  nama +
                  "\nTGL BAYAR   :" +
                  waktu +
                  "\nNO KONTRAK  :" +
                  idpel +
                  "\nNAMA        :" +
                  ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                  "\nANGSURAN    :" +
                  ket.split("PERIODE:")[1].split(",")[0] +
                  //"\nJTHTEMPO    :" + ket.split("#JTHTEMPO:")[1].split("#")[0] +
                  //"\nPLATFORM    :" + ket.split(",PLATFORM:")[1].split(",")[0] +
                  "\nNO REF      :" +
                  ket.split("SN:")[1].split(",")[0] +
                  //"\nJML         :" + jml.toString() + " BULAN" +
                  "\n---------------------------- " +
                  "\nRP TAG      :RP." +
                  pad(utilirs.todesimal(tagihan).toString(), 12, {
                    lpad: ".",
                  }) +
                  "\nRP ADMIN    :RP." +
                  pad(utilirs.todesimal(adminbank).toString(), 12, {
                    lpad: ".",
                  }) +
                  //"\nRP DENDA    :RP." + pad(utilirs.todesimal(denda).toString(), 12, { lpad: "." }) +
                  //"\nRP BIAYA    :RP." + pad(utilirs.todesimal(biaya).toString(), 12, { lpad: "." }) +
                  "\nJASA LOKET  :Rp." +
                  pad(utilirs.todesimal(jasaloket).toString(), 12, {
                    lpad: ".",
                  }) +
                  "\n---------------------------- " +
                  "\nTOTAL BAYAR :RP." +
                  pad(utilirs.todesimal(totalbayar).toString(), 12, {
                    lpad: ".",
                  }) +
                  "\n---------------------------- " +
                  "\n\nFIF menyatakan struk ini sebagai bukti pembayaran yang sah\n" +
                  "\nTERIMA KASIH\r\n";
                res.json({
                  success: true,
                  source: 1,
                  kodeproduk: y[0].kodeproduk,
                  idtrx: y[0].idtransaksi,
                  idterminal: y[0].idterminal,
                  sn: y[0].sn,
                  msg: struk,
                });
                return;
              } else {
                if (y[0].idoperator == "74") {
                  var nama = y[0].namareseller;
                  var sn = y[0].sn;
                  var waktu = y[0].waktu;
                  var ket = y[0].keterangan;
                  let idpel = y[0].tujuan;
                  //let totaltag = ket.split("NOMINAL:")[1].split(",")[0];
                  // totaltag = S(totaltag).replaceAll(",", "");
                  let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
                  tagihan = S(tagihan).replaceAll(",", "");
                  //let denda = sn.split(",DENDA:")[1].split(",")[0];
                  //denda = S(denda).replaceAll(",", "");
                  //let pemakaian = sn.split(",PEMAKAIAN:")[1].split(",")[0];
                  //pemakaian = S(pemakaian).replaceAll(",", "");
                  //let standmeter = sn.split(",STANMETER:")[1].split("},")[0];
                  //standmeter = S(standmeter).replaceAll(",", "");
                  let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
                  adminbank = S(adminbank).replaceAll(".", "");
                  let totalbayar = parseInt(tagihan) + parseInt(adminbank);
                  totalbayar = totalbayar + jasaloket;
                  //var jml = parseInt(ket.split("/PERIODE:")[1].split("/")[0]);
                  struk =
                    "STRUK PEMBAYARAN \r" +
                    "\n" +
                    y[0].namaproduk +
                    "\n\nOUTLET      :" +
                    nama +
                    "\nTGL BAYAR   :" +
                    waktu +
                    "\nNO KONTRAK  :" +
                    idpel +
                    "\nNAMA        :" +
                    ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                    "\nBULAN       :" +
                    ket.split("PERIODE:")[1].split(",")[0] +
                    "\nSTAND METER :" +
                    ket.split("METERAWAL:")[1].split(",")[0] +
                    "-" +
                    ket.split("METERAKHIR:")[1].split(",")[0] +
                    "\nNO REF      :" +
                    ket.split("SN:")[1].split(",")[0] +
                    //"\nPERIODE     :" + jml.toString() +
                    "\n\nRP TAG      :RP." +
                    pad(utilirs.todesimal(tagihan).toString(), 12, {
                      lpad: ".",
                    }) +
                    "\nRP ADMIN    :RP." +
                    pad(utilirs.todesimal(adminbank).toString(), 12, {
                      lpad: ".",
                    }) +
                    //"\nRP DENDA    :RP." + pad(utilirs.todesimal(denda).toString(), 12, { lpad: "." }) +
                    //"\nRP PEMAKAIAN:RP." + pad(utilirs.todesimal(pemakaian).toString(), 12, { lpad: "." }) +
                    "\nJASA LOKET  :Rp." +
                    pad(utilirs.todesimal(jasaloket).toString(), 12, {
                      lpad: ".",
                    }) +
                    "\n             --------------- " +
                    "\nTOTAL BAYAR :RP." +
                    pad(utilirs.todesimal(totalbayar).toString(), 12, {
                      lpad: ".",
                    }) +
                    "\n\nStruk ini merupakan bukti pembayaran yang sah\n" +
                    "\nTERIMA KASIH\r\n";
                  res.json({
                    success: true,
                    source: 1,
                    kodeproduk: y[0].kodeproduk,
                    idtrx: y[0].idtransaksi,
                    idterminal: y[0].idterminal,
                    sn: y[0].sn,
                    msg: struk,
                  });
                  return;
                } else {
                  if (y[0].kodeproduk == "HALO") {
                    var nama = y[0].namareseller;
                    var sn = y[0].sn;
                    var waktu = y[0].waktu;
                    var ket = y[0].keterangan;
                    let idpel = y[0].tujuan;
                    //let totaltag = ket.split("@BAYAR")[1].split("@")[0];
                    //totaltag = S(totaltag).replaceAll(",", "");
                    let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
                    tagihan = S(tagihan).replaceAll(",", "");
                    let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
                    adminbank = S(adminbank).replaceAll(".", "");
					
                    let totalbayar = parseInt(tagihan) + parseInt(adminbank);
                    totalbayar = totalbayar;
                    
                    struk =
                      "STRUK PEMBAYARAN HP PASCA \r" +
                      "\n\nOUTLET      :" +
                      nama +
                      "\nTGL BAYAR   :" +
                      waktu +
                      "\nIDPEL       :" +
                      idpel +
                      "\nPRODUK      :" +
                      y[0].namaproduk +
                      "\nNAMA        :" +
                      ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                      "\nNO REF      :" +
                      ket.split("SN:")[1].split(",")[0] +
                      "\nPERIODE     :" +
                      jml.toString() +
                      "\n\nRP TAG      :RP." +
                      pad(utilirs.todesimal(tagihan).toString(), 12, {
                        lpad: ".",
                      }) +
					  
                      "\nRP ADMIN     :RP." +
                      pad(utilirs.todesimal(adminbank).toString(), 12, {
                        lpad: ".",
                      }) +
                      "\nJASA LOKET   :Rp." +
                      pad(utilirs.todesimal(jasaloket).toString(), 12, {
                        lpad: ".",
                      }) +
                      "\nTOTAL BAYAR :RP." +
                      pad(utilirs.todesimal(totalbayar).toString(), 12, {
                        lpad: ".",
                      }) +
                      "\n\nStruk ini merupakan bukti pembayaran yang sah\n" +
                      "\nTERIMA KASIH\r\n";
                    res.json({
                      success: true,
                      source: 1,
                      kodeproduk: y[0].kodeproduk,
                      idtrx: y[0].idtransaksi,
                      idterminal: y[0].idterminal,
                      sn: y[0].sn,
                      msg: struk,
                    });
                    return;
                  } else {
                    if (y[0].kodeproduk == "XPLOR") {
                      var nama = y[0].namareseller;
                      var sn = y[0].sn;
                      var waktu = y[0].waktu;
                      var ket = y[0].keterangan;
                      let idpel = y[0].tujuan;
                      //let totaltag = ket.split("@BAYAR")[1].split("@")[0];
                      //totaltag = S(totaltag).replaceAll(",", "");
                      let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
                      tagihan = S(tagihan).replaceAll(".", "");
                      let adminbank = ket
                        .split("ADMINFEE:")[1]
                        .split(",")[0];
                      adminbank = S(adminbank).replaceAll(".", "");
                      let totalbayar = parseInt(tagihan) + parseInt(adminbank);
                      totalbayar = totalbayar;
                      //var jml = parseInt(ket.split("JML BLN:")[1].split(",")[0]);
                      struk =
                        "STRUK PEMBAYARAN HP PASCA \r" +
                        "\n\nOUTLET      :" +
                        nama +
                        "\nTGL BAYAR   :" +
                        waktu +
                        "\nIDPEL       :" +
                        idpel +
                        "\nPRODUK      :" +
                        y[0].namaproduk +
                        "\nNAMA        :" +
                        ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                        "\nNO REF      :" +
                        ket.split("SN:")[1].split(",")[0] +
                        //"\nPERIODE     :" + jml.toString() +
                        "\n\nRP TAG      :RP." +
                        pad(utilirs.todesimal(tagihan).toString(), 12, {
                          lpad: ".",
                        }) +
                        "\nRP ADMIN    :RP." +
                        pad(utilirs.todesimal(adminbank).toString(), 12, {
                          lpad: ".",
                        }) +
                        "\nJASA LOKET  :Rp." +
                        pad(utilirs.todesimal(jasaloket).toString(), 12, {
                          lpad: ".",
                        }) +
                        "\nTOTAL BAYAR :RP." +
                        pad(utilirs.todesimal(totalbayar).toString(), 12, {
                          lpad: ".",
                        }) +
                        "\n\nStruk ini merupakan bukti pembayaran yang sah\n" +
                        "\nTERIMA KASIH\r\n";
                      res.json({
                        success: true,
                        source: 1,
                        kodeproduk: y[0].kodeproduk,
                        idtrx: y[0].idtransaksi,
                        idterminal: y[0].idterminal,
                        sn: y[0].sn,
                        msg: struk,
                      });
                      return;
                    } else {
                      if (y[0].kodeproduk == "TELKOM") {
                        var nama = y[0].namareseller;
                        var waktu = y[0].waktu;
                        var ket = y[0].keterangan;
                        let idpel = y[0].tujuan;
                        let tagihan = ket.split("AMOUNTDUE:")[1].split(",")[0];
                        tagihan = S(tagihan).replaceAll(".", "");
                        let adminbank = ket.split("ADMINFEE:")[1].split(",")[0];
                        adminbank = S(adminbank).replaceAll(".", "");
                        let totalbayar =
                          parseInt(tagihan) + parseInt(adminbank);
                        totalbayar = totalbayar + jasaloket;
                        // var jml = parseInt(ket.split(",JML:")[1].split(",")[0]);
                        struk =
                          "STRUK PEMBAYARAN TELKOM \n\r" +
                          "\nNama Outlet :" +
                          nama +
                          "\nTGL BAYAR   :" +
                          waktu +
                          "\nNO KONTRAK  :" +
                          idpel +
                          "\nNAMA        :" +
                          ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                          "\nPERIODE     :" +
                          ket.split("PERIODE:")[1].split(",")[0] +
                          "\nNO REF      :" +
                          ket.split("SN:")[1].split(",")[0] +
                          //"\nJML BLN     :" +
                          //ket.split(":")[1].split(",")[0] +
                          "\n\nRP TAG      :RP." +
                          pad(utilirs.todesimal(tagihan).toString(), 12, {
                            lpad: ".",
                          }) +
                          "\nRP ADMIN    :RP." +
                          pad(utilirs.todesimal(adminbank).toString(), 12, {
                            lpad: ".",
                          }) +
                          "\nJASA LOKET  :Rp." +
                          pad(utilirs.todesimal(jasaloket).toString(), 12, {
                            lpad: ".",
                          }) +
                          "\nTOTAL BAYAR :RP." +
                          pad(utilirs.todesimal(totalbayar).toString(), 12, {
                            lpad: ".",
                          }) +
                          "\n\nTELKOM menyatakan struk ini sebagai bukti pembayaran yang sah\n" +
                          "\nTERIMA KASIH\r\n";
                        res.json({
                          success: true,
                          source: 1,
                          kodeproduk: y[0].kodeproduk,
                          idtrx: y[0].idtransaksi,
                          idterminal: y[0].idterminal,
                          sn: y[0].sn,
                          msg: struk,
                        });
                        return;
                      } else {
                        if (y[0].idoperator == "101") {
                          var nama = y[0].namareseller;
                          var ket = y[0].keterangan;
                          var waktu = y[0].waktu;
                          let idpel = y[0].tujuan;
                          var sn = y[0].sn;
                          let tagihan = ket
                            .split("AMOUNTDUE")[1]
                            .split(",")[0];
                          tagihan = S(tagihan).replaceAll(",", "");
                          //let adminbank = ket.split("@")[10].split(",")[2].split(":")[1];
                          //adminbank = S(adminbank).replaceAll(".", "");
                          let totalbayar = parseInt(tagihan);
                          totalbayar = totalbayar + jasaloket;
                          //var jml = parseInt(ket.split("@")[10].split(":")[1].split(",")[0]);
                          struk =
                            "STRUK PEMBELIAN TSEL DATA\n\r" +
                            "\nNama Outlet : " +
                            nama +
                            "\nTGL BELI    : " +
                            waktu +
                            "\nIDPEL       : " +
                            idpel +
                            //"\nNO.TRX      : " + y[0].idtransaksi +
                            "\nNO.TUJUAN   : " +
                            y[0].tujuan +
                            "\nPRODUK      : " +
                            y[0].namaproduk +
                            "\nSN          : " +
                            sn +
                            //"\nJML         : " + jml.toString() +
                            // "\nRP TAGIHAN  : RP." + pad(utilirs.todesimal(tagihan).toString(), 12, { lpad: "." }) +
                            //"\nADMIN       : RP." + pad(utilirs.todesimal(adminbank).toString(), 12, { lpad: "." }) +
                            // "\nJASA LOKET  : Rp." + pad(utilirs.todesimal(jasaloket).toString(), 12, { lpad: "." }) +

                            "\n\nKeterangan  : " +
                            ket.split("MSISDN:")[1].split(",")[0] +
                            "\nTOTAL BAYAR : RP." +
                            pad(utilirs.todesimal(totalbayar).toString(), 12, {
                              lpad: ".",
                            }) +
                            "\n\nStruk ini merupakan bukti pembayaran yang sah\n" +
                            "\n\nTERIMA KASIH\r\n";
                          res.json({
                            success: true,
                            source: 1,
                            kodeproduk: y[0].kodeproduk,
                            idtrx: y[0].idtransaksi,
                            idterminal: y[0].idterminal,
                            sn: y[0].sn,
                            msg: struk,
                          });
                          return;
                        } else {
                          if (y[0].kodeproduk == "OMNI") {
                            var nama = y[0].namareseller;
                            var ket = y[0].keterangan;
                            var waktu = y[0].waktu;
                            let idpel = y[0].tujuan;
                            var sn = y[0].sn;
                            let tagihan = ket
                              .split("AMOUNTDUE:")[1]
                              .split(",")[0];
                            tagihan = S(tagihan).replaceAll(",", "");
                            let notuj = ket.split("MSISDN")[1].split(",")[1];
                            //adminbank = S(adminbank).replaceAll(".", "");
                            let totalbayar = parseInt(tagihan);
                            totalbayar = totalbayar + jasaloket;
                            //var jml = parseInt(ket.split("@")[10].split(":")[1].split(",")[0]);
                            struk =
                              "STRUK PEMBELIAN TSEL DATA OMNI CHANNEL\n\r" +
                              "\nNama Outlet : " +
                              nama +
                              "\nTGL BELI    : " +
                              waktu +
                              "\nQRCODE      : " +
                              idpel +
                              //"\nNO.TRX      : " + y[0].idtransaksi +
                              "\nNO.TUJUAN   : " +
                              notuj +
                              "\nPRODUK      : " +
                              y[0].namaproduk +
                              "\nSN          : " +
                              sn +
                              //"\nJML         : " + jml.toString() +
                              // "\nRP TAGIHAN  : RP." + pad(utilirs.todesimal(tagihan).toString(), 12, { lpad: "." }) +
                              //"\nADMIN       : RP." + pad(utilirs.todesimal(adminbank).toString(), 12, { lpad: "." }) +
                              // "\nJASA LOKET  : Rp." + pad(utilirs.todesimal(jasaloket).toString(), 12, { lpad: "." }) +

                              "\n\nKeterangan  : \n" +
                              ket.split("MSISDN:")[1].split(",")[0] +
                              "\n\nTOTAL BAYAR : RP." +
                              pad(
                                utilirs.todesimal(totalbayar).toString(),
                                12,
                                {
                                  lpad: ".",
                                },
                              ) +
                              "\n\nStruk ini merupakan bukti pembayaran yang sah\n" +
                              "\n\nTERIMA KASIH\r\n";
                            res.json({
                              success: true,
                              source: 1,
                              kodeproduk: y[0].kodeproduk,
                              idtrx: y[0].idtransaksi,
                              idterminal: y[0].idterminal,
                              sn: y[0].sn,
                              msg: struk,
                            });
                            return;
                          } else {
                            if (y[0].kodeproduk == "ADIRA") {
                              var sn = y[0].sn;
                              var ket = y[0].keterangan;
                              var waktu = y[0].waktu;
                              let idpel = y[0].tujuan;
                              let tagihan = ket
                                .split("AMOUNTDUE:")[1]
                                .split(",")[0];
                              tagihan = S(tagihan).replaceAll(",", "");
                              let adminbank = ket
                                .split("ADMINFEE:")[1]
                                .split(",")[0];
                              adminbank = S(adminbank).replaceAll(".", "");
                              let totalbayar =
                                parseInt(tagihan) + parseInt(adminbank);
                              totalbayar = totalbayar + jasaloket;
                              struk =
                                "STRUK PEMBAYARAN ADIRA FINANCE\n\r" +
                                "\nTGL BAYAR   :" +
                                waktu +
                                "\nADIRA ID    :" +
                                idpel +
                                "\nNAMA        :" +
                                ket.split("CUSTOMERNAME:")[1].split(",")[0] +
                                "\nNo. POL     :" +
                                ket.split("NOPOL:")[1].split("}},")[0] +
                                "\nTENOR       :" +
                                ket.split("TENOR:")[1].split(",")[0] +
                                "\nANGSURAN KE :" +
                                ket.split("PERIODE:")[1].split(",")[0] +
                                //"\nJTEM        :" +
                                //ket.split("JATUHTEMPO:")[1].split(",")[0] +
                                "\nRP TAGIHAN  :RP." +
                                pad(utilirs.todesimal(tagihan).toString(), 12, {
                                  lpad: ".",
                                }) +
                                "\nADMIN       :RP." +
                                pad(
                                  utilirs.todesimal(adminbank).toString(),
                                  12,
                                  {
                                    lpad: ".",
                                  },
                                ) +
                                "\nJASA LOKET  :Rp." +
                                pad(
                                  utilirs.todesimal(jasaloket).toString(),
                                  12,
                                  {
                                    lpad: ".",
                                  },
                                ) +
                                "\nTOTAL BAYAR :RP." +
                                pad(
                                  utilirs.todesimal(totalbayar).toString(),
                                  12,
                                  {
                                    lpad: ".",
                                  },
                                ) +
                                "\n\nStruk ini merupakan bukti pembayaran yang sah\n" +
                                "\n\nTERIMA KASIH\r\n";
                              res.json({
                                success: true,
                                source: 1,
                                kodeproduk: y[0].kodeproduk,
                                idtrx: y[0].idtransaksi,
                                idterminal: y[0].idterminal,
                                sn: y[0].sn,
                                msg: struk,
                              });
                              return;
                            } else {
                              if (y[0].idoperator == "110") {
                                // let sn = y[0].sn;
                                let waktu = y[0].waktu;
                                let namabank = y[0].namaproduk;
                                let ket = y[0].keterangan;
                                let nama = y[0].namareseller;
                                let idtermninal = y[0].idterminal;
                                let transfer;
                                let struk;
                                // struk rajabiller Transfer bank
                                if (idtermninal == "534") {
                                  namabank = y[0].namaproduk;
                                  namabank = S(namabank).replaceAll(
                                    "TRANSFER ",
                                    "",
                                  );
                                  transfer = ket
                                    .split("NOMINAL:")[1]
                                    .split(",")[0];
                                  transfer = S(transfer).replaceAll(",", "");
                                  //let adminbank = ket.split(" ADMIN:")[1].split(",")[0];
                                  //adminbank = S(adminbank).replaceAll(",", "");

                                  nama = nama.slice(0, -5);
                                  let totalbayar = parseInt(transfer);
                                  totalbayar = totalbayar + jasaloket;
                                  struk =
                                    "BUKTI TRANSFER ANTAR BANK\n" +
                                    "\nNAMA OUTLET :" +
                                    nama +
                                    "\nTANGGAL     :" +
                                    waktu +
                                    "\nREFF        :" +
                                    ket.split("REF2:")[1].split(",")[0] +
                                    "\n---------------------------- " +
                                    "\nBANK TUJUAN :" +
                                    namabank +
                                    "\nKode Bank   :" +
                                    ket.split("KODEBANK:")[1].split(",")[0] +
                                    "\nNo.REKENING :" +
                                    ket.split("IDPEL1:")[1].split(",")[0] +
                                    "\nATAS NAMA   :" +
                                    ket
                                      .split("NAMAPELANGGAN:")[1]
                                      .split(",")[0] +
                                    "\n\nJUMLAH      :Rp " +
                                    pad(
                                      utilirs.todesimal(transfer).toString(),
                                      12,
                                      {
                                        lpad: ".",
                                      },
                                    ) +
                                    "\nBIAYA       :Rp " +
                                    pad(
                                      utilirs.todesimal(jasaloket).toString(),
                                      12,
                                      {
                                        lpad: ".",
                                      },
                                    ) +
                                    "\n---------------------------- " +
                                    "\nTOTAL BAYAR :Rp " +
                                    pad(
                                      utilirs.todesimal(totalbayar).toString(),
                                      12,
                                      { lpad: "." },
                                    ) +
                                    "\n\nPENGIRIM    :DOMPET HARAPAN BANGSA" +
                                    "\nSTATUS      :BERHASIL" +
                                    "\n----------------------------\n" +
                                    nama +
                                    "\nTerima Layanan Transfer Antar Bank" +
                                    "\nPembayaan PLN, Topup Emoney, Pulsa dll" +
                                    "\n\nTERIMA KASIH" +
                                    "\nwww.lazimpay.com\n";
                                } else if (idtermninal == "571") {
                                 //oy indonesia

                                   transfer = ket
                                    .split("AMOUNT:")[1]
                                    .split(",")[0];
                                  transfer = S(transfer).replaceAll(",", "");

                                  let totalbayar = parseInt(transfer);
                                  totalbayar = totalbayar + jasaloket;
                                  let kodebank = ket
                                    .split("RECIPIENTBANK:")[1]
                                    .split(",")[0];
                                  let bankname = getBankNameByCode(kodebank);
                                  struk =
                                    "BUKTI TRANSFER ANTAR BANK\n" +
                                    "\nTANGGAL     :" +
                                    waktu +
                                    "\nREFF        :\n" +
                                    ket.split(",TRXID:")[1].split(",")[0] +
                                    "\n---------------------------- " +
                                    "\nBANK TUJUAN :" +
                                    bankname +
                                    // ket.split(",BANKNAME:")[1].split(",")[0] +
                                    "\nKode Bank   :" +
                                    kodebank +
                                    "\nNo.REKENING :" +
                                    ket
                                      .split(",RECIPIENTACCOUNT:")[1]
                                      .split(",")[0] +
                                    "\nATAS NAMA   :" +
                                    ket
                                      .split(",RECIPIENTNAME:")[1]
                                      .split(",")[0] +
                                    "\n\nJUMLAH      :Rp " +
                                    pad(
                                      utilirs.todesimal(transfer).toString(),
                                      12,
                                      {
                                        lpad: ".",
                                      }
                                    ) +
                                    "\nBIAYA       :Rp " +
                                    pad(
                                      utilirs.todesimal(jasaloket).toString(),
                                      12,
                                      {
                                        lpad: ".",
                                      }
                                    ) +
                                    "\n---------------------------- " +
                                    "\nTOTAL BAYAR :Rp " +
                                    pad(
                                      utilirs.todesimal(totalbayar).toString(),
                                      12,
                                      { lpad: "." }
                                    ) +
                                    "\n\nPENGIRIM    :LAZIM MULTIMEDIA" +
                                    "\nSTATUS      :" +
                                    ket.split(",MESSAGE:")[1].split("},")[0] +
                                    "\n---------------------------- " +
                                   "\n\nDidukung Oleh OY Indonesia" +
                                    "\nRegistered, Lisensed, and Supervised by Bank Indonesia\n" +
                                    "\nTERIMA KASIH\n" +
                                    "\n\nwww.lazimpay.com\n";
                                  //"\n Aplikasi Pintar Mitra Bisnis Anda\n";
                                } else {
                                  //linkqu
                                  transfer = ket
                                    .split("AMOUNTDUE:")[1]
                                    .split(",")[0];

                                  transfer = S(transfer).replaceAll(" ", "");

                                  nama = nama.slice(0, -5);
                                  let totalbayar = parseInt(transfer);
                                  totalbayar = totalbayar + jasaloket;
                                  struk =
                                    "BUKTI TRANSFER ANTAR BANK\n" +
                                    "\nNAMA OUTLET :" +
                                    nama +
                                    "\nTANGGAL     :" +
                                    waktu +
                                    "\nREFF        :" +
                                    ket
                                      .split("SN:")[1]
                                      .split(",")[0] +
                                    "\n---------------------------- " +
                                    "\nBANK TUJUAN :" +
                                    ket.split("BANKNAME:")[1].split(",")[0] +
                                    "\nKode Bank   :" +
                                     ket.split("BANKCODE:")[1].split(",")[0] +
                                    "\nNo.REKENING :" +
                                    ket
                                      .split("MSISDN:")[1]
                                      .split(",")[0] +
                                    "\nATAS NAMA   :" +
                                    ket
                                      .split("CUSTOMERNAME:")[1]
                                      .split(",")[0] +
                                    "\n\nJUMLAH      :Rp " +
                                    pad(
                                      utilirs.todesimal(transfer).toString(),
                                      12,
                                      {
                                        lpad: ".",
                                      },
                                    ) +
                                    "\nBIAYA       :Rp " +
                                    pad(
                                      utilirs.todesimal(jasaloket).toString(),
                                      12,
                                      {
                                        lpad: ".",
                                      },
                                    ) +
                                    "\n---------------------------- " +
                                    "\nTOTAL BAYAR :Rp " +
                                    pad(
                                      utilirs.todesimal(totalbayar).toString(),
                                      12,
                                      { lpad: "." },
                                    ) +
                                    "\n\nPENGIRIM    :PT. TRI USAHA BERKAT" +
                                    //"\nBERITA      :" +
                                    //ket.split("REMARK:")[1].split(",")[0] +
                                    "\nSTATUS      :" +
                                    ket.split("MESSAGE:")[1].split(",")[0] +
                                    "\n---------------------------- " +                                    
                                    "\n" +
                                    nama +
                                    "\nTerima Layanan Transfer Antar Bank" +
                                    "\nPembayaan PLN, Topup Ewallet, Pulsa dll" +
                                    "\n\nTERIMA KASIH" +
                                    "\nwww.lazimpay.com\n";
                                }

                                res.json({
                                  success: true,
                                  source: 1,
                                  kodeproduk: y[0].kodeproduk,
                                  idtrx: y[0].idtransaksi,
                                  idterminal: y[0].idterminal,
                                  sn: y[0].sn,
                                  msg: struk,
                                });
                                return;
                              } else {
                                if (y[0].idoperator == "202") {
                                  var sn = y[0].sn;
                                  var waktu = y[0].waktu;
                                  var ket = y[0].keterangan;

                                  if (y[0].idterminal == "534") {
                                    let transfer = ket
                                      .split("AMOUNTDUE:")[1]
                                      .split(",")[0];
                                    transfer = S(transfer).replaceAll(",", "");
                                    //let adminbank = ket.split(" ADMIN:")[1].split(",")[0];
                                    //adminbank = S(adminbank).replaceAll(",", "");
                                    var nama = y[0].namareseller;
                                    nama = nama.slice(0, -5);
                                    let totalbayar = parseInt(transfer);
                                    totalbayar = totalbayar + jasaloket;

                                    var struk =
                                      "BUKTI TOPUP EWALLET\n" +
                                      "\nNAMA OUTLET :" +
                                      nama +
                                      "\nTANGGAL     :" +
                                      waktu +
                                      "\nREFF        :" +
                                      ket.split("SN:")[1].split(",")[0] +
                                      "\n---------------------------- " +
                                      "\nEWALLET     :" +
                                      ket
                                        .split("PRODUCTCODE:")[1]
                                        .split(",")[0] +
                                      "\nTUJUAN      :" +
                                      ket.split("MSISDN: ")[1].split(",")[0] +
                                      "\nATAS NAMA   :" +
                                      ket
                                        .split("CUSTOMERNAME:")[1]
                                        .split(",")[0] +
                                      "\n\nJUMLAH      :Rp " +
                                      pad(
                                        utilirs.todesimal(transfer).toString(),
                                        12,
                                        { lpad: "." },
                                      ) +
                                      "\nBIAYA       :Rp " +
                                      pad(
                                        utilirs.todesimal(jasaloket).toString(),
                                        12,
                                        { lpad: "." },
                                      ) +
                                      "\n---------------------------- " +
                                      "\nTOTAL BAYAR :Rp " +
                                      pad(
                                        utilirs
                                          .todesimal(totalbayar)
                                          .toString(),
                                        12,
                                        { lpad: "." },
                                      ) +
                                      "\n\nSTATUS      :" +
                                      ket
                                        .split("MESSAGE:")[1]
                                        .split(",")[0] +
                                      "\n---------------------------- " +
                                      "\nStruk ini merupakan bukti" +
                                      "\npembayaran yang sah" +
                                      "\nTERIMA KASIH\n" +
                                      "\nwww.lazimpay.com\n";
                                    //"\n Aplikasi Pintar Mitra Bisnis Anda\n";
                                  } else {
                                    let transfer = ket
                                      .split("AMOUNTDUE:")[1]
                                      .split(",")[0];
                                    transfer = S(transfer).replaceAll(",", "");
                                    //let adminbank = ket.split(" ADMIN:")[1].split(",")[0];
                                    //adminbank = S(adminbank).replaceAll(",", "");
                                    var nama = y[0].namareseller;
                                    nama = nama.slice(0, -5);
                                    let totalbayar = parseInt(transfer);
                                    totalbayar = totalbayar + jasaloket;

                                    var struk =
                                      "BUKTI TOPUP EWALLET\n" +
                                      "\nNAMA OUTLET :" +
                                      nama +
                                      "\nTANGGAL     :" +
                                      waktu +
                                      "\nREFF        :" +
                                      ket
                                        .split("SN:")[1]
                                        .split(",")[0] +
                                      "\n---------------------------- " +
                                      "\nEWALLET     :" +
                                      ket.split("PRODUCTCODE:")[1].split(",")[0] +
                                      "\nTUJUAN      :" +
                                      ket
                                        .split("MSISDN:")[1]
                                        .split(",")[0] +
                                      "\nATAS NAMA   :" +
                                      ket
                                        .split("CUSTOMERNAME:")[1]
                                        .split(",")[0] +
                                      "\n\nJUMLAH      :Rp " +
                                      pad(
                                        utilirs.todesimal(transfer).toString(),
                                        12,
                                        { lpad: "." },
                                      ) +
                                      "\nBIAYA       :Rp " +
                                      pad(
                                        utilirs.todesimal(jasaloket).toString(),
                                        12,
                                        { lpad: "." },
                                      ) +
                                      "\n---------------------------- " +
                                      "\nTOTAL BAYAR :Rp " +
                                      pad(
                                        utilirs
                                          .todesimal(totalbayar)
                                          .toString(),
                                        12,
                                        { lpad: "." },
                                      ) +
                                      "\n\nSTATUS      :" +
                                      ket.split("STATUS:")[1].split(",")[0] +
                                      "\n---------------------------- " +
                                      "\nStruk ini merupakan bukti" +
                                      "\npembayaran yang sah" +
                                      "\nAdmin Rp 500 akan dipotong oleh Shoppepay" +
                                      "\nTERIMA KASIH\n" +
                                      "\nwww.lazimpay.com\n";
                                  }

                                  res.json({
                                    success: true,
                                    source: 1,
                                    kodeproduk: y[0].kodeproduk,
                                    idtrx: y[0].idtransaksi,
                                    idterminal: y[0].idterminal,
                                    sn: y[0].sn,
                                    msg: struk,
                                  });
                                  return;
                                } else {
                                  if (y[0].idoperator == "37") {
                                    if (y[0].idterminal == "--") {
                                      var sn = y[0].sn;
                                      let ppn = sn.split("/")[6];
                                      ppn = S(ppn).replace(".", "");
                                      let ppj = sn.split("/")[7];
                                      ppj = S(ppj).replace(".", "");
                                      let adminbank = sn.split("/")[8];
                                      adminbank = S(adminbank).replace(".", "");
                                      let rptoken = sn.split("/")[10];
                                      rptoken = S(rptoken).replace(".", "");
                                      let angsuran = sn.split("/")[9];
                                      angsuran = S(angsuran).replaceAll(
                                        ",",
                                        "",
                                      );
                                      let materai = sn.split("/")[5];
                                      materai = S(materai).replaceAll(",", "");
                                      var nama = y[0].namareseller;
                                      var nominal = parseInt(y[0].nominal);
                                      if (nominal < 20000) {
                                        nominal = nominal * 1000;
                                      }
                                      var totalbayar = nominal + jasaloket;
                                      var struk =
                                        "STRUK PEMBELIAN PLN PRABAYAR\n\n" +
                                        "\nNama Outlet :" +
                                        nama +
                                        "\nWaktu       :" +
                                        y[0].waktu +
                                        "\nNo.METER    :" +
                                        y[0].tujuan +
                                        "\nNAMA        :" +
                                        sn.split("/")[1] +
                                        "\nTD          :" +
                                        sn.split("/")[2] +
                                        "/" +
                                        sn.split("/")[3] +
                                        "\nKWH         :" +
                                        sn.split("/")[4] +
                                        //"\nKWH         :" + sn.split("/KWH:")[1].split("/")[0] +
                                        "\nRPTOKEN     :Rp " +
                                        pad(
                                          utilirs.todesimal(rptoken).toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        //"\nRPTOKEN     :Rp " + sn.split("/")[10].split(",00")[0] +
                                        "\nADMBANK     :Rp " +
                                        pad(
                                          utilirs
                                            .todesimal(adminbank)
                                            .toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        //"\nADMBANK     :Rp " + sn.split("/")[7].split(",00")[0] +
                                        "\nPPN         :Rp " +
                                        pad(
                                          utilirs.todesimal(ppn).toString(),
                                          12,
                                          {
                                            lpad: ".",
                                          },
                                        ) +
                                        "\nPPJ         :RP " +
                                        pad(
                                          utilirs.todesimal(ppj).toString(),
                                          12,
                                          {
                                            lpad: ".",
                                          },
                                        ) +
                                        "\nANGSURAN    :Rp " +
                                        pad(
                                          utilirs
                                            .todesimal(angsuran)
                                            .toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        //"\nMATERRAI    :RP " + pad(utilirs.todesimal(materai).toString(), 12, { lpad: "." }) +
                                        "\nNOMINAL     :Rp " +
                                        pad(
                                          utilirs.todesimal(nominal).toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        "\nJASA LOKET  :Rp " +
                                        pad(
                                          utilirs
                                            .todesimal(jasaloket)
                                            .toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        "\nBAYAR       :Rp " +
                                        pad(
                                          utilirs
                                            .todesimal(totalbayar)
                                            .toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        "\n\n        STROOM/TOKEN " +
                                        "\n   " +
                                        sn.split("/")[0] +
                                        //"\n\n        TOKEN SUBSISI " +
                                        "\n\n" +
                                        sn.split("/")[11] +
                                        "\n\nStruk ini merupakan bukti" +
                                        "\npembayaran yang sah" +
                                        "\nLebih lanjut hubungi PLN 123\n" +
                                        "\nTERIMA KASIH\r\n" +
                                        "\n\nLazimPay - https://lazimpay.com\r\n";
                                    } else {
                                      var sn = y[0].sn;
				      if (jasaloket <= 2000){
                                       jasaloket= 3000
                                      }
                                      var nama = y[0].namareseller;
                                      var nominal = parseInt(y[0].nominal);
                                      if (nominal < 20000) {
                                        nominal = nominal * 1000;
                                      }
                                      var totalbayar = nominal + jasaloket;
                                      var struk =
                                        "STRUK PEMBELIAN PLN PRABAYAR\n\n" +
                                        "\nNama Outlet :" +
                                        nama +
                                        "\nWaktu       :" +
                                        y[0].waktu +
                                        "\nNo.METER    :" +
                                        y[0].tujuan +
                                        "\nNAMA        :" +
                                        sn.split("/")[1] +
                                        "\nTD          :" +
                                        sn.split("/")[2] +
                                        "/" +
                                        sn.split("/")[3] +
                                        "\nKWH         :" +
                                        sn.split("/")[4] +
                                        "\n\nNOMINAL     :Rp " +
                                        pad(
                                          utilirs.todesimal(nominal).toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        "\nJASA LOKET  :Rp " +
                                        pad(
                                          utilirs
                                            .todesimal(jasaloket)
                                            .toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        "\n---------------------------- " +
                                        "\nBAYAR       :Rp " +
                                        pad(
                                          utilirs
                                            .todesimal(totalbayar)
                                            .toString(),
                                          12,
                                          { lpad: "." },
                                        ) +
                                        "\n\n        STROOM/TOKEN " +
                                        "\n\n   " +
                                        sn.split("/")[0] +
                                        "\n\nStruk ini merupakan bukti" +
                                        "\npembayaran yang sah" +
                                        "\nLebih lanjut hubungi PLN 123\n" +
                                        "\nTERIMA KASIH\r\n" +
                                        "\n\nLazimPay - https://lazimpay.com\r\n";
                                    }

                                    res.json({
                                      success: true,
                                      source: 1,
                                      kodeproduk: y[0].kodeproduk,
                                      idtrx: y[0].idtransaksi,
                                      idterminal: y[0].idterminal,
                                      sn: y[0].sn,
                                      msg: struk,
                                    });
                                    return;
                                  } else {
                                    // pulsa
                                    var sn = y[0].sn;
                                    var nominal = parseInt(y[0].nominal);
                                    if (nominal < 20000) {
                                      nominal = nominal * 1000;
                                    }

                                    var totalbayar = jasaloket;
                                    var struk =
                                      "STRUK PEMBELIAN\n" +
                                      "\nWaktu       :" +
                                      y[0].waktu +
                                      "\nNo.Trx      :" +
                                      y[0].idtransaksi +
                                      "\nNo.Tujuan   :" +
                                      y[0].tujuan +
                                      "\nProduk      :" +
                                      y[0].namaproduk +
                                      "\n\nSN          :" +
                                      sn +
                                      //"\nJASA LOKET  :" + pad(utilirs.todesimal(jasaloket).toString(), 12, { lpad: "." }) +
                                      "\n\nHarga       :Rp " +
                                      utilirs.todesimal(totalbayar).toString() +
                                      "\n\nSTRUK INI MERUPAKAN BUKTI PEMBAYARAN YANG SAH, HARAP DISIMPAN" +
                                      "\nTERIMA KASIH\r\n";
                                    res.json({
                                      success: true,
                                      source: 1,
                                      kodeproduk: y[0].kodeproduk,
                                      idtrx: y[0].idtransaksi,
                                      idterminal: y[0].idterminal,
                                      sn: y[0].sn,
                                      msg: struk,
                                    });
                                    return;
                                    // res.json({ success: true, source: 1, kodeproduk: y[0].kodeproduk, idtrx: y[0].idtransaksi, idterminal: y[0].idterminal, sn: y[0].sn, msg: y[0].keterangan }); return;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      y = await utilirs.runQuerySelectPromise(
        req,
        "select concat(t.tanggal,' ',t.jam) as waktu,t.namareseller,t.idtransaksi,t.kodeproduk,t.idterminal,t.keterangan,t.sn,t.tujuan,t.nominal, t.statustransaksi, p.namaproduk,p.idoperator from transaksi t left join produk p on t.idproduk=p.idproduk where t.idtransaksi=? and t.jenistransaksi<>5  order by t.idtransaksi desc limit 1",
        [idtrx],
      );
      if (y.length > 0) {
        let status = "";

        if (y[0].statustransaksi == 0) {
          status = "BELUM DIPROSES";
        } else if (y[0].statustransaksi == 2) {
          status = "GAGAL";
        } else {
          status = "PENDING";
        }

        res.json({
          success: true,
          msg:
            "TRANSAKSI " +
            y[0].namaproduk +
            " ke " +
            y[0].tujuan +
            " STATUS:" +
            status +
            " waktu: " +
            y[0].waktu,
        });
      } else {
        res.json({ success: false, msg: "data tidak ditemukan, err" });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "data tidak ditemukan, err" });
  }
};
module.exports = controllerscetak;
