const api = require("../../lib/serverUtamaClient.js");

const loginByPhoneV2 = async (req, res) => {
  try {
    const { nohp: hp, pin } = req.body;

    if (!hp || !pin) {
      return res.json({
        success: false,
        msg: "No Hp dan Pin Tidak Boleh Kosong",
      });
    }

    // 🔑 sender SEMENTARA = nohp (dinormalisasi)
    const sender = hp.replace(/^0/, "62");

    // 1️⃣ cek nohp ke SERVER UTAMA
    const cekhp = await api.post("/auth/check-phone", {
      sender,
      nohp: hp,
    });

    if (!cekhp.data?.registered) {
      return res.json({
        success: false,
        msg: "No Hp tidak terdaftar",
      });
    }

    // 2️⃣ request LOGIN PIN + OTP (BIAR SERVER UTAMA YANG BUAT OTP)
    const login = await api.post("/auth/login-pin", {
      sender,
      nohp: hp,
      pin,
    });

    if (!login.data?.otp_required) {
      return res.json({
        success: false,
        msg: login.data?.msg || "PIN salah",
      });
    }

    return res.json({
      success: true,
      otp: true,
      hash: login.data.hash,
      expired_in: login.data.expired_in,
      msg: "OTP telah dikirim",
    });
  } catch (error) {
    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      msg: "Terjadi kesalahan, hubungi customerservice",
    });
  }
};

const otpVerifyV2 = async (req, res) => {
  try {
    const { nohp, otp, hash, deviceId } = req.body;

    if (!nohp || !otp || !hash || !deviceId) {
      return res.json({
        success: false,
        msg: "Data tidak lengkap",
      });
    }

    // sender bootstrap = nohp
    const sender = nohp.replace(/^0/, "62");

    // 🔑 CALL SERVER UTAMA
    const resp = await api.post("/auth/verify-otp", {
      sender,
      nohp,
      otp,
      hash,
      device_uuid: deviceId,
    });

    // 🚀 forward response apa adanya

    return res.json({
      success: true,
      idreseller: resp.data.reseller.id,
      uuid: uuidencoded,
      namareseller: resp.data.reseller.name,
      kodereferral: resp.data.referralCode,
      token: resp.data.token,
      apikey: hash,
    });
  } catch (err) {
    console.error(err?.response?.data || err);
    return res.status(500).json({
      success: false,
      msg: "Gagal verifikasi OTP",
    });
  }
};

module.exports = {
  loginByPhoneV2,
  otpVerifyV2,
};
