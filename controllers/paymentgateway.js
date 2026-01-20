"use strict";
const controllerX = {};
var utilirs = require('./utils_v9');
const moment = require('moment');
const md5 = require('md5');
const S = require('string');
const axios = require('axios');


controllerX.createInv = async (req, res) => {

    let tglTrx = moment().format('YYYY/MM/DD');
    let jamTrx = moment().format('HH:mm:ss');
    var uuid = "app:" + req.body.uuid;
    var amount = req.body.jumlah;
    var invx = utilirs.generateidinbox();
    var datars = await utilirs.runQuerySelectPromise(req, "select r.idreseller,r.namareseller,r.saldo from masterreseller r left join hptrx h on r.idreseller=h.idreseller where aes_decrypt(h.hp,password((select jalurharga from info)))=?", uuid);
    if (datars.length > 0) {

        var datapost = {
            "idmitra": "H00001",
            "inv": datars[0].idreseller + '-' + invx,
            "callback": "http://111.111.111.111/webportal/payment/updateva",
            "amount": amount,
            "name": datars[0].namareseller,
            "email": "panji.pramana@gmail.com",
            "desc": "topup saldo"
        }
        let resp = await axios.post("https://api.aviana.id:9192/xendit/createinv", datapost, {
            headers: {
                'accept': 'application/json',
                'accept-language': 'en_US',
                'content-type': 'application/json',
                'Authorization': 'Basic eG5kX3Byb2R1Y3Rpb25fUG95SWZMNXgzTHo2bE1VOUw3VklTVFNYWU5HcW9kUjZsSERuK1J4bi8yWFUvN3lwQ0E1K2d3PT06'
            }
        });
        console.log(resp.data);
        let datax = {
            invoice: datars[0].idreseller + '-' + invx,
            amount: amount,
            idreseller: datars[0].idreseller,
            email: "",
            description: "topup saldo",
            reff: "",
            created_at: tglTrx + ' ' + jamTrx,
            payment_code: resp.data.available_retail_outlets[0].payment_code,
            inv_url: resp.data.invoice_url

        }
        let inv = await utilirs.runQuerySelectPromise(req, "insert into topup_paymentgateway set ?", [datax]);
        res.json({ success: true, data: resp.data.invoice_url });

    } else {
        res.json({ success: false, msg: "data mitra tidak ditemukan" });
    }



}



module.exports = controllerX;