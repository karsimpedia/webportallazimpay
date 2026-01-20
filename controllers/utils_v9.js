const utils = {};
const async = require('async');
var Promise = require("bluebird");
const S = require('string');
const pad = require('utils-pad-string');
const dateFormat = require('dateformat');
const moment = require('moment');
const FCM = require('fcm-node');
const crypto = require('crypto');

utils.encryptaes256 = (plaintext) => {

    const ENCRYPTION_KEY = "26BA39CMR0YL71CFGN2RSDZRLK24SLFC";
    let iv = new Buffer.alloc(16)
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('base64');
}

utils.deryptaes256 = (encrypted) => {
    var input = Buffer.from(encrypted, 'base64');
    const ENCRYPTION_KEY = "26BA39CMR0YL71CFGN2RSDZRLK24SLFC";
    let iv = new Buffer.alloc(16)
    let cipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let derypted = cipher.update(input);
    derypted = Buffer.concat([derypted, cipher.final()]);
    return derypted.toString();
}


utils.response = (res, status, rc, msg) => {
    res.json({ success: status, rc: rc, msg: msg }); return;
}




utils.generateIdDownline = async (req, name) => {
    var hasil = "";
    try {
        return new Promise(async function (resolve, reject) {

            var rows = await utils.runQuerySelectPromise(req, "select GenerateIdResellerByUpline(?) as iddownline", [name.substring(0, 2)]);
            if (rows.length > 0) {
                hasil = rows[0].iddownline;
            } else {
                hasil = "";
            }
            resolve(hasil);
        });

    } catch (error) {
        hasil = "";
        resolve(hasil);
    }



}

utils.getHargaMarkup = async (req, idrs, idproduk) => {
    console.log("markup:", idrs, idproduk);
    var rows = [];
    try {
        return new Promise(async function (resolve, reject) {
            rows = await utils.runQuerySelectPromise(req, "select markup from markupperproduk where idreseller=? and idproduk=?", [idrs, idproduk]);
            resolve(rows);
        });
    } catch (error) {
        resolve(rows);
    }
}

utils.getUpline = async (req, idrs) => {

    var rows = [];
    try {
        return new Promise(async function (resolve, reject) {
            rows = await utils.runQuerySelectPromise(req, "select idupline,tambahanhargapribadi from masterreseller where idreseller=?", [idrs]);
            resolve(rows);
        });
    } catch (error) {
        resolve(rows);
    }
}

utils.checkHP = async (req, phone) => {

    var hasil = true;
    try {
        return new Promise(async function (resolve, reject) {
            var rows = await utils.runQuerySelectPromise(req, "SELECT r.idreseller FROM MasterReseller r left join hptrx h on r.idreseller=h.idreseller WHERE h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=0 ", [phone]);
            if (rows.length > 0) {
                hasil = true;
            } else {
                hasil = false;
            }
            resolve(hasil);
        });
    } catch (error) {
        hasil = true;
        resolve(hasil);
    }


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

utils.generateVABCA = (req, idreseller) => {
    var va = "";
    var awalanva = "11074";
    var idmitra = "0001";
    try {
        return new Promise(async function (resolve, reject) {

            var datax = await utils.runQuerySelectPromise(req, "select nova from virtualaccount where mitra='ASA' and idreseller=? and gateway='PRISMA-LINK' and bank='BCA' and mid(nova,6,4)='0001' order by id desc limit 1", [idreseller]);
            if (datax.length > 0) {
                va = datax[0].nova;
            } else {
                var datava = await utils.runQuerySelectPromise(req, "select nova from virtualaccount where mitra='ASA' and gateway='PRISMA-LINK' and bank='BCA' and mid(nova,6,4)='0001' order by id desc limit 1");
                if (datava.length > 0) {

                    va = awalanva + idmitra;
                    var lastva = datava[0].nova;
                    lastva = S(lastva).right(7).s;
                    var inova = parseInt(lastva) + 1;
                    va = va.toString() + pad(inova.toString(), 7, { 'lpad': '0' });
                    var dataregva = {

                        mitra: "ASA",
                        idreseller: idreseller,
                        nova: va,
                        bank: "BCA",
                        gateway: "PRISMA-LINK",
                        status: 1

                    }
                    let cx = await utils.runQuerySelectPromise(req, "insert into virtualaccount set ?", [dataregva]);
                } else {
                    va = awalanva + idmitra + "0000001";
                    var dataregva = {

                        mitra: "ASA",
                        idreseller: idreseller,
                        nova: va,
                        bank: "BCA",
                        gateway: "PRISMA-LINK",
                        status: 1

                    }
                    let cx = await utils.runQuerySelectPromise(req, "insert into virtualaccount set ?", [dataregva]);
                }
            }
            resolve(va);
        });

    } catch (error) {
        va = "";
        resolve(va);
    }


}

utils.sendpush = (req, uuid, msg_body, title) => {
    var hasil = { success: false, msg: "error" };
    try {
        return new Promise(async function (resolve, reject) {
            var datafcm = await utils.runQuerySelectPromise(req, "select r.regtoken,s.serverkey from regfcm r left join serverfcm s on r.serverid=s.id and r.appid=?", [uuid]);
            let token = datafcm[0].regtoken;
            let serverkey = datafcm[0].serverkey;
            var fcm = new FCM(serverkey);
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: token,
                collapse_key: 'your_collapse_key',
                notification: {
                    title: title,
                    body: msg_body
                },
                data: {  //you can send only notification or only data(or include both)
                    title: title,
                    message: msg_body,
                    body: msg_body,
                    my_key: 'my value',
                    my_another_key: 'my another value'
                },
                ttl: 3600
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    // console.log("Something has gone wrong!", err);
                    resolve({ success: true, msg: JSON.parse(err) });
                } else {
                    //console.log("Successfully sent with response: ", response);
                    resolve({ success: true, msg: JSON.parse(response) });
                }
            });

        });

    } catch (error) {
        console.log("Error sendpush:", error);
        return hasil;
    }
}

utils.getstans12 = () => {
    var date = new Date();
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth();
    var day = date.getUTCDate();
    var hours = date.getUTCHours();
    var min = date.getUTCMinutes();
    var sec = date.getUTCSeconds();
    var idinbox = 0;
    idinbox = Math.floor(Math.random() * Math.floor(99));
    idinbox = pad(idinbox.toString(), 12, { 'lpad': '0' });
    return idinbox;
}

utils.ParsePdamBandarLampung_618 = (printdata) => {

    printdata = S(printdata).replaceAll('\u001bF', '').s;
    printdata = S(printdata).replaceAll('\u001bE', '').s;
    var idpel = S(printdata).between('NO PELANGGAN   :', 'BLOK').s.trim();
    var nama = S(printdata).between('NAMA           :', 'BLOK 2').s.trim();
    var alamat = S(printdata).between('ALAMAT         :', 'B.ADMINISTRASI').s.trim();
    var standmeter = S(printdata).between('STAND METER    :', 'ADMIN BANK').s.trim();
    var pemakaian = S(printdata).between('PEMAKAIAN      :', 'M3').s.trim();
    var blok1 = S(printdata).between('BLOK 1         : Rp', ',00').s.trim();
    blok1 = parseInt(S(blok1).replaceAll('.', '').s);
    var blok2 = S(printdata).between('BLOK 2         : Rp', ',00').s.trim();
    blok2 = parseInt(S(blok2).replaceAll('.', '').s);
    var administrasi = S(printdata).between('B.ADMINISTRASI : Rp', ',00').s.trim();
    administrasi = parseInt(S(administrasi).replaceAll('.', '').s);
    var meterair = S(printdata).between('B.METER AIR    : Rp', ',00').s.trim();
    meterair = parseInt(S(meterair).replaceAll('.', '').s);
    var materai = S(printdata).between('MATERAI        : Rp', ',00').s.trim();
    materai = parseInt(S(materai).replaceAll('.', '').s);
    var biayaKeterlamatan = S(printdata).between('B.KETERLAMBATAN: Rp', ',00').s.trim();
    biayaKeterlamatan = parseInt(S(biayaKeterlamatan).replaceAll('.', '').s);
    var adminBank = S(printdata).between('ADMIN BANK     : Rp', ',00').s.trim();
    adminBank = parseInt(S(adminBank).replaceAll('.', '').s);
    var totalbayar = S(printdata).between('TOTAL TAGIHAN  : Rp', ',00').s.trim();
    totalbayar = parseInt(S(totalbayar).replaceAll('.', '').s);

    var reff = S(printdata).between('MKM REF        :', 'PDAM').s.trim();
    var resp = {
        idpel: idpel,
        nama: nama,
        alamat: alamat,
        stndmeter: standmeter,
        pakai: pemakaian + ' M3',
        blok1: blok1,
        blok2: blok2,
        administrasi: administrasi,
        meterair: meterair,
        maretai: materai,
        bealambat: biayaKeterlamatan,
        adminbank: adminBank,
        totalbayar: totalbayar,
        reff: reff
    }

    return resp;
}

utils.getPeriodePDAM = (req, resp) => {
    var periode = '';
    var adminbank = 0;
    var denda = 0;
    var tagihan = 0;
    var pemakaian = 0;
    var meterawal = '0';
    var meterakhir = '0';
    var alamat = "";
    var tag = '/';
    for (var i = 0; i < resp.data.tagihan.length; i++) {
        if (i == 0) {
            meterawal = resp.data.tagihan[0].meterAwal;
        }
        if (i == resp.data.tagihan.length - 1) {
            meterakhir = resp.data.tagihan[i].meterAkhir;
        }
        if (i == resp.data.tagihan.length - 1) {
            tag = '';
        }
        alamat = resp.data.tagihan[0].alamat;
        periode = periode + resp.data.tagihan[i].periode + tag;
        pemakaian += resp.data.tagihan[i].pemakaian;
        adminbank += parseInt(resp.data.tagihan[i].admin);
        //console.log(adminbank);
        denda += parseInt(resp.data.tagihan[i].penalty);
        tagihan += parseInt(resp.data.tagihan[i].nilaiTagihan);
    }
    var hasil = { alamat: alamat, periode: periode, admin: adminbank, tagihan: tagihan, denda: denda, pemakaian: pemakaian, stanmeter: meterawal.toString() + '-' + meterakhir.toString() };
    return hasil;
}

utils.getPeriodePLN = (req, resp) => {
    var periode = '';
    var denda = 0;
    var adminbank = 0;
    var tagihan = 0;
    var meterawal = '0';
    var meterakhir = '0';
    var tag = '/';
    for (var i = 0; i < resp.data.detilTagihan.length; i++) {
        if (i == 0) {
            meterawal = resp.data.detilTagihan[0].meterAwal;
        }
        if (i == resp.data.detilTagihan.length - 1) {
            meterakhir = resp.data.detilTagihan[i].meterAkhir;
        }
        if (i == resp.data.detilTagihan.length - 1) {
            tag = '';
        }
        periode = periode + resp.data.detilTagihan[i].periode + tag;
        denda = denda + resp.data.detilTagihan[i].denda;
        adminbank = adminbank + resp.data.detilTagihan[i].admin;
        tagihan = tagihan + parseInt(resp.data.detilTagihan[i].nilaiTagihan);
    }
    var hasil = { periode: periode, admin: adminbank, tagihan: tagihan, denda: denda, stanmeter: meterawal + '-' + meterakhir };
    return hasil;
}

utils.getPeriodeTelkom = (req, resp) => {
    var periodetelkom;
    var adminbank;
    var tagihan;
    for (var i = 0; i < resp.data.tagihan.length; i++) {
        periodetelkom = periodetelkom + resp.data.tagihan[i].periode;
        adminbank = adminbank + resp.data.tagihan[i].admin;
        tagihan = tagihan + resp.data.tagihan[i].total;
    }
    var hasil = { jml: resp.data.tagihan.length, periode: periodetelkom, admin: adminbank, tagihan: tagihan };
    return hasil;
}

utils.getTerminal = (req, idproduk, tujuan, idreseller) => {

    var hasil = { idterminal: -1, namaterminal: '' };
    return new Promise(async function (resolve, reject) {
        try {
            let pt = await utils.runQuerySelectPromise(req, "select pt.idterminal,t.namaterminal,pt.hargabeli from produkterminal pt left join terminal t on pt.idterminal=t.idterminal where pt.idproduk=? and pt.aktif=1 order by t.logterakhir desc limit 1", [idproduk]);
            hasil = { idterminal: pt[0].idterminal, namaterminal: pt[0].namaterminal, hargabeli: pt[0].hargabeli };
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
}

utils.getkodesuplier = (req, idproduk, idterminal) => {

    var hasil = { kodesuplier: "", hargabeli: 0 };
    return new Promise(async function (resolve, reject) {
        try {
            let pt = await utils.runQuerySelectPromise(req, "select formatkeluar,hargabeli from produkterminal where idproduk=? and idterminal=?", [idproduk, idterminal]);
            let terminal = await utils.runQuerySelectPromise(req, "select namauser from terminal where idterminal=?", [idterminal])
            hasil = { kodesuplier: pt[0].formatkeluar, hargabeli: pt[0].hargabeli, user: terminal[0].namauser };
            resolve(hasil);
        } catch (error) {
            console.log(error);
            resolve(hasil);
        }
    });
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
            let row = await utils.runQuerySelectPromise(req, "select tambahanhargaupline from masterreseller where idreseller=?", [idreseller])
            hasil = row[0].tambahanhargaupline;

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
                paramidupline = row[0].idupline;

                while (keluar == false) {
                    let row = await utils.runQuerySelectPromise(req, "select idupline from masterreseller where idreseller=?", [paramidupline])
                    if (row[0].idupline == '-') {
                        keluar = true;
                        tambahan = await utils.getselisih(req, paramidupline);
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
                    //console.log(row[0].saldo);
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

utils.TotalQuota = (req, idproduk, idreseller, hargajualreseller, priceplan) => {

    var hasil = hargajualreseller;
    return new Promise(async function (resolve, reject) {
        try {
            let row = await utils.runQuerySelectPromise(req, "select sum(qs.quota*dt.hargajual) as quota from quotareseller qs left join detailkelompokharga dt on dt.idproduk=qs.idproduk where qs.idreseller=? and dt.idkelompokharga=?", [idreseller, priceplan])
            if (row.length > 0) {
                if (row[0].quota > 0) {
                    let rowx = await utils.runQuerySelectPromise(req, "select quota from quotareseller where idproduk=? and idreseller=?", [idproduk, idreseller])
                    if (rowx.length > 0) {
                        hasil = hargajualreseller;
                    } else {
                        hasil = row[0].quota;
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

utils.generateNumber10 = () => {

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

utils.generatePIN = () => {

    var idinbox = 0;
    idinbox = Math.floor(Math.random() * Math.floor(9999));
    idinbox = pad(idinbox.toString(), 4, { 'lpad': '0' });
    return idinbox;
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


module.exports = utils;
