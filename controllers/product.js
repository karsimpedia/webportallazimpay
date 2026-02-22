"use strict";
const ProductControllers = {};

var utilirs = require("./utils_v9");

const api = require("../lib/serverUtamaClient");
const moment = require("moment");

ProductControllers.getoperator = async (req, res) => {
  const uuid = "app:" + req.body.uuid;
  const idoperator = req.body.idoperator; // "TSEL,ISAT"

  try {
    const request = await api.get("/reseller/getoperator", {
      params: {
        sender: uuid,
        idoperator: idoperator,
      },
    });
    // console.log(request.data);
    // =================================================
    // Legacy wrapper (SAMA PERSIS)
    // =================================================

    // const data = request.data;
    // const newData = data.map((item) => ({
    //   ...item,
    //   nominal: item.nominal / 1000,
    // }));

    // console.log(newData);

    return res.json({
      success: true,
      data: request.data,
    });
  } catch (error) {
    console.error(error?.response?.data || error.message);

    return res.json({
      success: false,
      msg: error?.response?.data?.msg || "terjadi kesalahan server",
    });
  }
};

ProductControllers.getOperatorByTujuan = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var tujuan = req.body.tujuan;
  console.log(req.body);
  try {
    let request = await api.get("/reseller/getoperatorbytujuan", {
      params: {
        sender: uuid,
        msisdn: tujuan,
      },
    });

    return res.json({ success: true, data: request.data });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    return res.json({
      success: false,
      msg: error?.response?.data?.msg || "Terjadi kesalahan server",
    });
  }
};

ProductControllers.getOperatorFIlterByTujuan = async (req, res) => {
  const uuid = "app:" + req.body.uuid;
  const tujuan = req.body.tujuan || "";
  const idoperator = req.body.idoperator || "";

  try {
    const request = await api.get("/reseller/getoperatorfilterbytujuan", {
      params: {
        sender: uuid,
        msisdn: tujuan,
        idoperator: idoperator,
      },
    });

    // =================================================
    // Legacy response wrapper (PENTING)
    // =================================================

    return res.json({
      success: true,
      data: request.data,
    });
  } catch (error) {
    console.error(error?.response?.data || error.message);

    return res.json({
      success: false,
      msg: error?.response?.data?.msg || "Terjadi kesalahan server",
    });
  }
};

ProductControllers.getProductDataByTujuan = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var tujuan = req.body.tujuan;
  var iddata = "79,10";
  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var idpriceplan = cekdata[0].patokanhargajual;
    var produk = [];
    let dataopr = await utilirs.runQuerySelectPromise(
      req,
      "SELECT pr.prefik,pr.idoperator,o.namaoperator,o.imgurl FROM prefik pr left join operator o on pr.idoperator=o.idoperator WHERE  MID(?,1,LENGTH(pr.prefik))=pr.prefik and length(prefik)>=2 and pr.idoperator in(?)",
      [tujuan, iddata],
    );
    if (dataopr.length > 0) {
      for (var i = 0; i < dataopr.length; i++) {
        //let dataproduk = await utilirs.runQuerySelectPromise(req, "idproduk,kodeproduk,namaproduk,idoperator,jenisproduk,IFNULL(keterangan,'-') as keterangan,poin,imgurl from produk where idoperator=?", [dataopr[0].idoperator]);
        var dataproduk = await utilirs.runQuerySelectPromise(
          req,
          "select k.hargajual,k.komisi,p.kodeproduk,p.namaproduk,o.namaoperator,p.imgurl,IFNULL(p.keterangan,'-') as keterangan,p.nominal from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where k.idkelompokharga=? and p.idoperator=? order by k.hargajual asc",
          [idpriceplan, dataopr[i].idoperator],
        );
        if (dataproduk.length > 0) {
          let a = {
            idoperator: dataopr[i].idoperator,
            produk: dataproduk,
          };
          produk.push(a);
        }
      }
      res.json({ succes: true, data: produk });
    } else {
      res.json({ succes: false, data: [] });
    }
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

ProductControllers.getProductByTujuan = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var tujuan = req.body.tujuan;

  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var idpriceplan = cekdata[0].patokanhargajual;
    var idrs = cekdata[0].idreseller;
    var produk = [];
    let dataopr = await utilirs.runQuerySelectPromise(
      req,
      "SELECT pr.prefik,pr.idoperator,o.namaoperator,o.imgurl FROM prefik pr left join operator o on pr.idoperator=o.idoperator WHERE  MID(?,1,LENGTH(pr.prefik))=pr.prefik and length(pr.prefik)>=2",
      [tujuan],
    );
    if (dataopr.length > 0) {
      for (var i = 0; i < dataopr.length; i++) {
        //let dataproduk = await utilirs.runQuerySelectPromise(req, "idproduk,kodeproduk,namaproduk,idoperator,jenisproduk,IFNULL(keterangan,'-') as keterangan,poin,imgurl from produk where idoperator=?", [dataopr[0].idoperator]);
        var dataproduk = await utilirs.runQuerySelectPromise(
          req,
          "select k.hargajual,k.komisi,p.poin,p.kodeproduk,p.idproduk,p.namaproduk,o.namaoperator,p.imgurl,IFNULL(p.keterangan,'-') as keterangan,p.nominal from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where k.idkelompokharga=? and p.idoperator=? order by k.hargajual asc",
          [idpriceplan, dataopr[i].idoperator],
        );
        if (dataproduk.length > 0) {
          for (let index = 0; index < dataproduk.length; index++) {
            var priceCluster = await ProductControllers.getPriceCluster(
              req,
              dataproduk[index].idproduk,
              idrs,
            );
            if (priceCluster != false) {
              dataproduk[i].hargajual = priceCluster[0].hargacluster;
            } else {
              var priceReseller = await ProductControllers.getPriceReseller(
                req,
                dataproduk[index].idproduk,
                idrs,
              );
              if (priceReseller != false) {
                dataproduk[i].hargajual = priceReseller[0].hargajual;
              }
            }

            let produkPromo = await utilirs.runQuerySelectPromise(
              req,
              "select starttime,endtime,harga from promoproduk where idkelompokharga=? and idproduk=?",
              [idpriceplan, dataproduk[index].idproduk],
            );
            if (produkPromo.length > 0) {
              let starttime = moment(new Date(produkPromo[0].starttime));
              let endtime = moment(new Date(produkPromo[0].endtime));
              if (moment(new Date()).isBetween(starttime, endtime)) {
                dataproduk[index].hargalama = dataproduk[index].hargajual;
                dataproduk[index].hargajual = produkPromo[0].harga;
                dataproduk[index].ispromo = true;
              } else {
                dataproduk[index].ispromo = false;
              }
            } else {
              dataproduk[index].ispromo = false;
            }
          }
          // cekProdukPromo
          let a = {
            idoperator: dataopr[i].idoperator,
            namaoperator: dataopr[i].namaoperator,
            imgurl: dataopr[i].imgurl,
            produk: dataproduk,
          };
          produk.push(a);
        }
      }
      res.json({ succes: true, data: produk });
    } else {
      res.json({ succes: false, data: [] });
    }
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

ProductControllers.getProductByOperatorPPOB = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var idoperator = req.body.idoperator;

  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var idpriceplan = cekdata[0].patokanhargajual;
    var idrs = cekdata[0].idreseller;

    var products = [];
    var dataProduk = await utilirs.runQuerySelectPromise(
      req,
      "select p.idproduk,k.hargajual,k.komisi,p.kodeproduk,p.namaproduk,o.namaoperator,o.imgurl as imgurloperator,p.poin,p.imgurl,p.keterangan,p.nominal,p.isgangguan,p.isstokkosong from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where k.idkelompokharga=? and p.idoperator=? order by k.hargajual,p.nominal asc",
      [idpriceplan, idoperator],
    );
    if (dataProduk.length > 0) {
      for (var i = 0; i < dataProduk.length; i++) {
        var tambahan = 0;
        var getUppline = await utilirs.getUpline(req, idrs);
        if (getUppline.length > 0) {
          if (getUppline[0].idupline != "-") {
            var paramupline = idrs;
            var tmpParamupline = "";
            var exit = false;
            while (exit == false) {
              var cekUppline = await utilirs.getUpline(req, paramupline);
              if (cekUppline[0].idupline == "-") {
                exit = true;
                tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
              } else {
                tmpParamupline = paramupline;
                paramupline = cekUppline[0].idupline;
                var hargaMarkup = await utilirs.getHargaMarkup(
                  req,
                  tmpParamupline,
                  dataProduk[i].idproduk,
                );
                if (hargaMarkup.length > 0) {
                  tambahan += parseInt(hargaMarkup[0].markup);
                } else {
                  var getUppline = await utilirs.getUpline(req, tmpParamupline);
                  tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
                }
              }
            }
          } else {
            tambahan += parseInt(getUppline[0].tambahanhargapribadi);
          }
        }

        let a = {
          hargajual: dataProduk[i].hargajual + tambahan,
          komisi: dataProduk[i].komisi,
          kodeproduk: dataProduk[i].kodeproduk,
          namaproduk: dataProduk[i].namaproduk,
          namaoperator: dataProduk[i].namaoperator,
          imgurl: dataProduk[i].imgurl,
          keterangan: dataProduk[i].keterangan,
          jenisproduk: dataProduk[i].jenisproduk,
          nominal: dataProduk[i].nominal,
          gangguan: dataProduk[i].isgangguan,
          stokkosong: dataProduk[i].isstokkosong,
          nominal: dataProduk[i].nominal,
          imgurloperator: dataProduk[i].imgurloperator,
        };
        products.push(a);
      }
    }
    res.json({ succes: true, data: products });
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

// controllers/ProductControllers.js
ProductControllers.getProductByOperator = async (req, res) => {
  const uuid = "app:" + req.body.uuid;
  const idoperator = req.body.idoperator;

  try {
    const request = await api.get("/reseller/product-by-operator", {
      params: {
        sender: uuid,
        idoperator: idoperator,
      },
    });

    // =================================================
    // Legacy response (WAJIB SAMA)
    // =================================================
    const data = request.data;

    const newData = data.map((item) => ({
      ...item,
      nominal: item.nominal / 1000,
    }));

    return res.json({
      success: true,
      data: newData,
    });
  } catch (error) {
    console.error(error?.response?.data || error.message);

    return res.json({
      success: false,
      msg: error?.response?.data?.msg || "Terjadi kesalahan server",
    });
  }
};

ProductControllers.produktoken = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var idoperator = req.body.idoperator;
  try {
    var cekdata = await utilirs.runQuerySelectPromise(
      req,
      "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
      uuid,
    );
    if (cekdata.length > 0) {
      var idpriceplan = cekdata[0].patokanhargajual;
      var idrs = cekdata[0].idreseller;
      var products = [];
      var dataProduk = await utilirs.runQuerySelectPromise(
        req,
        "select p.idproduk,k.hargajual as harga,k.komisi,p.kodeproduk,p.idproduk,p.namaproduk,o.namaoperator,o.imgurl as image,p.poin,p.imgurl,p.keterangan,p.nominal,p.isgangguan,p.isstokkosong from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where p.jenisproduk=0 and k.idkelompokharga=? and p.idoperator=? order by k.hargajual asc",
        [idpriceplan, process.env.APP_PLN],
      );
      if (dataProduk.length > 0) {
        for (var i = 0; i < dataProduk.length; i++) {
          var tambahan = 0;
          var getUppline = await utilirs.getUpline(req, idrs);
          if (getUppline.length > 0) {
            if (getUppline[0].idupline != "-") {
              var paramupline = idrs;
              var tmpParamupline = "";
              var exit = false;
              while (exit == false) {
                var cekUppline = await utilirs.getUpline(req, paramupline);
                if (cekUppline.length > 0) {
                  if (cekUppline[0].idupline == "-") {
                    exit = true;
                    tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
                  } else {
                    tmpParamupline = paramupline;
                    paramupline = cekUppline[0].idupline;
                    var hargaMarkup = await utilirs.getHargaMarkup(
                      req,
                      tmpParamupline,
                      dataProduk[i].idproduk,
                    );
                    if (hargaMarkup.length > 0) {
                      tambahan += parseInt(hargaMarkup[0].markup);
                    } else {
                      var getUppline = await utilirs.getUpline(
                        req,
                        tmpParamupline,
                      );
                      tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
                    }
                  }
                } else {
                  tmpParamupline = paramupline;
                  paramupline = cekUppline[0].idupline;
                  var hargaMarkup = await utilirs.getHargaMarkup(
                    req,
                    tmpParamupline,
                    dataProduk[i].idproduk,
                  );
                  if (hargaMarkup.length > 0) {
                    tambahan += parseInt(hargaMarkup[0].markup);
                  } else {
                    var getUppline = await utilirs.getUpline(
                      req,
                      tmpParamupline,
                    );
                    tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
                  }
                }
              }
            } else {
              tambahan += parseInt(getUppline[0].tambahanhargapribadi);
            }
          }

          var priceCluster = await ProductControllers.getPriceCluster(
            req,
            dataProduk[i].idproduk,
            idrs,
          );
          if (priceCluster != false) {
            dataProduk[i].hargajual = priceCluster[0].hargacluster;
          } else {
            var priceReseller = await ProductControllers.getPriceReseller(
              req,
              dataProduk[i].idproduk,
              idrs,
            );
            if (priceReseller != false) {
              dataProduk[i].hargajual = priceReseller[0].hargajual;
            }
          }

          dataProduk[i].hargalama = dataProduk[i].harga;
          dataProduk[i].ispromo = false;
          let produkPromo = await utilirs.runQuerySelectPromise(
            req,
            "select starttime,endtime,harga from promoproduk where idkelompokharga=? and idproduk=?",
            [idpriceplan, dataProduk[i].idproduk],
          );
          if (produkPromo.length > 0) {
            let starttime = moment(new Date(produkPromo[0].starttime));
            let endtime = moment(new Date(produkPromo[0].endtime));
            if (moment(new Date()).isBetween(starttime, endtime)) {
              dataProduk[i].hargalama = dataProduk[i].harga;
              dataProduk[i].harga = produkPromo[0].harga;
              dataProduk[i].ispromo = true;
            }
          }

          let a = {
            harga: dataProduk[i].harga + tambahan,
            hargalama: dataProduk[i].hargalama + tambahan,
            komisi: dataProduk[i].komisi,
            kodeproduk: dataProduk[i].kodeproduk,
            namaproduk: dataProduk[i].namaproduk,
            namaoperator: dataProduk[i].namaoperator,
            imgurl: dataProduk[i].imgurl,
            keterangan: dataProduk[i].keterangan,
            jenisproduk: dataProduk[i].jenisproduk,
            gangguan: dataProduk[i].isgangguan,
            stokkosong: dataProduk[i].isstokkosong,
            nominal: dataProduk[i].nominal,
            ispromo: dataProduk[i].ispromo,
          };
          products.push(a);
        }
      }
      res.json({ success: true, data: products });
    } else {
      res.json({ success: false, msg: "akun tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "terjadi kesalahan" });
  }
};

ProductControllers.getPDAM = async (req, res) => {
  var uuid = "app:" + req.body.uuid;
  var cekdata = await utilirs.runQuerySelectPromise(
    req,
    "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?",
    uuid,
  );
  if (cekdata.length > 0) {
    var idreseller = cekdata[0].idreseller;
    var namareseller = cekdata[0].namareseller;
    var idpriceplan = cekdata[0].patokanhargajual;
    var dataProduk = await utilirs.runQuerySelectPromise(
      req,
      "select k.hargajual,k.komisi,p.kodeproduk,p.namaproduk,o.namaoperator,p.imgurl,p.keterangan,p.isgangguan as gangguan,p.isstokkosong as stokkosong from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where k.idkelompokharga=? and p.kodeproduk like '%PDAM%'",
      [idpriceplan],
    );
    res.json({ succes: true, data: dataProduk });
  } else {
    res.json({ success: false, msg: "akun tidak ditemukan" });
  }
};

ProductControllers.getPrice = async (req, product_id, pricePlan) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select d.hargajual,d.aktif,k.mlm from detailkelompokharga d left join kelompokharga k on d.idkelompokharga=k.idkelompokharga where d.idproduk=? and d.idkelompokharga=?",
    [product_id, pricePlan],
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return false;
  }
};

ProductControllers.getPriceCluster = async (req, product_id, idRs) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select hargacluster from produkcluster WHERE idproduk=?  and idareadomisili=(select idareadomisili from masterreseller where idreseller=?)",
    [product_id, idRs],
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return false;
  }
};

ProductControllers.getPriceReseller = async (req, product_id, idRs) => {
  var rows = await utilirs.runQuerySelectPromise(
    req,
    "select hargajual from produkreseller WHERE idproduk=? and idreseller=?",
    [product_id, idRs],
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return false;
  }
};

module.exports = ProductControllers;
