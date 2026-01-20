"use strict";
const controllerX = {};
var utilirs = require('./utils_v9');
const moment = require('moment');
const md5 = require('md5');
const S = require('string');
const axios = require('axios');
var firebaseAdmin = require('firebase-admin');

controllerX.cektoken = async (req, res) => {

    var idtoken = req.body.token;
    try {
        var datax = await firebaseAdmin.auth().verifyIdToken(idtoken)
        // console.log(datax);

        var user = await firebaseAdmin.auth().getUser(datax.uid);
        // console.log(user);

        res.json({ success: true, user: user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: error });
    }

}

controllerX.authtoken = async (req, res) => {
    console.log(req.body);

    var nohp = req.body.hp;
    var datars = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?", nohp);
    if (datars.length > 0) {
        firebaseAdmin.auth().createCustomToken(req.body.uuid).then(function (token) {
            res.json({ success: true, token: token, idrs: datars[0].idreseller, nama: datars[0].namareseller });
        }).catch(function (error) {
            res.json({ success: false, msg: "Error during token creation" });
        });
    } else {
        res.json({ success: false, msg: "Nohp tidak terdaftar" });
    }
}

controllerX.loginexistingphone = async (req, res) => {

    var idrs = req.body.idrs;
    var uuid = "app:" + req.body.uuid;

    var header = req.headers['authorization'];
    console.log(header);
    var validation = md5(process.env.SECRET + req.body.uuid).toLowerCase();
    console.log(validation);
    if (header == validation) {
        try {
            // v8 var insertUID = await utilirs.runQuerySelectPromise(req, "insert into  hptrx (idreseller,hp,jenis,tipe,lasttrx,timeadd,aktif) value (?,aes_encrypt(?,password((select jalurharga from info))),?,?,now(),now(),1)", [idrs, uuid, 4, 0]);
            var insertUID = await utilirs.runQuerySelectPromise(req, "insert into  hptrx (idreseller,hp,jenis,tipe,lasttrx,aktif) value (?,aes_encrypt(?,password((select jalurharga from info))),?,?,now(),1)", [idrs, uuid, 0, 4]);
            var datars = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo from masterreseller r left join hptrx h on r.idreseller=h.idreseller where r.idreseller=?", [idrs]);
            if (datars.length > 0) {
                res.json({ success: true, saldo: datars[0].saldo, idrs: datars[0].idreseller, nama: datars[0].namareseller });
            } else {
                res.json({ success: false, msg: "[01] Error login existing" });
            }
        } catch (error) {
            res.json({ success: false, msg: "[02] Error login existing" });
        }
    } else {
        res.json({ success: false, msg: "Authorization Error" });
    }





}


module.exports = controllerX;