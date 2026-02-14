// webportal/controllers/cetak.controller.js

const api = require("../lib/serverUtamaClient");



const cetak = async function cetakStruk(req, res) {
  try {
    const { idtrx, jasaloket = 0 } = req.body;

    const response = await api.get(`/api/transactions/${idtrx}/receipt`,{
      sender: "6282211108088",
      params: { jasaloket, sender :"082211108088" },
      
    });

    return res.json(response.data);
  } catch (err) {
    console.log (err)
    console.error("webportal cetak error:", err.message);
    return res.json({
      success: false,
      msg: "Gagal cetak struk",
    });
  }
};

module.exports = cetak;
