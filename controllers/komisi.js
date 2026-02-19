"use strict";
const controllerX = {};

const api = require("../lib/serverUtamaClient");
controllerX.RedeemKomisi = async (req, res) => {
  const uuid = "app:" + req.body.uuid;

  try {
    // 1️⃣ Ambil saldo komisi
    const overview = await api.get("/reseller/commission/overview", {
      params: { sender: uuid },
    });

    if (!overview.data?.ok) {
      return res.json({
        success: false,
        msg: "Gagal mengambil saldo komisi",
      });
    }

    const komisi = Number(overview.data.wallet || 0);

    if (komisi <= 0) {
      return res.json({
        success: false,
        msg: "Saldo komisi kosong",
      });
    }

    // 2️⃣ Cairkan SEMUA komisi
    await api.post("/reseller/commission/payout", {
      sender: uuid,
      amount: "ALL", // 🔑 paling aman
    });

    // 3️⃣ IRS-style response
    return res.json({
      success: true,
      komisi: komisi,
      msg: "Pencairan Komisi berhasil",
    });
  } catch (error) {
    console.error(
      "RedeemKomisi error:",
      error?.response?.data || error.message,
    );

    return res.json({
      success: false,
      msg: error?.response?.data?.error || "pencairan komisi gagal",
    });
  }
};

controllerX.HistoriKomisi = async (req, res) => {
  try {
    const uuid = "app:" + req.query.uuid;

    const response = await api.get("/reseller/commission/mutations", {
      params: {
        sender: uuid,
        page: req.query.page,
        limit: req.query.count,
        from: req.query.tanggalawal,
        to: req.query.tanggalakhir,
      },
      headers: {
        "x-app-id": uuid,
      },
    });

    const r = response.data;

    if (!r.ok) {
      return res.json({
        success: false,
        msg: "akun tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      komisi: Number(r.wallet),
      count: r.data.length,
      count_total: r.total,
      pages: Number(req.query.page || 1),
      data: r.data.map((x) => ({
        waktu: x.createdAt.replace("T", " ").substring(0, 19),
        keterangan: x.note || x.type,
        jumlah: Number(x.amount),
      })),
    });
  } catch (err) {
    console.error("HistoriKomisi error:", err.message);
    return res.json({
      success: false,
      msg: "akun tidak ditemukan",
    });
  }
};

module.exports = controllerX;
