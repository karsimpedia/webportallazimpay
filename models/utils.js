const utils = {};
const async = require('async');
var Promise = require("bluebird");
const S = require('string');
const pad = require('utils-pad-string');
const dateFormat = require('dateformat');
const moment = require('moment');


utils.respoonse = (res, status, rc, msg) => {
    res.json({ success: status, rc: rc, msg: msg }); return;
}

utils.isNumeric = (n) => {
    return (typeof n == "number" && !isNaN(n));
}

utils.sleep = (req, ms) => {
    /**
     * Wait Sleep 
     */
    return new Promise(resolve => setTimeout(resolve, ms));
}



utils.cekkomisi = (req, idreseller) => {
    /**
     * total KOmisi agen reseller/agen
     */

    var hasil = 0;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select komisi from masterreseller where idreseller=?", [idreseller])
            if (row.length > 0) {
                hasil = row[0].komisi;
            }
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}
utils.ceksaldo = (req, idreseller) => {
    /**
     * getselisih reseller/agen
     */
    console.log(idreseller);
    var hasil = 0;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select saldo from masterreseller where idreseller=?", [idreseller])
            console.log(row);
            hasil = row[0].saldo;

            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.todesimal = (angka) => {
    var isminus = false;
    if (parseInt(angka) < 0) {

        angkax = angka.toString().replace('-', '');
        isminus = true;
    } else {
        angkax = angka;
    }

    var rev = parseInt(angkax, 10).toString().split('').reverse().join('');
    var rev2 = '';
    for (var i = 0; i < rev.length; i++) {
        rev2 += rev[i];
        if ((i + 1) % 3 === 0 && i !== (rev.length - 1)) {
            rev2 += '.';
        }
    }
    return rev2.split('').reverse().join('').toString();
}

utils.toXML = (res, rc, tujuan, produk, msg, idtrx, refclient) => {
    res.set('Content-Type', 'text/xml');
    var xmlrespon = '<?xml version=\"1.0\"?>';
    xmlrespon = xmlrespon + "<methodResponse>";
    xmlrespon = xmlrespon + "<params>";
    xmlrespon = xmlrespon + "<param>";
    xmlrespon = xmlrespon + "<value>";
    xmlrespon = xmlrespon + "<struct>";
    xmlrespon = xmlrespon + "<member>";
    xmlrespon = xmlrespon + "<name>RESPONSECODE</name>";
    xmlrespon = xmlrespon + "<value><string>" + rc + "</string></value>";
    xmlrespon = xmlrespon + "</member>";
    xmlrespon = xmlrespon + "<member>";
    xmlrespon = xmlrespon + "<name>REQUESTID</name>";
    xmlrespon = xmlrespon + "<value><string>" + refclient + "</string></value>";
    xmlrespon = xmlrespon + "</member>";
    xmlrespon = xmlrespon + "<member>";
    xmlrespon = xmlrespon + "<name>MESSAGE</name>";
    xmlrespon = xmlrespon + "<value><string>" + msg + "</string></value>";
    xmlrespon = xmlrespon + "</member>";
    xmlrespon = xmlrespon + "<member>";
    xmlrespon = xmlrespon + "<name>TRANSACTIONID</name>";
    xmlrespon = xmlrespon + "<value><string>" + idtrx + "</string></value>";
    xmlrespon = xmlrespon + "</member>";
    xmlrespon = xmlrespon + "<member>";
    xmlrespon = xmlrespon + "<name>TUJUAN</name>";
    xmlrespon = xmlrespon + "<value><string>" + tujuan + "</string></value>";
    xmlrespon = xmlrespon + "</member>";
    xmlrespon = xmlrespon + "<member>";
    xmlrespon = xmlrespon + "<name>PRODUK</name>";
    xmlrespon = xmlrespon + "<value><string>" + produk + "</string></value>";
    xmlrespon = xmlrespon + "</member>";
    xmlrespon = xmlrespon + "</struct>";
    xmlrespon = xmlrespon + "</value>";
    xmlrespon = xmlrespon + "</param>";
    xmlrespon = xmlrespon + "</params>";
    xmlrespon = xmlrespon + "</methodResponse>";
    return xmlrespon;
}


utils.getselisih = (req, idreseller) => {
    /**
     * getselisih reseller/agen
     */
    var hasil = 0;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select tambahanhargapribadi from masterreseller where idreseller=?", [idreseller])
            hasil = row[0].tambahanhargapribadi;

            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.ijinkanApiH2H = (req, priceplan) => {
    /**
     * getselisih reseller/agen
     */
    var hasil = false;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select ishttp from kelompokharga where idkelompokharga=?", [priceplan])

            if (parseInt(row[0].ishttp) == 1) {
                hasil = true;
            }

            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.getselisihUPline = (req, idreseller, idproduk) => {
    /** 
     * ambil total selisih upline; 
     */
    var tambahan = 0;
    return new Promise(async function (resolve, reject) {
        try {

            var keluar = false;
            var paramidupline = '';
            var paramiduplinebefore = '';


            let row = await utils.runQuerySelectPromise(req, "select idupline from masterreseller where idreseller=?", [idreseller])
            if (row[0].idupline != '-') {
                paramidupline = idreseller;

                while (keluar == false) {
                    let row = await utils.runQuerySelectPromise(req, "select idupline from masterreseller where idreseller=?", [paramidupline])
                    if (row[0].idupline == '-') {
                        keluar = true;
                        let tambahan1 = await utils.getselisih(req, paramidupline);
                        tambahan = tambahan + tambahan1;
                    } else {
                        paramiduplinebefore = paramidupline;
                        paramidupline = row[0].idupline;
                        let row1 = await utils.runQuerySelectPromise(req, "select markup from markupperproduk where idreseller=? and idproduk=?", [paramiduplinebefore, idproduk])
                        if (row1.length > 0) {
                            tambahan = tambahan + row1[0].markup;
                        } else {
                            let a1 = await utils.getselisih(req, paramiduplinebefore);
                            tambahan = tambahan + a1;
                        }
                    }

                }
            }
            resolve(tambahan);
        } catch (error) {
            console.log(error);
            resolve(tambahan);
        }
    });

}


utils.ambilSaldo = (req, jenistrx, idproduk, idreseller) => {
    var hasil = 0;
    return new Promise(async function (resolve, reject) {
        try {
            if (parseInt(jenistrx) == 2) {
                let row = await utils.runQuerySelectPromise(req, "select jumlah from transferstokmaster where idproduk=? and idreseller=?", [idproduk, idreseller])
                hasil = row[0].jumlah;
            } else {
                let row = await utils.runQuerySelectPromise(req, "select saldo from masterreseller where idreseller=?", [idreseller])
                hasil = row[0].saldo;
            }

            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.is_saldo_tidak_cukup_h2h = (req, hrg, idreseller) => {
    var hasil = true;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select saldo from masterreseller where idreseller=?", [idreseller])
            if (row.length > 0) {
                if (row[0].saldo > 0) {
                    if (row[0].saldo > hrg) {
                        hasil = false;
                    }
                }
            }
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.is_stok_tidak_cukup_h2h = (req, idproduk, idreseller) => {
    var hasil = true;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select jumlah from transferstokmaster where idproduk=? and idreseller=?", [idproduk, idreseller])
            if (row.length > 0) {
                if (row[0].jumlah > 0) {
                    hasil = false;
                }
            }
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.isblokirproduk = (req, idproduk, idreseller) => {
    var hasil = false;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select maxkeluar from blokir where idproduk=? and idreseller=?", [idproduk, idreseller])
            if (row.length > 0) {
                if (row[0].maxkeluar > 0) {
                    hasil = true;
                }
            }
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.cekmaxpendingmitra = (req, idreseller) => {
    var hasil = true;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select pendapatandownLine as maxpending from masterreseller where idreseller=?", [idreseller]);
            let maxpending = row[0].maxpending;
            if (maxpending > 0) {
                let r = await utils.runQuerySelectPromise(req, "select count(idtransaksi) as totalpending from transaksi where idreseller=? and statustransaksi<>1 and statustransaksi<>2", [idreseller])
                let totalPending = r[0].totalpending;
                if (totalPending >= maxpending) {
                    hasil = false;
                }
            }
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.cekAdaQuota = (req, idproduk, idreseller) => {
    var hasil = true;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select quota from quotareseller where idproduk=? and idreseller=?", [idproduk, idreseller])
            if (row.length > 0) {
                if (row[0].quota > 0) {
                    hasil = true;
                } else {
                    hasil = false;
                }
            }
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.isprodukpriceplanAktif = (req, idproduk, idpriceplan) => {
    var hasil = false;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select iddetailkelompok,aktif from detailkelompokharga where idproduk=? and idkelompokharga=?", [idproduk, idpriceplan])

            if (row[0].aktif) {
                hasil = true;
            }
            resolve(hasil);

        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.isprodukGangguan = (req, idproduk) => {
    var hasil = false;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select isgangguan from produk where idproduk=?", [idproduk])
            if (row[0].isgangguan) {
                hasil = true;
            }
            //console.log(hasil);
            resolve(hasil);

        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.isstokkosong = (req, idproduk) => {
    var hasil = false;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select isstokkosong from produk where idproduk=?", [idproduk])
            if (row[0].isstokkosong) {
                hasil = true;
            }
            //console.log(hasil);
            resolve(hasil);

        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.iscutoffProduk = (req, idproduk) => {
    var hasil = true;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select jamstart,jamend from produk where idproduk=?", [idproduk])
            let jamstart = row[0].jamstart;
            let jamend = row[0].jamend;
            let x = moment();
            let a = moment(jamstart, 'HH:mm:ss');
            let b = moment(jamend, 'HH:mm:ss');

            if (x.isBetween(a, b)) {
                hasil = false;
            }

            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.iscutoffSystem = (req) => {
    var hasil = true;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select jamstart,jamend from setting", [])
            let jamstart = row[0].jamstart;
            let jamend = row[0].jamend;
            let x = moment();
            let a = moment(jamstart, 'HH:mm:ss');
            let b = moment(jamend, 'HH:mm:ss');

            if (x.isBetween(a, b)) {
                hasil = false;
            }

            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.generateidinbox = () => {

    var date = new Date();
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth();
    var day = date.getUTCDate();
    var hours = date.getUTCHours();
    var min = date.getUTCMinutes();
    var sec = date.getUTCSeconds();
    var idinbox = 0;
    idinbox = Math.floor(Math.random() * Math.floor(9999));
    idinbox = pad(idinbox.toString(), 5, { 'lpad': '0' });
    return dateFormat(new Date(), "mmddhhMMss") + idinbox;
}

utils.ceklimitsender = async (req, idterminal) => {
    var sisa = 0;
    return new Promise(async function (resolve, reject) {
        try {
            let slimit = await utils.runQuerySelectPromise(req, "select maxjumkeluar,berlakusebagaisender from terminal where idterminal=?", [idterminal])
            //console.log(slimit);
            if (slimit.length > 0) {
                sisa = slimit[0].maxjumkeluar;
                resolve(sisa);
            } else {
                resolve(sisa);
            }
        } catch (error) {
            console.log(error);
            resolve(sisa);
        }
    });
}

utils.UpdateProfileStokByTerminal = async (req, idterminal, pesan) => {
    var sisastok = 0;
    try {
        let autoaktif = '0';
        let a = await utils.runQuerySelectPromise(req, "select autoaktif from terminal where idterminal=?", [idterminal]);
        autoaktif = a[0].autoaktif;

        let b = await utils.runQuerySelectPromise(req, "select idprofile,parsestok,Parsestokbalasan from profileterminal where idterminal=? order by idprofile asc", [idterminal]);

        await Promise.all(b.map(async ps => {

            // console.log(ps.parsestok);
            sisastok = S(pesan).between(ps.parsestok.split('|')[0], ps.parsestok.split('|')[1]).trim().s;
            sisastok = S(sisastok).replaceAll(',', '').s;
            // console.log('stok:' + sisastok);

            if (S(sisastok).isNumeric() && sisastok != '') {
                //console.log('YES');
                try {
                    await utils.runQuerySelectPromise(req, 'update profileterminal set stokactual=?,lastUpdate=now() where idprofile=? and idterminal=?', [sisastok, ps.idprofile, idterminal]);
                } catch (error) {
                    //console.log('er:' + error);
                }
                if (autoaktif == '1') {
                    if (sisastok > 10) {
                        await utils.runQuerySelectPromise(req, 'update produkterminal set aktif=1 where idprofile=? and idterminal=?', [sisastok, ps.idprofile, idterminal]);
                    }
                }
            }

        }));

    } catch (error) {
        console.log("UpdateProfileStokByTerminal:" + error);
    }

    //resolve(sisastok);
}

utils.UpdateProfileStokByIdProdukTerminal = async (req, pesan, idprodukterminal, idterminal) => {
    var sisastok = 0;
    return new Promise(async function (resolve, reject) {

        let ps = await utils.runQuerySelectPromise(req, 'select pt.idprofile,pt.parsestok,pt.parsestokbalasan from profileterminal pt left join produkterminal prt on pt.idprofile=prt.idprofile where prt.idprodukterminal=? and pt.idterminal=?', [idprodukterminal, idterminal]);
        if (ps.length > 0) {
            //console.log(idprodukterminal);
            sisastok = S(pesan).between(ps[0].parsestokbalasan.split('|')[0], ps[0].parsestokbalasan.split('|')[1]).s;
            //console.log(sisastok);
            sisastok = S(sisastok).replaceAll(',', '').s;
            if (S(sisastok).isNumeric() && sisastok != '') {
                try {
                    await utils.runQuerySelectPromise(req, 'update profileterminal set stokactual=?,lastUpdate=now() where idprofile=? and idterminal=?', [sisastok, ps[0].idprofile, idterminal]);
                } catch (error) {
                    console.log(error);
                }
            } else {
                sisastok = 0;
            }
            resolve(sisastok);
        } else {
            resolve(sisastok);
        }

    });
}

utils.cekStatusDenganTujuan = async (req, idterminal, pesan, tujuan, nominalbalasan) => {
    var status = 10, sn = '', balas = '';
    var hasil = {};
    return new Promise(async function (resolve, reject) {
        let databalasan = await utils.runQuerySelectPromise(req, 'select kata,jenisbalasan,flagjawabanalt,jawabanalt,sn,data1,data2,data3,data4,data5,data6,data7,jawabankeuser,tagihan,jmltag from settingbalasanh2h where idterminal=? order by jenisbalasan ASC', [idterminal]);
        //console.log(databalasan);
        if (databalasan.length > 0) {
            if (pesan.indexOf(tujuan) > 0) {
                for (xxx = 0; xxx < databalasan.length; xxx++) {
                    b = databalasan[xxx];
                    //console.log(b);
                    if (pesan.indexOf(b.kata) > 0) {
                        status = parseInt(b.jenisbalasan);
                        if (status == 1) {
                            if (nominalbalasan != '') {
                                if (nominalbalasan.indexOf(nominalbalasan) > 0) {
                                    status = parseInt(b.jenisbalasan);
                                } else {
                                    status = 10;
                                }
                            }
                        }
                        if (b.sn != '') {
                            if (pesan.indexOf(b.sn.split('|')[0]) >= 0) {
                                sn = S(pesan).between(b.sn.split('|')[0], b.sn.split('|')[1]).trim().s;
                                console.log(sn);
                            } else {
                                /*Auto SN*/
                                let ax = await utils.ambilAutoSN(req, pesan);
                                sn = ax;
                            }
                        }
                        if (b.flagjawabanalt == '1') {
                            balas = b.jawabanalt;
                        }
                        hasil = { status: status, sn: sn, balasanalt: balas };

                        break;
                    } else {
                        status = 10;
                        hasil = { status: status, sn: '', balasanalt: balas };
                    }
                }
            } else {
                status = 10;
                hasil = { status: status, sn: '', balasanalt: balas };
            }
            resolve(hasil);
        } else {
            hasil = { status: status, sn: '', balasanalt: balas };
            resolve(status);
        }
    });
}


utils.ambilAutoSN = async (req, ppesan) => {
    var sn = '';
    var xpesan = ppesan;
    return new Promise(async function (resolve, reject) {
        try {
            let autosn = await utils.runQuerySelectPromise(req, 'select kata from logicsn', []);
            //console.log(autosn);
            if (autosn.length > 0) {

                await Promise.all(autosn.map(async datasn => {
                    kata = datasn.kata;
                    let indexkatawal = xpesan.indexOf(kata);
                    if (indexkatawal > 0) {
                        xpesan = S(xpesan).right(xpesan.length - (indexkatawal + kata.length)).s;
                        //console.log(xpesan)
                        if (xpesan.indexOf(' ') > 0) {
                            sn = S(xpesan).between(kata, ' ').trim().s;
                        } else {
                            let xa = xpesan.indexOf('.');
                            if (xa > 0) {
                                sn = S(xpesan).left(xa).trim().s;
                            } else {
                                xa = xpesan.indexOf(';');
                                if (xa > 0) {
                                    sn = S(xpesan).left(xa).trim().s;
                                } else {
                                    xa = xpesan.indexOf(')');
                                    if (xa > 0) {
                                        sn = S(xpesan).left(xa).trim().s;
                                    } else {
                                        xa = xpesan.indexOf(',');
                                        if (xa > 0) {
                                            sn = S(xpesan).left(xa).trim().s;
                                        } else {
                                            if (xpesan.length < 20) {
                                                sn = xpesan;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }));

            }
            resolve(sn);
        } catch (error) {
            console.log(error);
            resolve(sn);
        }
    });
}


utils.cekStatusTanpaTujuan = async (req, idterminal, pesan, tujuan, nominalbalasan) => {
    var status = 10, sn = '', balas = '';
    var hasil = {};
    return new Promise(async function (resolve, reject) {

        let databalasan = await utils.runQuerySelectPromise(req, 'select kata,jenisbalasan,flagjawabanalt,jawabanalt,sn,data1,data2,data3,data4,data5,data6,data7,jawabankeuser,tagihan,jmltag from settingbalasanh2h where idterminal=? order by jenisbalasan ASC', [idterminal]);
        if (databalasan.length > 0) {
            for (i = 0; i < databalasan.length; i++) {
                b = databalasan[i];
                //console.log(b);
                if (pesan.indexOf(b.kata) > 0) {
                    status = parseInt(b.jenisbalasan);
                    if (status == 1) {
                        if (nominalbalasan != '') {
                            if (nominalbalasan.indexOf(nominalbalasan) > 0) {
                                status = parseInt(b.jenisbalasan);
                            } else {
                                status = 10;
                            }
                        }
                    }
                    if (b.sn != '') {
                        if (pesan.indexOf(b.sn.split('|')[0]) >= 0) {
                            sn = S(pesan).between(b.sn.split('|')[0], b.sn.split('|')[1]).trim().s;
                        } else {
                            let ax = await utils.ambilAutoSN(req, pesan);
                            sn = ax;
                        }
                    }

                    if (b.flagjawabanalt == '1') {
                        balas = b.jawabanalt;
                    }
                    hasil = { status: status, sn: sn, balasanalt: balas };
                    break;
                } else {
                    status = 10;
                    hasil = { status: status, sn: '', balasanalt: balas };
                }
            }
            resolve(hasil);
        } else {
            hasil = { status: status, sn: '', balasanalt: balas };
            resolve(status);
        }
    });
}


utils.loguser = async (req, iduser, info) => {
    req.getConnection((err, conn) => {
        conn.query("insert into loguserakses value(0,now(),?,?)", [iduser, info], (err, rows) => {
            if (err) {
                return false;
            } else {
                return true;
            }
        });
    });
}


utils.selectrx = async (req, param, callback) => {
    await req.getConnection(async (err, conn) => {
        await conn.query("select idterminal,namaterminal,idtransaksi,tujuan,nopengirim,hargajualreseller,tanggal,jam,sn,idtransaksiclient,saldoawal,saldoakhir,kodeproduk,idreseller,namareseller,kodeinboxcenter from transaksi where idtransaksi=?", param, (err, rows) => {
            callback(err, rows);
        });
    });
}

utils.beginTransaction = async (req) => {
    return new Promise(function (resolve, reject) {
        req.getConnection((err, conn) => {
            conn.query('START TRANSACTION', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}

utils.commit = async (req) => {
    return new Promise(function (resolve, reject) {
        req.getConnection((err, conn) => {
            conn.query('COMMIT', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}

utils.rollback = async (req) => {
    return new Promise(function (resolve, reject) {
        req.getConnection((err, conn) => {
            conn.query('ROLLBACK', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}

utils.runQuerySelectPromise = async (req, sql, param) => {
    return new Promise(function (resolve, reject) {
        req.getConnection((err, conn) => {

            conn.query(sql, param, (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}

utils.runQuerySelect = async (req, sql, param) => {
    req.getConnection((err, conn) => {
        conn.query(sql, param, (err, rows) => {
            if (err) {
                console.log(err);
                return (err);
            } else {
                return rows;
            }
        });
    });

}

utils.ambilFomatReplay = async (req, id) => {
    return new Promise(function (resolve, reject) {
        req.getConnection((err, conn) => {
            conn.query('select format from smsbalasan where idsmsbalasan=?', id, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}

utils.terbilang = function (bilangan) {
    var kalimat = "";
    var angka = new Array('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
    var kata = new Array('', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan');
    var tingkat = new Array('', 'Ribu', 'Juta', 'Milyar', 'Triliun');
    var panjang_bilangan = bilangan.length;

    /* pengujian panjang bilangan */
    if (panjang_bilangan > 15) {
        kalimat = "Diluar Batas";
    } else {
        /* mengambil angka-angka yang ada dalam bilangan, dimasukkan ke dalam array */
        for (i = 1; i <= panjang_bilangan; i++) {
            angka[i] = bilangan.substr(-(i), 1);
        }

        var i = 1;
        var j = 0;

        /* mulai proses iterasi terhadap array angka */
        while (i <= panjang_bilangan) {
            subkalimat = "";
            kata1 = "";
            kata2 = "";
            kata3 = "";

            /* untuk Ratusan */
            if (angka[i + 2] != "0") {
                if (angka[i + 2] == "1") {
                    kata1 = "Seratus";
                } else {
                    kata1 = kata[angka[i + 2]] + " Ratus";
                }
            }

            /* untuk Puluhan atau Belasan */
            if (angka[i + 1] != "0") {
                if (angka[i + 1] == "1") {
                    if (angka[i] == "0") {
                        kata2 = "Sepuluh";
                    } else if (angka[i] == "1") {
                        kata2 = "Sebelas";
                    } else {
                        kata2 = kata[angka[i]] + " Belas";
                    }
                } else {
                    kata2 = kata[angka[i + 1]] + " Puluh";
                }
            }

            /* untuk Satuan */
            if (angka[i] != "0") {
                if (angka[i + 1] != "1") {
                    kata3 = kata[angka[i]];
                }
            }

            /* pengujian angka apakah tidak nol semua, lalu ditambahkan tingkat */
            if ((angka[i] != "0") || (angka[i + 1] != "0") || (angka[i + 2] != "0")) {
                subkalimat = kata1 + " " + kata2 + " " + kata3 + " " + tingkat[j] + " ";
            }

            /* gabungkan variabe sub kalimat (untuk Satu blok 3 angka) ke variabel kalimat */
            kalimat = subkalimat + kalimat;
            i = i + 3;
            j = j + 1;
        }

        /* mengganti Satu Ribu jadi Seribu jika diperlukan */
        if ((angka[5] == "0") && (angka[6] == "0")) {
            kalimat = kalimat.replace("Satu Ribu", "Seribu");
        }
    }
    return kalimat;
}

utils.CekStokFisik = (req, kodeproduk) => {
    /**
     * cek Total Stok
     */
    var hasil = false;
    return new Promise(async function (resolve, reject) {
        try {
            let dataStok = await utils.runQuerySelectPromise(req, "select ifnull(count(kodeproduk),0) as jumlah from voucherfisik where kodeproduk=?", [kodeproduk]);
            if (dataStok.length > 0) {
                if (dataStok[0].jumlah > 0) {
                    hasil = true;
                }
            }
            resolve(hasil);
        } catch (error) {
            console.log("CekStokFisik:" + error);
            resolve(hasil);
        }
    });
}



module.exports = utils;
