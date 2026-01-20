"use strict";
const TransactionController = {};
const utilirs = require("./utils_v9");
var md5 = require("md5");
const moment = require("moment");
var dateNow = moment().format("YYYYMMDD");

TransactionController.payNow = async (req, res) => {
  var fkodeproduk = req.body.kodeproduk;
  var ftujuan = req.body.tujuan;
  var fidtrx = req.body.idtrx; //TransactionController.idgenerateinbox();
  var fpin = req.body.pin;
  var fjenistrx = parseInt(req.body.jenis);
  var forceTrx = req.body.forcetrx;
  var furl = "app:" + req.body.uuid;
  var fip = req.connection.remoteAddress.split(":")[3];

  if (typeof fip == "undefined") {
    fip = req.connection.remoteAddress;
  }

  var hargabeli = 0;
  var hargajualreseller = 0;

  if (typeof fjenistrx == "undefined") {
    fjenistrx = "0";
  }

  if (typeof forceTrx == "undefined") {
    forceTrx = 0;
  }

  if (fjenistrx == "") {
    fjenistrx = "0";
  }
  if (typeof furl == "undefined") {
    furl = "";
  }
  //res.status(200);
  try {
    fkodeproduk = fkodeproduk;
    let cekBlockIP = await utilirs.runQuerySelectPromise(
      req,
      "select tujuan from blacklist where tujuan=?",
      [fip],
    );
    if (cekBlockIP.length > 0) {
      res.json({
        success: false,
        produk: fkodeproduk,
        tujuan: ftujuan,
        reffid: fidtrx,
        rc: "0015",
        msg: "HP Trx bloked",
      });
      return;
    } else {
      let cekBlockTujuan = await utilirs.runQuerySelectPromise(
        req,
        "select tujuan from blacklist where tujuan=?",
        [ftujuan],
      );
      if (cekBlockTujuan.length > 0) {
        res.json({
          success: false,
          produk: fkodeproduk,
          tujuan: ftujuan,
          reffid: fidtrx,
          rc: "0015",
          msg: "No Tujuan blocked",
        });
        return;
      } else {
        //PIN STANDAR VALIDASI
        /*if (parseInt(fjenistrx) != 5) {
                    let checkpinstandar = await utilirs.runQuerySelectPromise(req, 'select  ijinkanpinstandar from setting');
                    if (parseInt(checkpinstandar[0]) > 0) {

                        res.json({ success: false, produk: fkodeproduk, tujuan: ftujuan, reffid: fidtrx, rc: '0014', msg: 'Mohon Ganti PIN Anda' }); return;
                    } else {
                        if (fpin == '1234' || fpin == '1122' || fpin == '1133' || fpin == '4321' || fpin == '1212') {
                            res.json({ success: false, produk: fkodeproduk, tujuan: ftujuan, reffid: fidtrx, rc: '0014', msg: 'Mohon Ganti PIN Anda' }); return;
                        } else if (fpin.substr(0, 1) == fpin.substr(1, 1)) {
                            res.json({ success: false, produk: fkodeproduk, tujuan: ftujuan, reffid: fidtrx, rc: '0014', msg: 'Mohon Ganti PIN Anda' }); return;
                        } else if (fpin.substr(2, 1) == fpin.substr(3, 1)) {
                            res.json({ success: false, produk: fkodeproduk, tujuan: ftujuan, reffid: fidtrx, rc: '0014', msg: 'Mohon Ganti PIN Anda' }); return;
                        }
                    }
                }*/

        if (parseInt(fjenistrx) != 5) {
          var a = await utilirs.runQuerySelectPromise(
            req,
            "select r.idreseller,r.namareseller,r.saldo,r.patokanhargajual,r.tipe,r.urlreport,r.blokir, r.blokir_attemp, r.tipesaldo,r.limitpiutang,r.blokirtrx,r.idareadomisili,h.aktif as aktifhp,h.jenis as jenishp from masterreseller r left join hptrx h on r.idreseller=h.idreseller where r.aktif=1 and h.hp=aes_encrypt(?,password((select jalurharga from info))) and pin=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4",
            [furl, fpin],
          );
        } else {
          var a = await utilirs.runQuerySelectPromise(
            req,
            "select r.idreseller,r.namareseller,r.saldo,r.patokanhargajual,r.tipe,r.urlreport,r.blokir, r.blokir_attemp, r.tipesaldo,r.limitpiutang,r.blokirtrx,r.idareadomisili,h.aktif as aktifhp,h.jenis as jenishp from masterreseller r left join hptrx h on r.idreseller=h.idreseller where r.aktif=1 and h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4",
            [furl],
          );
        }
        if (a.length > 0) {
          if (parseInt(a[0].aktifhp) == 0) {
            res.json({
              success: false,
              produk: fkodeproduk,
              tujuan: ftujuan,
              reffid: fidtrx,
              rc: "0014",
              msg: "DeviceID tidak aktif",
            });
            return;
          }
          if (parseInt(a[0].jenishp == 1)) {
            res.json({
              success: false,
              produk: fkodeproduk,
              tujuan: ftujuan,
              reffid: fidtrx,
              rc: "0014",
              msg: "DeviceID tidak bisa transaksi financial",
            });
            return;
          }
          var priceplan = a[0].patokanhargajual;
          var fidrs = a[0].idreseller;
          var namareseller = a[0].namareseller;
          var blokir = a[0].blokir;
          var blokirtrx = a[0].blokirtrx;
          var tipesaldo = a[0].tipesaldo;
          var limitsaldo = a[0].limitpiutang;
          var idcluster = a[0].idareadomisili;
          var urlreport;
          if (furl == "") {
            urlreport = a[0].urlreport;
          } else {
            urlreport = furl;
          }

          await utilirs.runQuerySelectPromise(
            req,
            "update masterreseller set blokir_attemp=0 where idreseller=? ",
            [fidrs],
          );

          if (blokir == 1) {
            res.json({
              success: false,
              produk: fkodeproduk,
              tujuan: ftujuan,
              reffid: fidtrx,
              rc: "0015",
              msg: "Akun anda telah diblokir, hubungi CS",
            });
            return;
          }

          if (blokirtrx == 1) {
            res.json({
              success: false,
              produk: fkodeproduk,
              tujuan: ftujuan,
              reffid: fidtrx,
              rc: "0015",
              msg: "Akun anda telah di blokirtransaksi, hubungi CS",
            });
            return;
          }

          let validIP = true;
          if (validIP) {
            let idcenter = utilirs.generateidinbox();
            var pesanmasuk = fkodeproduk + "." + ftujuan + "." + fidtrx;
            let a = await utilirs.runQuerySelectPromise(
              req,
              "insert ignore into inboxcenter value(?,-1,'APP',current_date(),current_time(),?,?,0,?,?)",
              [idcenter, furl, pesanmasuk, fidrs, namareseller],
            );
            let dataProduk = await utilirs.runQuerySelectPromise(
              req,
              "select p.idproduk,o.idoperator,o.flagsekat,p.kodeproduk,p.nominal,p.jenisproduk,o.mindigit,o.maxdigit,p.sekatcluster from produk p,operator o where o.idoperator=p.idoperator and p.kodeproduk=?",
              [fkodeproduk],
            );
            if (dataProduk.length > 0) {
              var idproduk = dataProduk[0].idproduk;
              var jenisproduk = dataProduk[0].jenisproduk;
              var flagsekat = dataProduk[0].flagsekat;
              if (fjenistrx < 5) {
                if (jenisproduk == 3) {
                  res.json({
                    success: false,
                    produk: fkodeproduk,
                    tujuan: ftujuan,
                    reffid: fidtrx,
                    rc: "0020",
                    msg: "Produk Tidak Sesuai",
                  });
                  return;
                }
              }

              var nominal = dataProduk[0].nominal;
              var idoperator = dataProduk[0].idoperator;
              var sekatcluster = parseInt(dataProduk[0].sekatcluster);

              if (
                ftujuan.length >= dataProduk[0].mindigit &&
                ftujuan.length <= dataProduk[0].maxdigit
              ) {
                var dataPriceplan = await utilirs.runQuerySelectPromise(
                  req,
                  "select d.hargajual,d.aktif,k.mlm,d.margin,d.komisi from detailkelompokharga d left join kelompokharga k on d.idkelompokharga=k.idkelompokharga where d.idproduk=? and d.idkelompokharga=?",
                  [idproduk, priceplan],
                );
                if (dataPriceplan.length > 0) {
                  let cekAntrian = await utilirs.runQuerySelectPromise(
                    req,
                    "SELECT statustransaksi as status, SN,tanggal,jam,idtransaksi FROM Transaksipipa WHERE tujuan=? and kodeproduk=? and idreseller=?",
                    [ftujuan, fkodeproduk, fidrs],
                  );
                  if (cekAntrian.length > 0) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      rc: "0027",
                      msg: "Transaksi Sedang Dalam Antrian",
                    });
                    return;
                  }

                  if (fjenistrx != 5) {
                    var cekTransaksi =
                      await TransactionController.cekTransaksiDouble(
                        req,
                        fidrs,
                        fkodeproduk,
                        ftujuan,
                        fidtrx,
                      );
                    if (cekTransaksi.length > 0) {
                      var statustrx = cekTransaksi[0].statustransaksi;
                      if (forceTrx == 0) {
                        if (statustrx == 1) {
                          res.json({
                            success: false,
                            produk: fkodeproduk,
                            tujuan: ftujuan,
                            reffid: fidtrx,
                            rc: "0099",
                            msg:
                              "Transaksi ini sudah pernah Berhasil SN:" +
                              cekTransaksi[0].sn +
                              " pada:" +
                              cekTransaksi[0].waktu +
                              " apakah akan diulang lagi?",
                          });
                          return;
                        } else {
                          res.json({
                            success: false,
                            produk: fkodeproduk,
                            tujuan: ftujuan,
                            reffid: fidtrx,
                            rc: "0099",
                            msg: "Transaksi anda masih dalam proses mohon, apakah akan transaksi lagi?",
                          });
                          return;
                        }
                      }
                    }
                  }

                  var hargajual = dataPriceplan[0].hargajual;
                  var komisiProduk = dataPriceplan[0].komisi;
                  var statusproduk = dataPriceplan[0].aktif;

                  if (hargajual == 0) {
                    if (parseInt(fjenistrx) < 2) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0019",
                        msg: "Harga Produk Belum di Atur",
                      });
                      return;
                    }
                  }

                  var jeniskomisi = 0;
                  if (parseInt(komisiProduk) > 0) {
                    jeniskomisi = 1;
                  }

                  if (sekatcluster == 1) {
                    let clustercek = await utilirs.runQuerySelectPromise(
                      req,
                      "select * from sekatclusterproduk where idproduk=? and idcluster=?",
                      [idproduk, idcluster],
                    );
                    if (clustercek.length == 0) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0019",
                        msg: "anda tidak diijinkan transaksi dengan produk ini",
                      });
                      return;
                    }
                  }

                  if (sekatcluster == 2) {
                    let clustercek = await utilirs.runQuerySelectPromise(
                      req,
                      "select * from sekatclusterproduk where idproduk=? and idcluster?",
                      [idproduk, idcluster],
                    );
                    if (clustercek.length > 0) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0019",
                        msg: "anda tidak diijinkan transaksi dengan produk ini",
                      });
                      return;
                    }
                  }

                  var getHargaRegional = await utilirs.runQuerySelectPromise(
                    req,
                    "select hargaregional from produkregional WHERE idproduk=? and idarea=(select pa.idarea from area a left join prefikarea pa on a.idarea=pa.idarea where left(?,length(pa.prefik))=pa.prefik and a.idoperator=? limit 1)",
                    [idproduk, ftujuan, idoperator],
                  );
                  if (getHargaRegional.length > 0) {
                    hargajual = getHargaRegional[0].hargaregional;
                  }
                  var getHargaCluster = await utilirs.runQuerySelectPromise(
                    req,
                    "select hargacluster from produkcluster WHERE idproduk=?  and idareadomisili=(select idareadomisili from masterreseller where idreseller=?)",
                    [idproduk, fidrs],
                  );
                  if (getHargaCluster.length > 0) {
                    hargajual = getHargaCluster[0].hargacluster;
                  }
                  var getHargaKhusus = await utilirs.runQuerySelectPromise(
                    req,
                    "select hargajual from produkreseller WHERE idproduk=? and idreseller=?",
                    [idproduk, fidrs],
                  );
                  if (getHargaKhusus.length > 0) {
                    hargajual = getHargaKhusus[0].hargajual;
                  }

                  let produkPromo = await utilirs.runQuerySelectPromise(
                    req,
                    "select starttime,endtime,harga from promoproduk where idkelompokharga=? and idproduk=?",
                    [priceplan, idproduk],
                  );
                  if (produkPromo.length > 0) {
                    let starttime = moment(new Date(produkPromo[0].starttime));
                    let endtime = moment(new Date(produkPromo[0].endtime));
                    if (moment(new Date()).isBetween(starttime, endtime)) {
                      hargajual = produkPromo[0].harga;
                    }
                  }

                  var tambahan = 0;
                  var getUppline = await TransactionController.getUppline(
                    req,
                    fidrs,
                  );
                  if (getUppline.length > 0) {
                    if (getUppline[0].idupline != "-") {
                      var paramupline = fidrs;
                      var tmpParamupline = "";
                      var exit = false;
                      while (exit == false) {
                        var cekUppline = await TransactionController.getUppline(
                          req,
                          paramupline,
                        );
                        if (cekUppline.length > 0) {
                          if (cekUppline[0].idupline == "-") {
                            exit = true;
                            tambahan += parseInt(cekUppline[0].TambahanHarga);
                          } else {
                            tmpParamupline = paramupline;
                            paramupline = cekUppline[0].idupline;
                            var hargaMarkup =
                              await TransactionController.getHargaMarkup(
                                req,
                                tmpParamupline,
                                idproduk,
                              );
                            if (hargaMarkup.length > 0) {
                              tambahan += parseInt(hargaMarkup[0].markup);
                            } else {
                              var getUppline =
                                await TransactionController.getUppline(
                                  req,
                                  tmpParamupline,
                                );
                              tambahan += parseInt(cekUppline[0].TambahanHarga);
                            }
                          }
                        } else {
                          tmpParamupline = paramupline;
                          paramupline = cekUppline[0].idupline;
                          var hargaMarkup =
                            await TransactionController.getHargaMarkup(
                              req,
                              tmpParamupline,
                              idproduk,
                            );
                          if (hargaMarkup.length > 0) {
                            tambahan += parseInt(hargaMarkup[0].markup);
                          } else {
                            var getUppline =
                              await TransactionController.getUppline(
                                req,
                                tmpParamupline,
                              );
                            tambahan += parseInt(cekUppline[0].TambahanHarga);
                          }
                        }
                      }
                    }
                  }
                  hargajualreseller = hargajual + tambahan;

                  // TODO: getSelisihhargaUpline

                  switch (parseInt(fjenistrx)) {
                    case 5:
                      // INQUIRY
                      hargabeli = 0;
                      hargajual = 0;
                      hargajualreseller = 0;
                      namareseller = namareseller + " (INQ)";

                      if (jenisproduk != 3) {
                        res.json({
                          success: false,
                          produk: fkodeproduk,
                          tujuan: ftujuan,
                          reffid: fidtrx,
                          rc: "0021",
                          msg: "Bukan Produk Bill Payment",
                        });
                        return;
                      }

                      break;
                    case 6:
                      //payment
                      namareseller = namareseller + " (PAY)";
                      //  console.log(req.body);
                      // console.log(ftujuan, idproduk);
                      let dataTagihan = await utilirs.runQuerySelectPromise(
                        req,
                        "select jumlahtagihan,charge,jmltag from tagihanppob where idpelanggan=? and tanggal=current_date() and idproduk = ? order by idtagihan desc limit 1",
                        [ftujuan, idproduk],
                      );
                      // console.log(dataTagihan);
                      if (dataTagihan.length > 0) {
                        var fee = dataTagihan[0].jmltag * hargajual;
                        hargajual = dataTagihan[0].jumlahtagihan - fee;
                        hargajualreseller = hargajual;
                        hargabeli = dataTagihan[0].charge;

                        var tambahan1 = 0;
                        var getUppline = await TransactionController.getUppline(
                          req,
                          fidrs,
                        );
                        if (getUppline.length > 0) {
                          if (getUppline[0].idupline != "-") {
                            var paramupline1 = fidrs;
                            var tmpParamupline1 = "";
                            var exit1 = false;
                            while (exit1 == false) {
                              var cekUppline =
                                await TransactionController.getUppline(
                                  req,
                                  paramupline1,
                                );
                              if (cekUppline[0].idupline == "-") {
                                exit1 = true;
                                tambahan1 += parseInt(
                                  cekUppline[0].TambahanHarga,
                                );
                              } else {
                                tmpParamupline1 = paramupline1;
                                paramupline1 = cekUppline[0].idupline;
                                var hargaMarkup =
                                  await TransactionController.getHargaMarkup(
                                    req,
                                    tmpParamupline1,
                                    idproduk,
                                  );
                                if (hargaMarkup.length > 0) {
                                  tambahan1 += parseInt(hargaMarkup[0].markup);
                                } else {
                                  var getUppline =
                                    await TransactionController.getUppline(
                                      req,
                                      tmpParamupline1,
                                    );
                                  tambahan1 += parseInt(
                                    cekUppline[0].TambahanHarga,
                                  );
                                }
                              }
                            }
                          }
                        }

                        hargajualreseller = hargajualreseller + tambahan1;
                      } else {
                        res.json({
                          success: false,
                          produk: fkodeproduk,
                          tujuan: ftujuan,
                          reffid: fidtrx,
                          rc: "0021",
                          msg: "Silahkan Cek Tagihan Terlebih Dahulu",
                        });
                        return;
                      }
                      break;
                    default:
                      // pulsa
                      hargabeli = 0;
                      break;
                  }

                  if (parseInt(flagsekat) == 0) {
                    let aa = await utilirs.runQuerySelectPromise(
                      req,
                      "SELECT pr.Prefik FROM produk p,Prefik pr WHERE Pr.IdOperator = p.IdOperator AND p.IdProduk =? AND MID(?, 1, LENGTH(pr.Prefik)) = pr.Prefik",
                      [idproduk, ftujuan],
                    );
                    if (aa.length == 0) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0024",
                        msg: "Produk Dan Nomor Tujuan Tidak Sesuai",
                      });
                      return;
                    }
                  }

                  if (parseInt(flagsekat) == 1) {
                    let aa = await utilirs.runQuerySelectPromise(
                      req,
                      "SELECT pa.Prefik FROM prefikarea pa,area a WHERE pa.IdArea=a.IdArea AND a.IdOperator=? AND MID(?,1,LENGTH(pa.Prefik))=pa.Prefik",
                      [idoperator, ftujuan],
                    );
                    if (aa.length == 0) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0025",
                        msg: "Produk Dan Nomor Tujuan Tidak Sesuai",
                      });
                      return;
                    }
                  }

                  if (parseInt(flagsekat) == 2) {
                    let aa = await utilirs.runQuerySelectPromise(
                      req,
                      "SELECT pa.Prefik FROM PrefikArea pa, Area a WHERE pa.IdArea=a.IdArea AND a.IdOperator=? AND MID(?,1,LENGTH(pa.Prefik))=pa.Prefik",
                      [idoperator, ftujuan],
                    );
                    if (aa.length > 0) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0026",
                        msg: "Produk Dan Nomor Tujuan Tidak Sesuai",
                      });
                      return;
                    }
                  }

                  if (await utilirs.iscutoffProduk(req, idproduk)) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0070",
                      msg: "Produk Cut Off",
                    });
                    return;
                  }

                  if (await utilirs.iscutoffSystem(req)) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0071",
                      msg: "System Cut Off",
                    });
                    return;
                  }

                  if (await utilirs.isprodukGangguan(req, idproduk)) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0072",
                      msg: "Produk Gangguan",
                    });
                    return;
                  }
                  if (await utilirs.isstokkosong(req, idproduk)) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0073",
                      msg: "Produk Kosong",
                    });
                    return;
                  }
                  if (
                    (await utilirs.isprodukpriceplanAktif(
                      req,
                      idproduk,
                      priceplan,
                    )) == false
                  ) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0074",
                      msg: "Produk PricePlan Non Aktif",
                    });
                    return;
                  }
                  if (
                    (await utilirs.cekAdaQuota(req, idproduk, fidrs)) == false
                  ) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0075",
                      msg: "Quota Anda Habis",
                    });
                    return;
                  }
                  if ((await utilirs.cekmaxpendingmitra(req, fidrs)) == false) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0076",
                      msg: "Pending Melampaui Batas Maximum",
                    });
                    return;
                  }
                  if (await utilirs.isblokirproduk(req, idproduk, fidrs)) {
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      rc: "0077",
                      msg: "Produk di Blokir",
                    });
                    return;
                  }
                  let amoment = moment();
                  let tglTrx = amoment.format("YYYY/MM/DD");
                  let jamTrx = amoment.format("HH:mm:ss");

                  let jumunit = 1;

                  //console.log(fjenistrx);
                  if (parseInt(jenisproduk) == 2) {
                    fjenistrx = 2;
                  }
                  if (parseInt(jenisproduk) == 1) {
                    // trx voucher fisik;
                    fjenistrx = 9;
                    if (
                      (await utilirs.CekStokFisik(req, fkodeproduk)) == false
                    ) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0073",
                        msg: "Voucher Fisik Kosong",
                      });
                      return;
                    }
                  }

                  if (parseInt(fjenistrx) == 2) {
                    if (
                      await utilirs.is_stok_tidak_cukup_h2h(
                        req,
                        idproduk,
                        fidrs,
                      )
                    ) {
                      res.json({
                        success: false,
                        produk: fkodeproduk,
                        tujuan: ftujuan,
                        reffid: fidtrx,
                        rc: "0061",
                        msg: "Stok Tidak Cukup",
                      });
                      return;
                    }
                  } else {
                    if (tipesaldo == 0) {
                      if (
                        await utilirs.is_saldo_tidak_cukup_h2h(
                          req,
                          hargajualreseller,
                          fidrs,
                        )
                      ) {
                        res.json({
                          success: false,
                          produk: fkodeproduk,
                          tujuan: ftujuan,
                          reffid: fidtrx,
                          rc: "0061",
                          msg: "Saldo Anda Tidak Cukup",
                        });
                        return;
                      }
                    } else {
                      let saldo = await utilirs.ambilSaldo(
                        req,
                        fjenistrx,
                        idproduk,
                        fidrs,
                      );
                      let quota = saldo + limitsaldo;
                      if (quota < hargajualreseller) {
                        res.json({
                          success: false,
                          produk: fkodeproduk,
                          tujuan: ftujuan,
                          reffid: fidtrx,
                          rc: "0061",
                          msg: "Limit Kuota Anda Tidak Cukup",
                        });
                        return;
                      }
                    }
                  }

                  let hash = md5(
                    md5(
                      "irs8" +
                        fidrs +
                        amoment.format("YYYYMMDDHmmss") +
                        ftujuan.toString() +
                        hargajualreseller.toString() +
                        fjenistrx.toString() +
                        priceplan.toString() +
                        "1" +
                        "jos",
                    ),
                  );

                  let insertTrx = await utilirs.runQuerySelectPromise(
                    req,
                    "insert into transaksipipa (hashing, patokanhargajual, jeniskomisi, jumlahunit, jenistransaksi, idterminal, nopengirim, tanggal, jam, idproduk, kodeproduk, nominal, statustransaksi, idreseller, namareseller, tujuan, idtransaksiclient, kodeinboxcenter, hargabeli, hargajual, hargajualreseller)  values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ",
                    [
                      hash,
                      priceplan,
                      jeniskomisi,
                      jumunit,
                      fjenistrx,
                      -1,
                      urlreport,
                      tglTrx,
                      jamTrx,
                      idproduk,
                      fkodeproduk,
                      nominal,
                      "0",
                      fidrs,
                      namareseller,
                      ftujuan,
                      fidtrx,
                      idcenter,
                      hargabeli,
                      hargajual,
                      hargajualreseller,
                    ],
                  );

                  //PLN NO HP
                  if (typeof req.body.tujuan2 != "undefined") {
                    let insertTokenPPOB = await utilirs.runQuerySelectPromise(
                      req,
                      "INSERT INTO `tokenppob` (`NOHP`, `NOMORMETER`, `KODEPRODUK`, `TANGGAL`) VALUES (?, ?, ?, DATE(NOW()))",
                      [req.body.tujuan2, ftujuan, fkodeproduk],
                    );
                  }

                  if (parseInt(jenisproduk) == 3 || req.body.wait == 1) {
                    var start_date = new Date();
                    var ketemu = false;
                    while (ketemu == false && new Date() - start_date < 30000) {
                      let cekSender = await utilirs.runQuerySelectPromise(
                        req,
                        "SELECT idsender,isi,statustrx FROM sender WHERE IdReseller=? AND Idtransaksiclient=? and tanggal=current_date() order by idsender desc limit 1",
                        [fidrs, fidtrx],
                      );
                      if (cekSender.length > 0) {
                        var ketemu = true;
                        let cekPendingan = await utilirs.runQuerySelectPromise(
                          req,
                          "SELECT statustransaksi as status, sn,tanggal,jam FROM transaksi WHERE tanggal=current_date() and IdReseller=? AND Idtransaksiclient=? LIMIT 1",
                          [fidrs, fidtrx],
                        );
                        var sn = cekPendingan[0].sn;
                        var statustrx = cekPendingan[0].status;
                        var waktutrx =
                          cekPendingan[0].tanggal + " " + cekPendingan[0].jam;
                        var msgx = cekSender[0].isi;
                        if (cekSender[0].statustrx == 1) {
                          res.json({
                            success: true,
                            produk: fkodeproduk,
                            tujuan: ftujuan,
                            nominal: nominal,
                            harga: hargajualreseller,
                            reffid: fidtrx,
                            rc: "1",
                            status: 1,
                            sn: sn,
                            msg: msgx.trim(),
                          });
                          return;
                        } else {
                          res.json({
                            success: false,
                            produk: fkodeproduk,
                            tujuan: ftujuan,
                            nominal: nominal,
                            harga: hargajualreseller,
                            reffid: fidtrx,
                            rc: "2",
                            status: cekSender[0].statustrx,
                            sn: sn,
                            msg: msgx.trim(),
                          });
                          return;
                        }
                      }
                      await utilirs.sleep(500);
                    }
                    res.json({
                      success: false,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      harga: hargajualreseller,
                      reffid: fidtrx,
                      rc: "0068",
                      msg: "Under proses",
                    });
                    return;
                  } else {
                    let saldo = await utilirs.ambilSaldo(
                      req,
                      fjenistrx,
                      idproduk,
                      fidrs,
                    );
                    if (parseInt(fjenistrx) == 2) {
                      saldo = saldo - 1;
                    } else {
                      saldo = saldo - hargajualreseller;
                    }
                    res.json({
                      success: true,
                      produk: fkodeproduk,
                      tujuan: ftujuan,
                      reffid: fidtrx,
                      harga: hargajualreseller,
                      rc: "0068",
                      harga: hargajualreseller,
                      msg:
                        "Trx " +
                        fkodeproduk +
                        " " +
                        ftujuan +
                        " Transaksi Sedang Dalam Proses",
                      saldo: utilirs.todesimal(saldo),
                    });
                    return;
                  }
                } else {
                  res.json({
                    success: false,
                    produk: fkodeproduk,
                    tujuan: ftujuan,
                    reffid: fidtrx,
                    rc: "0019",
                    msg: "Produk Tidak Tersedia",
                  });
                }
              } else {
                res.json({
                  success: false,
                  produk: fkodeproduk,
                  tujuan: ftujuan,
                  reffid: fidtrx,
                  rc: "0018",
                  msg: "Panjang Nomor Tujuan Tidak Sesuai",
                });
              }
            } else {
              res.json({
                success: false,
                produk: fkodeproduk,
                tujuan: ftujuan,
                reffid: fidtrx,
                rc: "0018",
                msg: "Invalid Kode Produk",
              });
            }
          } else {
            res.json({
              success: false,
              produk: fkodeproduk,
              tujuan: ftujuan,
              reffid: fidtrx,
              rc: "0017",
              msg: "Invalid IP Address",
              ip: fip,
            });
          }
        } else {
          // TODO
          if (process.env.BLOK_SALAH_PIN == 1) {
            await utilirs.runQuerySelectPromise(
              "update masterreseller r left join hptrx h on r.idreseller=h.idreseller set r.blokir_attemp=r. blokir_attemp+1 where h.hp=aes_encrypt(?,password((select jalurharga from info)))",
              [furl],
            );
            var ars = await utilirs.runQuerySelectPromise(
              req,
              "select r.idreseller,r.namareseller,r.saldo,r.patokanhargajual,r.tipe,r.urlreport,r.blokir, r.blokir_attemp, r.tipesaldo,r.limitpiutang,r.blokirtrx,r.idareadomisili,h.aktif as aktifhp,h.jenis as jenishp from masterreseller r left join hptrx h on r.idreseller=h.idreseller where r.aktif=1 and h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4",
              [furl],
            );
            if (ars.length > 0) {
              if (ars[0].blokir_attemp >= 3) {
                await utilirs.runQuerySelectPromise(
                  "update masterreseller r left join hptrx h on r.idreseller=h.idreseller set r.blokir=1 where h.hp=aes_encrypt(?,password((select jalurharga from info)))",
                  [furl],
                );
              }
            }
          }
          res.json({
            success: false,
            produk: fkodeproduk,
            tujuan: ftujuan,
            reffid: fidtrx,
            rc: "0014",
            msg: "PIN yang Anda Masukkan Salah",
          });
          return;
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, "msg:": error });
  }
};

TransactionController.getUppline = async (req, idrs) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select idupline,TambahanHargapribadi as TambahanHarga from masterreseller where idreseller=?",
    [idrs],
  );
  if (rows.length) {
    return rows;
  } else {
    return false;
  }
};

TransactionController.getHargaMarkup = async (req, upline, id_produk) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select markup from markupperproduk where idreseller=? and idproduk=?",
    [upline, id_produk],
  );
  if (rows.length) {
    return rows;
  } else {
    return false;
  }
};

TransactionController.cekTransaksi = async (req, idrs, id_produk, tujuan) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select idtransaksi,JamTerima as jam,TanggalTerima as tanggal from transaksi where idreseller=? and idproduk=? and tujuan=? and TanggalTerima=current_date()",
    [idrs, id_produk, tujuan],
  );
  if (rows.length) {
    return rows;
  } else {
    return false;
  }
};

TransactionController.cekTransaksiDouble = async (
  req,
  idrs,
  kodeproduk,
  tujuan,
  fidtrx,
) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select statustransaksi from transaksi where  statustransaksi<>2 and tujuan=? and kodeproduk=? and idreseller=? and idtransaksiclient=?",
    [tujuan, kodeproduk, idrs, fidtrx],
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return false;
  }
};

TransactionController.cekTransaksiDoubleByTujuan = async (
  req,
  idrs,
  kodeproduk,
  tujuan,
  fidtrx,
) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select statustransaksi,sn,concat(tanggal,' ',jam) as waktu from transaksi where tanggal=current_date() and jenistransaksi<>5 and statustransaksi<>2 and tujuan=? and kodeproduk=? and idreseller=? order by idtransaksi desc limit 1",
    [tujuan, kodeproduk, idrs],
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return false;
  }
};

TransactionController.idgenerateinbox = () => {
  var rand = Math.floor(Math.random() * (99999 - 1 + 1)) + 1;
  var data = "000000" + rand;
  var dtrand = data.substr(-5);

  return moment().format("mdhis") + dtrand;
};

TransactionController.cetakstruk = async (req, res) => {
  var header = req.headers["irsauth"];
  if (header == md5(md5(md5(process.env.APP_SECRET + req.body.uuid)))) {
    var uuid = "app:" + req.body.uuid;
    var tgl = req.body.tgl;
    var tujuan = req.body.tujuan;

    var rows = await utilirs.runQuerySelectPromise(
      req,
      "SELECT r.saldo, r.namareseller, r.idreseller FROM MasterReseller r left join hptrx h on r.idreseller=h.idreseller WHERE r.Aktif='1' AND h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4",
      [uuid],
    );
    if (rows.length > 0) {
      var idrs = rows[0].idreseller;
      var rows2 = await utilirs.runQuerySelectPromise(
        req,
        "SELECT jenistransaksi, concat(tanggal,' ',jam) as waktu, concat(kodeproduk,' ke ',tujuan) as kodetujuan, sn, nominal, hargajual FROM transaksi WHERE jenistransaksi<>5 and tanggal=? and tujuan=? and idreseller=? and statustransaksi = 1  ORDER BY waktu  desc",
        [tgl, tujuan, idrs],
      );
      if (rows2.length > 0) {
        let waktu = moment(rows2[0].waktu, "YYYY-MM-DD HH:mm:ss");
        if (rows2[0].jenistransaksi == "6") {
          var harga = rows2[0].hargajual;
        } else {
          var harga = rows2[0].nominal + "" + process.env.APP_CETAKSTRUK;
        }
        var transaksi = {
          waktu: waktu,
          kodetujuan: rows2[0].kodetujuan,
          sn: rows2[0].sn,
          harga: harga,
        };
        res.json({
          success: true,
          rc: "00",
          data: transaksi,
          msg: "Daftar transaksi",
          jenis: "elektrik",
        });
      } else {
        var rows2 = await utilirs.runQuerySelectPromise(
          req,
          "SELECT jenistransaksi, concat(tanggal,' ',jam) as waktu, concat(kodeproduk,' ke ',tujuan) as kodetujuan, sn, nominal, hargajual FROM transaksi_his WHERE jenistransaksi<>5 and tanggal=? and tujuan=? and idreseller=? and statustransaksi = 1  ORDER BY waktu  desc",
          [tgl, tujuan, idrs],
        );
        if (rows2.length > 0) {
          let waktu = moment(rows2[0].waktu, "YYYY-MM-DD HH:mm:ss");
          if (rows2[0].jenistransaksi == "6") {
            var harga = rows2[0].hargajual;
          } else {
            var harga = rows2[0].nominal + "" + process.env.APP_CETAKSTRUK;
          }
          var transaksi = {
            waktu: waktu,
            kodetujuan: rows2[0].kodetujuan,
            sn: rows2[0].sn,
            harga: harga,
          };
          res.json({
            success: true,
            rc: "00",
            data: transaksi,
            msg: "Daftar transaksi",
            jenis: "elektrik",
          });
        } else {
          res.json({
            success: false,
            rc: "13",
            msg: "Daftar transaksi tidak ditemukan",
          });
        }
      }
    } else {
      res.json({
        success: true,
        rc: "00",
        data: [],
        msg: "Daftar transaksi kosong",
      });
    }
  } else {
    res.json({
      success: false,
      msg: "Not Authorize",
      rc: "99",
    });
  }
};

module.exports = TransactionController;
