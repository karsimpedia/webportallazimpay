
"use strict";
const VoucherFisikControllers = {};
var utilirs = require('./utils_v9');
const moment = require('moment');
const md5 = require('md5');
const S = require('string');
const axios = require('axios');
const pad = require('utils-pad-string');

VoucherFisikControllers.getVouCherCode = async (req, res) => {

    var uuid = "app:" + req.body.uuid;
    try {

        var cekdata = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?", uuid);
        if (cekdata.length > 0) {
            var idrs = cekdata[0].idreseller;
            var datav = await utilirs.runQuerySelectPromise(req, "select v.idtransaksi,v.waktukeluar as waktu,v.noseri,v.nogosok,v.kodeproduk,p.namaproduk,p.imgurl,p.imgurl as imgurloperator,v.hargajual from voucherfisikterjual v left join produk p on v.kodeproduk=p.kodeproduk where v.idreseller=? order by v.idtransaksi desc", [idrs])
            res.json({ success: true, data: datav });

        } else {
            res.json({ success: false, msg: "akun tidak ditemukan" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "terjadi kesalahan" });
    }
}

VoucherFisikControllers.getProductsFisik = async (req, res) => {

    var uuid = "app:" + req.body.uuid;
    var tujuan = req.body.tujuan;

    try {

        var cekdata = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?", uuid);
        if (cekdata.length > 0) {
            var idpriceplan = cekdata[0].patokanhargajual;
            var idrs = cekdata[0].idreseller;
            var products = [];

            if (typeof tujuan == 'undefined' || tujuan.length < 3) {
                var dataProduk = await utilirs.runQuerySelectPromise(req, "select p.idproduk,k.hargajual as harga,k.komisi,p.kodeproduk,p.namaproduk,o.namaoperator,o.imgurl as image,p.poin,p.imgurl,p.keterangan,p.nominal from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where p.jenisproduk=1 and k.idkelompokharga=? and p.jenisproduk=1 and k.hargajual>0 order by k.hargajual asc", [idpriceplan]);
                if (dataProduk.length > 0) {
                    for (var i = 0; i < dataProduk.length; i++) {

                        var tambahan = 0;
                        var getUppline = await utilirs.getUpline(req, idrs);
                        if (getUppline.length > 0) {
                            if (getUppline[0].idupline != '-') {
                                var paramupline = idrs;
                                var tmpParamupline = '';
                                var exit = false;
                                while (exit == false) {
                                    var cekUppline = await utilirs.getUpline(req, paramupline);
                                    if (cekUppline[0].idupline == '-') {
                                        exit = true;
                                        tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
                                    } else {
                                        tmpParamupline = paramupline;
                                        paramupline = cekUppline[0].idupline;
                                        var hargaMarkup = await utilirs.getHargaMarkup(req, tmpParamupline, dataProduk[i].idproduk);
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
                            harga: dataProduk[i].harga + tambahan,
                            hargajual: dataProduk[i].harga + tambahan,
                            komisi: dataProduk[i].komisi,
                            kodeproduk: dataProduk[i].kodeproduk,
                            namaproduk: dataProduk[i].namaproduk,
                            namaoperator: dataProduk[i].namaoperator,
                            imgurl: dataProduk[i].imgurl,
                            imgurloperator: "",
                            keterangan: dataProduk[i].keterangan,
                            jenisproduk: dataProduk[i].jenisproduk,
                            nominal: dataProduk[i].nominal,
                        }
                        products.push(a)
                    }
                }
            } else {

                let dataopr = await utilirs.runQuerySelectPromise(req, "SELECT pr.prefik,pr.idoperator,o.namaoperator,o.imgurl FROM prefik pr left join operator o on pr.idoperator=o.idoperator WHERE  MID(?,1,LENGTH(pr.prefik))=pr.prefik and length(pr.prefik)>=3", [tujuan]);
                if (dataopr.length > 0) {

                    for (var x = 0; x < dataopr.length; x++) {

                        var dataProduk = await utilirs.runQuerySelectPromise(req, "select p.idproduk,k.hargajual as harga,k.komisi,p.kodeproduk,p.namaproduk,o.namaoperator,o.imgurl as image,p.poin,p.imgurl,p.keterangan,p.nominal from detailkelompokharga k left join produk p on k.idproduk=p.idproduk left join operator o on p.idoperator=o.idoperator where p.jenisproduk=1 and p.idoperator=? and k.idkelompokharga=? and p.jenisproduk=1 and k.hargajual>0 order by k.hargajual asc", [dataopr[x].idoperator, idpriceplan]);
                        if (dataProduk.length > 0) {
                            for (var i = 0; i < dataProduk.length; i++) {

                                var tambahan = 0;
                                var getUppline = await utilirs.getUpline(req, idrs);
                                if (getUppline.length > 0) {
                                    if (getUppline[0].idupline != '-') {
                                        var paramupline = idrs;
                                        var tmpParamupline = '';
                                        var exit = false;
                                        while (exit == false) {
                                            var cekUppline = await utilirs.getUpline(req, paramupline);
                                            if (cekUppline[0].idupline == '-') {
                                                exit = true;
                                                tambahan += parseInt(cekUppline[0].tambahanhargapribadi);
                                            } else {
                                                tmpParamupline = paramupline;
                                                paramupline = cekUppline[0].idupline;
                                                var hargaMarkup = await utilirs.getHargaMarkup(req, tmpParamupline, dataProduk[i].idproduk);
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
                                    harga: dataProduk[i].harga + tambahan,
                                    hargajual: dataProduk[i].harga + tambahan,
                                    komisi: dataProduk[i].komisi,
                                    kodeproduk: dataProduk[i].kodeproduk,
                                    namaproduk: dataProduk[i].namaproduk,
                                    namaoperator: dataProduk[i].namaoperator,
                                    imgurl: dataProduk[i].imgurl,
                                    imgurloperator: "",
                                    keterangan: dataProduk[i].keterangan,
                                    jenisproduk: dataProduk[i].jenisproduk,
                                    nominal: dataProduk[i].nominal,
                                }
                                products.push(a)
                            }
                        }

                    }
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


}



module.exports = VoucherFisikControllers;