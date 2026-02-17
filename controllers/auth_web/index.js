const utilirs = require("../utils_v9");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma.js");
const md5 = require("md5");
const axios = require("axios");

var newOTP = require("otp-generators");
const crypto = require("crypto");

const api = require("../../lib/serverUtamaClient.js");

require("dotenv").config();

var admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../../firebase-key.json")),
  });
}

const sendPush = async (req, res) => {
  try {
    const { uuid, title, pesan } = req.query;

    if (!uuid || !title || !pesan) {
      return res.status(400).json({
        success: false,
        msg: "uuid, title dan pesan wajib diisi",
      });
    }

    // Ambil device berdasarkan appid
    const devices = await prisma.fcmDevice.findMany({
      where: {
        appid: uuid,
      },
      select: {
        regtoken: true,
      },
    });

    console.log(devices)
    if (!devices.length) {
      return res.status(404).json({
        success: false,
        msg: "Device tidak ditemukan",
      });
    }

    // Kirim ke semua device user tsb
    const tokens = devices.map((d) => d.regtoken);

    const message = {
      notification: {
        title,
        body: pesan,
      },
      tokens, // multiple send
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("Push success:", response.successCount);

    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error("FCM error:", error);
    return res.status(500).json({
      success: false,
      msg: "Error sending message",
    });
  }
};


const key = process.env.SECRET; // Key for cryptograpy. Keep it secret

function sendSMS(phone, msg) {
  async function sendotps(req, res) {
    try {




      const send = await axios.get(
        `http://45.32.126.16:9500/kirim-pesan?tujuan=${phone}&pesan=${msg}&key=djshdjsahdjshdjsakehyeu2y3e28ndc9832983`,
      );



    } catch (error) {
      console.log(error);
    }
  }
  sendotps();
}

function createNewOTP(phone) {
  // Generate a 6 digit numeric OTP

  const otp = newOTP.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChar: false,
  });
  const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
  const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
  const data = `${phone}.${otp}.${expires}`; // phone.otp.expiry_timestamp
  const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
  const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
  // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
  // sendSMS(phone, `Your O T P is ${otp}. it will expire in 5 minutes lazimpay`);
  console.log("otp dev", otp);
  return fullHash;
}

function hashingNewpin(phone) {
  // Generate a 6 digit numeric OTP

  const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
  const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
  const data = `${phone}.${expires}`; // phone.otp.expiry_timestamp
  const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
  const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
  // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS

  return fullHash;
}

function verifyHshingNewPin(phone, hash) {
  // Seperate Hash value and expires from the hash returned from the user

  let splte = hash.split(".");
  let hashValue = splte[0];
  let expires = splte[1];
  // let [hashValue, expires] = hash.split(".");

  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) return false;
  // Calculate new hash with the same key and the same algorithm
  let data = `${phone}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    return true;
  }
  return false;
}

function verifyOTP(phone, hash, otp) {
  // Seperate Hash value and expires from the hash returned from the user

  let splte = hash.split(".");
  let hashValue = splte[0];
  let expires = splte[1];
  // let [hashValue, expires] = hash.split(".");

  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) return false;
  // Calculate new hash with the same key and the same algorithm
  let data = `${phone}.${otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    return true;
  }
  return false;
}
const loginWebTrx = async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  //console.log(req.body);
  try {
    const login = await api.post("reseller/login", {
      username,
      password,
    });

    res.json({
      success: true,
      idreseller: login.data.reseller.id,
      namareseller: login.data.reseller.name,
      token: login.data.accessToken,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "user atau password salah" });
    return;
  }
};

const loginByPhoneV2 = async (req, res) => {
  try {
    var hp = req.body.nohp;
    var pin = req.body.pin;

    if (hp == undefined || pin == undefined) {
      res.json({
        success: false,
        msg: "No Hp dan Pin Tidak Boleh Kosong",
      });
      return;
    }

    if (hp == "" || pin == "") {
      res.json({
        success: false,
        msg: "No Hp dan Pin Tidak Boleh Kosong",
      });

      return;
    }

    // kirim ke Api cek hp terdaftar
    // var datars = await utilirs.runQuerySelectPromise(
    //   req,
    //   "select r.idreseller,r.alias, r.namareseller,r.saldo,r.ipstatic,r.email,r.ipstatic,r.poin,r.komisi,r.patokanhargajual,r.tipe,r.blokir,r.alamatreseller from masterreseller r left join hptrx h on r.idreseller=h.idreseller where h.hp=aes_encrypt(?,password((select jalurharga from info))) and r.pin=aes_encrypt(?,password((select jalurharga from info)))",
    //   [hp, pin]
    // );
    const cekhp = await api.post("reseller/login-pin", {
      sender: hp,
      id: hp,
      pin: pin,
      type: "PHONE",
    });

    if (!cekhp.data.success) {
      return res.json({
        success: false,
        msg: "No Hp tidak terdaftar",
      });
    }

    // lalu jika terdaftar kirim otp

    try {
      let hash = createNewOTP(hp);
      // console.log(hash);
      res.json({
        success: false,
        otp: true,
        hash: hash,
        msg: "OTP Telah dikirim",
      });
      //res.json({ success: true, msg: "valid" });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        msg: "Terjadi kesalahan, hubungi customerservice",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const loginByPhone = async (req, res) => {
  var hp = req.body.nohp;
  var pin = req.body.pin;
  var uuidClient = req.body.uuid;
  const otp = req.body.otp;

  if (hp == "" || pin == "") {
    res.json({
      success: false,
      msg: "No Hp dan Pin Tidak Boleh Kosong",
    });

    return;
  }

  try {
    const uuidServer = md5(process.env.SECRET + hp + pin);

    const cekhp = await api.post("/reseller/login-pin", {
      sender: hp,
      id: hp,
      pin: pin,
      type: "PHONE",
    });

    if (cekhp.data.success) {
      try {
        if (uuidServer == uuidClient) {
          var uuid = "app:" + uuidServer;

          let cekdata = await api.post("/reseller/check-deviceid", {
            sender: uuid,
            id: uuid,
            type: "APP",
          });
          if (!cekdata.data.registered) {
            let hash = createNewOTP(hp);
            console.log(hash);
            res.json({
              success: false,
              otp: true,
              hash: hash,
              msg: "OTP Telah dikirim",
            });
            return;
          }

          var user = {
            idreseller: cekdata.data.resellerId,
            namareseller: cekdata.data.resellerName,
            uuid: uuidServer,
          };
          //res.json({ success: true, otp: false, msg: "login sukses" });
          var token = jwt.sign(user, process.env.SECRET, {
            expiresIn: "12d",
          });

          res.json({
            success: true,
            idreseller: cekdata.data.resellerId,
            namareseller: cekdata.data.resellerName,
            kodereferral: cekdata.data.referralCode,
            uuid: uuidServer,
            token: token,
          });
        } else {
          //console.log(uuidServer);

          res.json({
            success: false,
            otp: true,
            hash: hash,
            msg: "OTP Telah dikirim",
          });
        }

        //res.json({ success: true, msg: "valid" });
      } catch (error) {
        console.log(error);
        res.json({
          success: false,
          msg: "Terjadi kesalahan, hubungi customerservice",
        });
      }
    } else {
      res.json({
        success: false,
        msg: "No Hp Tidak terdaftar",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const otpVerifyV2 = async (req, res) => {
  let phone = req.body.nohp;
  let pin = req.body.pin;
  let hash = req.body.hash;
  let otp = req.body.otp;
  let deviceId = req.body.deviceId;

  try {
    // akun demo
    let hasil;
    if (phone == "087870266669" && pin == "123456" && otp == "112233") {
      hasil = true;
    } else hasil = verifyOTP(phone, hash, otp);

    //const hasil = verifyOTP(phone, hash, otp);
    if (hasil == true) {
      const uuidServer = md5(process.env.SECRET + phone + deviceId);
      const uuidencoded =
        "lazimpro-" + Buffer.from(uuidServer, "utf8").toString("base64");
      const apikey = md5(process.env.SERVER_KEY + uuidencoded + deviceId);
      const Newhash = crypto
        .createHmac("sha256", key)
        .update(apikey)
        .digest("hex");

      const login = await api.post("/reseller/login-pin", {
        sender: phone,
        id: phone,
        pin,
        type: "PHONE",
      });
      let idreseller = login.data.resellerId;
      if (login.data.success) {
        var uuid = "app:" + uuidencoded;
        let cekdata = await api.post("/reseller/check-deviceid", {
          sender: phone,
          id: uuid,
          pin,
          type: "APP",
        });
        if (!cekdata.data.registered) {
          let addDevice = await api.post("/reseller/add-deviceid", {
            sender: phone,
            identifier: uuid,
            resellerId: idreseller,
            type: "APP",
          });

          if (!addDevice.data.success) {
            return res.json({
              success: false,
              msg: "Gagal menambahkan device",
            });
          }
        }
        var user = {
          idreseller: idreseller,
          namareseller: cekdata.data.resellerName,
        };

        //res.json({ success: true, otp: false, msg: "login sukses" });
        var token = jwt.sign(user, process.env.SECRET, {
          expiresIn: "1d",
        });

        res.json({
          success: true,
          idreseller: idreseller,
          uuid: uuidencoded,
          namareseller: cekdata.data.resellerName,
          kodereferral: cekdata.data.referralCode,
          token: token,
          apikey: Newhash,
        });
      } else {
        res.json({
          success: false,
          msg: "PIN atau Nomor Hp salah",
        });
      }
    } else {
      res.json({
        success: false,
        msg: "Otp Salah atau kadaluarsa",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const otpVerify = async (req, res) => {
  let phone = req.body.nohp;
  let pin = req.body.pin;
  let hash = req.body.hash;
  let otp = req.body.otp;

  {
  }
};

const forgotPinRec = async (req, res) => {
  try {
    let hp = req.body.nohp;
    let cekdata = await api.post("/reseller/check-deviceid", {
      sender: hp,
      id: hp,
      type: "PHONE",
    });
    if (cekdata.data.registered && hp.length > 9) {
      let hash = createNewOTP(hp);
      console.log(hash);
      res.json({
        success: true,
        nohp: hp,
        hash: hash,
        msg: "OTP Telah dikirim",
      });
    } else {
      res.json({
        success: false,
        msg: "Nomor Handphone tidak terdaftar",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const forgotPinVerifyOtp = async (req, res) => {
  try {
    let hp = req.body.nohp;
    let hash = req.body.hash;
    let otp = req.body.otp;
    let cekdata = await api.post("/reseller/check-deviceid", {
      sender: hp,
      id: hp,
      type: "PHONE",
    });

    if (cekdata.data.registered) {
      let idreseller = cekdata.data.resellerId;

      const cekotp = verifyOTP(hp, hash, otp);
      if (cekotp) {
        let newhas = hashingNewpin(hp);

        return res.json({
          success: true,
          idreseller: idreseller,
          namareseller: cekdata.data.resellerName,
          msg: "Otp Sesuai, Silakan ubah Pin Anda",
          nohp: hp,
          key: newhas,
        });
      }
      return res.json({
        success: false,
        msg: "Otp Yang Anda masukkan salah",
      });
    } else {
      res.json({
        success: false,
        msg: "Nomor Handphone tidak terdaftar",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const forgotPinFinal = async (req, res) => {
  const keyup = req.body.key;
  const hp = req.body.nohp;
  const newpin = req.body.pinbaru;
  const pinconf = req.body.pinconf;

  try {
    const hashing = verifyHshingNewPin(hp, keyup);

    if (hashing == false) {
      return res.json({
        success: false,
        msg: "Waktu Ubah Pin Kadaluarsa",
      });
    }

    if (newpin == pinconf) {
      let cekdata = await api.post("/reseller/check-deviceid", {
        sender: hp,
        id: hp,
        type: "PHONE",
      });
      if (cekdata.data.registered) {
        let gantipin = await api.post("/reseller/change-pin-forgot", {
          sender: hp,
          newPin: newpin,
        });

        if (gantipin.data.success) {
          return res.json({ success: true, msg: "PIN Berhasil diganti" });
        }
        return res.json({ success: false, msg: "PIN gagal diganti" });
      } else {
        res.json({
          success: false,
          msg: "Nomor Hp Tidak Terdaftar",
        });
      }
    } else {
      res.json({
        success: false,
        msg: "PIN baru harus sama dengan PIN konfirm",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const validasiTokenV2 = async (req, res) => {
  try {
    let token = req.body.token;
    let uuid = req.body.uuid;
    let appid = "app:" + uuid;
    let deviceId = req.body.deviceId;
    let apikey = req.body.apikey;
    let state = true;

    const apikeyServer = md5(process.env.SERVER_KEY + uuid + deviceId);
    const hash = crypto
      .createHmac("sha256", key)
      .update(apikeyServer)
      .digest("hex");
    console.log(hash);
    console.log(apikey);
    if (apikey !== hash) {
      res.json({ success: false, msg: "apikey tidak valid" });
      return;
    }

    try {
      jwt.verify(token, process.env.SECRET);
    } catch {
      return res.json({ success: false, msg: "Token Anda tidak valid" });
    }

    let cekdata = await api.post("/reseller/check-deviceid", {
      sender: appid,
      id: appid,
      type: "APP",
    });
    if (cekdata.data.registered) {
      var user = {
        idreseller: cekdata.data.resellerId,
        namareseller: cekdata.data.resellerName,
        uuid,
      };
      var newtoken = jwt.sign(user, process.env.SECRET, {
        expiresIn: "1d",
      });

      res.json({
        success: true,
        idreseller: cekdata.data.resellerId,
        namareseller: cekdata.data.resellerName,
        token: newtoken,
        kodereferral: cekdata.data.referralCode,
        uuid,
        apikey: hash,
      });
    } else {
      res.json({ success: false, msg: "Id Tidak terdaftar" });
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: "erorr" });
    return;
  }
};
const validasiToken = async (req, res) => {
  try {
    let token = req.body.token;
    let uuid = req.body.uuid;
    let appid = "app:" + uuid;
    let state = true;

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) {
        state = false;
        res.json({ success: false, msg: "Token Anda  tidak Valid 1" });
        return;
      }
    });
    if (state == true) {
      let cekdata = await api.post("/api/reseller/check-deviceid", {
        sender: appid,
        id: appid,
        type: "APP",
      });
      if (cekdata.data.registered) {
        var user = {
          idreseller: cekdata.data.resellerId,
          namareseller: cekdata.data.resellerName,
          uuid,
        };
        var newtoken = jwt.sign(user, process.env.SECRET, {
          expiresIn: "1d",
        });
      }
      let secretKey = md5(process.env.SECRET + uuid).toLowerCase();
      res.json({
        success: true,
        idreseller: cekdata.data.resellerId,
        namareseller: cekdata.data.resellerNamer,
        token: newtoken,
        kodereferral: cekdata.data.referralCode,
        uuid,
        secretKey,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: "Token Anda  tidak Valid 3" });
    return;
  }
};

const LoginNewSession = async (req, res) => {
  try {
    let uuid = req.body.uuid;
    let appid = "app:" + uuid;
    let deviceId = req.body.deviceId;
    let apikey = req.body.apikey;
    let pin = req.body.pin;
    const apikeyServer = md5(process.env.SERVER_KEY + uuid + deviceId);
    const hash = crypto
      .createHmac("sha256", key)
      .update(apikeyServer)
      .digest("hex");
    if (apikey == hash) {
      const login = await api.post("/reseller/login-pin", {
        sender: appid,
        id: appid,
        pin,
        type: "APP",
      });
      if (login.data.registered) {
        var user = {
          idreseller: login.data.resellerId,
          namareseller: login.data.resellerName,
          uuid,
        };
        var newtoken = jwt.sign(user, process.env.SECRET, {
          expiresIn: "1d",
        });
        res.json({
          success: true,
          idreseller: login.data.resellerId,
          namareseller: login.data.resellerName,
          token: newtoken,
          kodereferral: login.data.referralCode,
          uuid,
          apikey: hash,
        });
      } else {
        res.json({ success: false, msg: "PIn Atau id Anda salah" });
        return;
      }
    } else {
      res.json({ success: false, msg: "Apikey tidak valid" });
      return;
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: "Terjadi Kesalahan" });
    return;
  }
};

const callBackLinqu = async (req, res) => {};

function generateUsername(base) {
  if (!base) return "user" + Math.floor(1000 + Math.random() * 9000);

  // normalisasi
  let clean = base
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // ambil max 2 kata pertama
  const parts = clean.split(" ").slice(0, 2);
  let usernameBase = parts.join("");

  // potong max 10 char biar pendek
  usernameBase = usernameBase.slice(0, 10);

  // angka random 2–3 digit
  const rand = Math.floor(10 + Math.random() * 900);

  return `${usernameBase}${rand}`;
}

const RegisterUSer = async (req, res) => {
  // var uuid = "app:" + req.body.uuid;
  var namatoko = req.body.namatoko;
  var nohp = req.body.nohp;
  var alamat = req.body.alamat;
  var nama_pemilik = req.body.nama;
  var pin = req.body.pin;
  var pinconfirmasi = req.body.pinkonfirmasi;
  // var email = req.body.email;

  let ref = req.body.koderef || null;
  let kodeReferral = ref ? ref.toUpperCase() : null;
  const usernameAuto = generateUsername(nama_pemilik || namatoko);
  // var upline_reg = req.body.upline;
  let username = req.body.username || usernameAuto;
  try {
    if (pin != pinconfirmasi) {
      res.json({ success: false, msg: "Konfirmasi PIN Harus sama" });
      return;
    }

    const datareg = {
      name: nama_pemilik,
      storeName: namatoko,
      username: username,
      password: req.body.password || "123456",
      referralCode: kodeReferral,
      pin: pin,
      phonenumber: nohp,
      address: alamat,
    };

    let regis = true;
    let reqRes;
    try {
      reqRes = await api.post("reseller/register", {
        ...datareg,
        sender: nohp,
      });
    } catch (error) {
      console.log(error);
      regis = false;
    }
    if (regis) {
      var datars = {
        idreseller: reqRes.data.reseller.id,
        idupline: reqRes.data.reseller.parentId,
        namareseller: reqRes.data.reseller.storeName,
        alamatreseller: reqRes.data.reseller.address,
        namapemilik: reqRes.data.reseller.name,
        username: username,
        alias: reqRes.data.reseller.referralCode,
      };

      res.json({ success: true, msg: "registrasi berhasil", datareg: datars });
      return;
    }

    res.json({ success: true, msg: "registrasi Gagal " });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "registrasi error" });
    return;
  }
};

module.exports = {
  loginByPhoneV2,
  otpVerifyV2,
  validasiTokenV2,
  LoginNewSession,
  RegisterUSer,
  loginWebTrx,
  validasiToken,
  loginByPhone,
  otpVerify,
  forgotPinRec,
  forgotPinVerifyOtp,
  forgotPinFinal,
  callBackLinqu,
  sendPush,
};
