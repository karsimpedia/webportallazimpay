require("dotenv").config();
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma.js");
const md5 = require("md5");
const axios = require("axios");
const { sendOtp } = require("../../lib/sendOtp.js");
var newOTP = require("otp-generators");
const crypto = require("crypto");
const api = require("../../lib/serverUtamaClient.js");

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../../firebase-key.json")),
  });
}

const toStr = (v, def = "") => {
  if (v === null || v === undefined) return def;
  return String(v);
};

const sendPush = async (req, res) => {
  try {
    const body = {
      ...(req.query || {}),
      ...(req.body || {}),
    };

    const {
      appid,
      title,
      pesan,
      image,

      page = "detail",
      trxId = "",
      invoiceId = "",
      status = "",
      msisdn = "",
      productCode = "",
      resellerId = "",
      sender = "",
      sn = "",
      amount = "",
      openAmount = "",
      amountDue = "",
      supplierPrice = "",
      message = "",
      createdAt = "",
    } = body;

    if (!appid || !title || !pesan) {
      return res.status(400).json({
        success: false,
        msg: "appid, title dan pesan wajib diisi",
      });
    }

    const devices = await prisma.fcmDevice.findMany({
      where: {
        appid: toStr(appid),
      },
      select: {
        regtoken: true,
        deviceId: true,
      },
    });

    if (!devices.length) {
      return res.status(404).json({
        success: false,
        msg: "Device tidak ditemukan",
      });
    }

    const tokens = [...new Set(devices.map((d) => d.regtoken).filter(Boolean))];

    if (!tokens.length) {
      return res.status(404).json({
        success: false,
        msg: "Token kosong",
      });
    }

    const imageUrl = image ? String(image).trim() : "";

    const messagePayload = {
      notification: {
        title: toStr(title),
        body: toStr(pesan),
        ...(imageUrl ? { imageUrl } : {}),
      },
      data: {
        page: toStr(page, "detail"),
        title: toStr(title),
        pesan: toStr(pesan),
        screen: toStr(page, "detailtrx"),
        trxId: toStr(trxId),
        invoiceId: toStr(invoiceId),
        status: toStr(status),
        msisdn: toStr(msisdn),
        productCode: toStr(productCode),
        resellerId: toStr(resellerId),
        sender: toStr(sender),
        sn: toStr(sn),
        amount: toStr(amount),
        openAmount: toStr(openAmount),
        amountDue: toStr(amountDue),
        supplierPrice: toStr(supplierPrice),
        message: toStr(message),
        createdAt: toStr(createdAt),

        ...(imageUrl ? { image: imageUrl } : {}),
      },
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          ...(imageUrl ? { imageUrl } : {}),
        },
      },
      tokens,
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(messagePayload);

    const invalidCodes = [
      "messaging/invalid-registration-token",
      "messaging/registration-token-not-registered",
    ];

    const invalidTokens = response.responses
      .map((r, i) => {
        if (!r.success && invalidCodes.includes(r.error?.code)) {
          return tokens[i];
        }
        return null;
      })
      .filter(Boolean);

    if (invalidTokens.length) {
      await prisma.fcmDevice.deleteMany({
        where: {
          regtoken: {
            in: invalidTokens,
          },
        },
      });
    }

    return res.json({
      success: true,
      appid: toStr(appid),
      totalDevice: devices.length,
      totalToken: tokens.length,
      sent: response.successCount,
      failed: response.failureCount,
      invalidRemoved: invalidTokens.length,
      dataSent: {
        trxId: toStr(trxId),
        invoiceId: toStr(invoiceId),
        status: toStr(status),
        msisdn: toStr(msisdn),
        productCode: toStr(productCode),
      },
    });
  } catch (error) {
    console.error("FCM error:", error);
    return res.status(500).json({
      success: false,
      msg: error?.message || "Error sending message",
    });
  }
};

const chunkArray = (arr = [], size = 500) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const sendBroadcastNotification = async (req, res) => {
  try {
    const body = {
      ...(req.query || {}),
      ...(req.body || {}),
    };

    const {
      title,
      pesan,
      image = "",
      target = "all", // all | appid
      appids = [],

      page = "homepage",
      trxId = "",
      invoiceId = "",
      status = "",
      msisdn = "",
      productCode = "",
      resellerId = "",
      sender = "",
      sn = "",
      amount = "",
      openAmount = "",
      amountDue = "",
      supplierPrice = "",
      message = "",
      createdAt = "",
    } = body;

    if (!title || !pesan) {
      return res.status(400).json({
        success: false,
        msg: "title dan pesan wajib diisi",
      });
    }

    let where = {};

    if (target === "appid") {
      const cleanAppids = Array.isArray(appids)
        ? appids.map((x) => toStr(x).trim()).filter(Boolean)
        : [];

      if (!cleanAppids.length) {
        return res.status(400).json({
          success: false,
          msg: "appids wajib diisi jika target=appid",
        });
      }

      where.appid = {
        in: cleanAppids,
      };
    }

    const devices = await prisma.fcmDevice.findMany({
      where,
      select: {
        id: true,
        appid: true,
        regtoken: true,
        deviceId: true,
      },
    });
console.log(devices)
    if (!devices.length) {
      return res.status(404).json({
        success: false,
        msg: "Device tidak ditemukan",
      });
    }

    const tokens = [...new Set(devices.map((d) => d.regtoken).filter(Boolean))];

    if (!tokens.length) {
      return res.status(404).json({
        success: false,
        msg: "Token kosong",
      });
    }

    const imageUrl = toStr(image).trim();
    const tokenChunks = chunkArray(tokens, 500);

    let totalSuccess = 0;
    let totalFailed = 0;
    let invalidTokens = [];

    for (const tokenChunk of tokenChunks) {
      const messagePayload = {
        notification: {
          title: toStr(title),
          body: toStr(pesan),
          ...(imageUrl ? { imageUrl } : {}),
        },
        data: {
          page: toStr(page, "homepage"),
          title: toStr(title),
          pesan: toStr(pesan),
          body: toStr(pesan),
          screen: toStr(page, "homepage"),

          trxId: toStr(trxId),
          invoiceId: toStr(invoiceId),
          status: toStr(status),
          msisdn: toStr(msisdn),
          productCode: toStr(productCode),
          resellerId: toStr(resellerId),
          sender: toStr(sender),
          sn: toStr(sn),
          amount: toStr(amount),
          openAmount: toStr(openAmount),
          amountDue: toStr(amountDue),
          supplierPrice: toStr(supplierPrice),
          message: toStr(message),
          createdAt: toStr(createdAt),

          ...(imageUrl ? { image: imageUrl } : {}),
        },
        android: {
          priority: "high",
          notification: {
            channelId: "default",
            ...(imageUrl ? { imageUrl } : {}),
          },
        },
        tokens: tokenChunk,
      };

      const response = await admin
        .messaging()
        .sendEachForMulticast(messagePayload);

      totalSuccess += response.successCount;
      totalFailed += response.failureCount;

      const invalidCodes = [
        "messaging/invalid-registration-token",
        "messaging/registration-token-not-registered",
      ];

      const chunkInvalid = response.responses
        .map((r, i) => {
          if (!r.success && invalidCodes.includes(r.error?.code)) {
            return tokenChunk[i];
          }
          return null;
        })
        .filter(Boolean);

      invalidTokens.push(...chunkInvalid);
    }

    invalidTokens = [...new Set(invalidTokens)];

    if (invalidTokens.length) {
      await prisma.fcmDevice.deleteMany({
        where: {
          regtoken: {
            in: invalidTokens,
          },
        },
      });
    }

    return res.json({
      success: true,
      msg: "Broadcast notification berhasil dikirim",
      target,
      totalDevice: devices.length,
      totalToken: tokens.length,
      totalChunk: tokenChunks.length,
      sent: totalSuccess,
      failed: totalFailed,
      invalidRemoved: invalidTokens.length,
      sampleDataSent: {
        title: toStr(title),
        pesan: toStr(pesan),
        page: toStr(page),
        image: imageUrl,
      },
    });
  } catch (error) {
    console.error("Broadcast FCM error:", error);
    return res.status(500).json({
      success: false,
      msg: error?.message || "Error sending broadcast notification",
    });
  }
};



const key = process.env.SECRET; // Key for cryptograpy. Keep it secret

function sendSMS(phone, otp) {
  async function sendotps(req, res) {
    try {
      await sendOtp(phone, otp);
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

  if (phone == "081234567890") {
    return fullHash;
  }
  sendSMS(phone, otp);
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
    console.log(req.body);
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
        msg: cekhp.data.msg,
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
    if (phone == "081234567890" && pin == "123456" && otp == "112233") {
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
      let resellerName = login.data.resellerName;
      let referralCode = login.data.referralCode;
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
          namareseller: resellerName,
          uuid: uuidencoded,
          phone: phone,
        };

        //res.json({ success: true, otp: false, msg: "login sukses" });
        var token = jwt.sign(user, process.env.SECRET, {
          expiresIn: "1d",
        });

        res.json({
          success: true,
          idreseller: idreseller,
          uuid: uuidencoded,
          namareseller: resellerName,
          kodereferral: referralCode,
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

const validasiTokenV2 = async (req, res) => {
  try {
    const { token, uuid, deviceId, apikey } = req.body;
    const appid = "app:" + uuid;

    // 🔐 Generate APIKEY SERVER
    const apikeyServer = md5(process.env.SERVER_KEY + uuid + deviceId);
    const hash = crypto
      .createHmac("sha256", key)
      .update(apikeyServer)
      .digest("hex");

    if (apikey !== hash) {
      return res.json({ success: false, msg: "apikey tidak valid" });
    }

    // 🔎 Verify + Decode Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      return res.json({
        success: false,
        msg: "Token Anda tidak valid / expired",
      });
    }

    console.log("TOKEN DECODE:", decoded);

    // 🔍 Cek device ke API
    const cekdata = await api.post("/reseller/check-deviceid", {
      sender: appid,
      id: appid,
      type: "APP",
    });

    if (!cekdata.data.registered) {
      return res.json({ success: false, msg: "Id Tidak terdaftar" });
    }

    const user = {
      idreseller: cekdata.data.resellerId,
      namareseller: cekdata.data.resellerName,
      uuid,
    };

    const newtoken = jwt.sign(user, process.env.SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      success: true,
      idreseller: user.idreseller,
      namareseller: user.namareseller,
      token: newtoken,
      kodereferral: cekdata.data.referralCode,
      uuid,
      apikey: hash,
    });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, msg: "error server" });
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
  sendBroadcastNotification,

};
