"use strict";
const controllerX = {};

const api = require("../lib/serverUtamaClient");

controllerX.TrfINQ = async (req, res) => {
  try {
    const uuid = "app:" + req.body.uuid;
    const iddownline = String(req.body.iddownline || "")
      .trim()
      .toUpperCase();

    if (!iddownline) {
      return res.json({
        success: false,
        msg: "Downline tidak valid",
      });
    }

    // 🔁 CALL SERVER UTAMA
    const apiRes = await api.get("/reseller/transfer-saldo/inq", {
      params: {
        sender: uuid,
        downlineId: iddownline,
      },
      headers: {
        "x-sender": uuid,
      },
    });

  

    const data = apiRes.data;

    if (data.success && data?.data) {
      // SAMAKAN FORMAT LEGACY
      return res.json({
        success: true,
        data: {
          idreseller: data.data.idreseller,
          namareseller: data.data.namareseller,
          saldo: Number(data.data.saldo),
        },
      });
    }

    return res.json({
      success: false,
      msg: "data tidak ditemukan",
    });
  } catch (error) {
    const err = error?.response?.data;

    let msg = "Terjadi kesalahan";

    if (err?.error) msg = err.error;
    if (msg.includes("Unauthorized")) msg = "akun tidak ditemukan";

    return res.json({
      success: false,
      msg,
    });
  }
};

controllerX.EditSelisih = async (req, res) => {
  try {
    const uuid = "app:" + req.body.uuid;
    const iddownline = String(req.body.iddownline || "")
      .trim()
      .toUpperCase();
    const selisih = req.body.selisih;

    if (!iddownline) {
      return res.json({
        success: false,
        msg: "ID downline wajib diisi",
      });
    }

    if (selisih == null || Number(selisih) < 0) {
      return res.json({
        success: false,
        msg: "Selisih tidak diizinkan",
      });
    }

    // Panggil SERVER UTAMA
    const apiRes = await api.post(
      `/reseller/set-markup/${iddownline}`,
      {
        sender: uuid,
        markup: selisih,
      },
      {
        headers: {
          "x-sender": uuid, // auth internal kamu
        },
      }
    );

    /**
     * Normalisasi response biar legacy-friendly
     * (kalau server utama sudah pakai success/msg, ini aman juga)
     */
    if (apiRes.data?.success === false || apiRes.data?.error) {
      return res.json({
        success: false,
        msg: apiRes.data?.error || apiRes.data?.msg || "Gagal edit selisih",
      });
    }

    return res.json({
      success: true,
      msg: "Edit sukses",
    });
  } catch (error) {
    console.error("proxy EditSelisih error:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: "Terjadi kesalahan",
    });
  }
};

controllerX.TransferBalance = async (req, res) => {
  try {
    const uuid = "app:" + req.body.uuid;
    const jumlah = Number(req.body.jumlah);
    const iddownline = String(req.body.iddownline || "")
      .trim()
      .toUpperCase();
    const pin = req.body.pin;

    // Validasi minimal (hindari request rusak)
    if (!iddownline || !pin || !Number.isFinite(jumlah) || jumlah <= 0) {
      return res.json({
        success: false,
        rc: "06",
        msg: "Parameter tidak valid",
      });
    }

    // 🔁 Panggil SERVER UTAMA
    const apiRes = await api.post(
      "/reseller/transfer-saldo",
      {
        sender: uuid,
        downlineId: iddownline,
        amount: jumlah,
        pin,
        note: `Transfer saldo ke downline ${iddownline}`,
      },
      {
        headers: {
          "x-sender": uuid,
        },
      }
    );

    /**
     * === NORMALISASI RESPONSE ===
     * Server utama → webportal → APK
     */
    const data = apiRes.data;

    if (data.success === true) {
      // SUKSES
      return res.json({
        success: true,
        rc: "00",
        msg: "Transfer prosesing...",
      });
    }

    // FALLBACK GAGAL
    return res.json({
      success: false,
      rc: "99",
      msg: data.error || data.message || "Transfer gagal",
    });
  } catch (error) {
    const err = error?.response?.data;

    // Mapping error → legacy RC
    let rc = "99";
    let msg = "Terjadi kesalahan";

    if (err?.error) {
      msg = err.error;

      if (msg.includes("PIN")) rc = "14";
      else if (msg.includes("Saldo")) rc = "12";
      else if (msg.includes("Downline")) rc = "14";
    }

    return res.json({
      success: false,
      rc,
      msg,
    });
  }
};

controllerX.regonline = async (req, res) => {};

controllerX.regdownline = async (req, res) => {
  try {
    const uuid = "app:" + req.body.uuid;

    const apiRes = await api.post(
      "/reseller/register-downline",
      {
        sender: uuid,
        name: req.body.namapemilik,
        storeName: req.body.nama,
        username: req.body.username,
        password: req.body.password,
        pin: req.body.pin,
        phone: req.body.nohp,
        address: req.body.alamat,
      },
      {
        headers: {
          "x-sender": uuid,
        },
      }
    );

    return res.json(apiRes.data);
  } catch (error) {
    console.error("proxy registerDownline:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: "Gagal mendaftarkan downline",
    });
  }
};

controllerX.getdownline = async (req, res) => {
  try {
    const uuid = "app:" + req.query.uuid;

    const page = Number(req.query.page || 1);
    const q = req.query.q || "";

    // panggil server utama
    const apiRes = await api.get("/reseller/my-downline", {
      params: {
        sender: uuid,
        page,
        q,
      },
      headers: {
        "x-sender": uuid, // mekanisme auth internal kamu
      },
    });

    /**
     * response dari server utama sudah berbentuk:
     * {
     *   success,
     *   count,
     *   count_total,
     *   pages,
     *   data: [
     *     {
     *       idreseller,
     *       namareseller,
     *       saldo,
     *       updateAt,
     *       aktif,
     *       tambahanhargapribadi
     *     }
     *   ]
     * }
     */

    return res.json(apiRes.data);
  } catch (error) {
    console.error("proxy getdownline error:", error?.response?.data || error);
    return res.json({
      success: false,
      msg: "Terjadi kesalahan",
    });
  }
};

module.exports = controllerX;
