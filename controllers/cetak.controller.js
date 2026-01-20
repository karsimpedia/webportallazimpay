// webportal/controllers/cetak.controller.js

const api = require("../lib/serverUtamaClient");
const cetak = async function cetakStruk(req, res) {
  try {
    const { uuid, idtrx, jasaloket = 0 } = req.body;

    const response = await api.get(`/api/transactions/${idtrx}/receipt`, {
      sender: uuid,
      params: { jasaloket },
      headers: {
        "x-app-id": uuid,
      },
    });

    return res.json(response.data);
  } catch (err) {
    console.error("webportal cetak error:", err.message);
    return res.json({
      success: false,
      msg: "Gagal cetak struk",
    });
  }
};

module.exports = cetak;
