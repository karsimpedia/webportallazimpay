

"use strict";
const controllerX = {};
var utilirs = require('./utils_v9');


controllerX.listhadiah = async (req, res) => {

    var uuid = "app:" + req.query.uuid;

    try {
        var datars = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?", uuid);
        if (datars.length > 0) {
            let hadiahdata = await utilirs.runQuerySelectPromise(req, "select idhadiahpoin,idhadiahpoin as idreward,nomor,jumlahpoint as jumlahpoin,hadiah,imgurl,jenishadiah from hadiahpoin  limit 20");
            if (hadiahdata.length > 0) {
                res.json({ success: true, data: hadiahdata });
            } else {
                res.json({ success: false, data: [] });
            }

        } else {
            res.json({ success: false, msg: "akun tidak ditemukan" });
        }
    } catch (error) {
        console.log(error);
        res.send("OKE");
    }
}

controllerX.redeemNow = async (req, res) => {
    console.log(req.body);
    var uuid = 'app:' + req.body.uuid;
    var idhadiah = req.body.idhadiah;

    let rows = await utilirs.runQuerySelectPromise(req, "SELECT r.idreseller, r.namareseller, r.poin FROM MasterReseller r left join hptrx h on r.idreseller=h.idreseller WHERE h.hp=aes_encrypt(?,password((select jalurharga from info)))", [uuid]);
    if (rows.length > 0) {
        var idrs = rows[0].idreseller;
        var poin = rows[0].poin;

        let rows2 = await utilirs.runQuerySelectPromise(req, "select *  from hadiahpoin where idhadiahpoin = ?", [idhadiah]);
        if (rows2.length > 0) {
            var nomor = rows2[0].nomor;
            var jumlahpoint = rows2[0].jumlahpoint;

            if (parseInt(poin) < parseInt(jumlahpoint)) {
                res.json({
                    success: false,
                    rc: '43',
                    msg: 'Poin Tidak Cukup'
                });
                return;
            }
            await utilirs.runQuerySelectPromise(req, "UPDATE `masterreseller` set poin = (poin-?) where idreseller = ?", [jumlahpoint, idrs]);
            await utilirs.runQuerySelectPromise(req, "INSERT INTO `penukaranhadiah` (`Tanggal`, `Jam`, `IDRESELLER`, `nomor`, `status`, `tanggalproses`) VALUES (current_date(), current_time(), ?, ?, 0, NULL)", [idrs, nomor, idhadiah]);
            res.json({
                success: false,
                rc: '00',
                msg: 'Penukaran poin sedang proses'
            }); return;
        }
    } else {
        res.json({
            success: false,
            rc: '43',
            msg: 'data tidak ditemukan'
        });
        return;
    }
}

controllerX.getRewards = async (req, res) => {

    var uuid = 'app:' + req.query.uuid;
    var histories = [];
    var counter = 0;
    var rows = await utilirs.runQuerySelectPromise(req, "SELECT r.saldo, r.namareseller, r.idreseller FROM MasterReseller r left join hptrx h on r.idreseller=h.idreseller WHERE r.Aktif='1' AND h.hp=aes_encrypt(?,password((select jalurharga from info))) and h.tipe=4", [uuid]);
    if (rows.length > 0) {
        var idrs = rows[0].idreseller;
        var rows2 = await utilirs.runQuerySelectPromise(req, "SELECT concat(ph.tanggal,' ',ph.jam) as waktu, if(ph.status=1,'SUKSES',if(ph.status=2,'GAGAL','PROSES')) as statustext,status, h.hadiah, h.imgurl, h.jumlahpoint FROM penukaranhadiah ph left join hadiahpoin h on ph.nomor = h.nomor WHERE ph.idreseller=? ORDER BY waktu desc limit 20", [idrs]);
        if (rows2.length > 0) {
            rows2.forEach(function (value, i) {
                histories.push({
                    waktu: value.waktu,
                    hadiah: value.hadiah,
                    poin: value.jumlahpoint,
                    imgurl: value.imgurl,
                    status: value.status,
                    statustext: value.statustext
                });

                counter++;
            });
            res.json({
                success: true,
                rc: '00',
                data: { total: counter, histories: histories },
                msg: 'Daftar redeem'
            });
        } else {
            res.json({
                success: true,
                rc: '00',
                data: { total: 0, histories: histories },
                msg: 'Daftar redeem kosong'
            });
        }
    } else {
        res.json({
            success: true,
            rc: '00',
            data: { total: 0, histories: histories },
            msg: 'Daftar redeem kosong'
        });
    }

}

module.exports = controllerX;