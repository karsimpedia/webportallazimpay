/**
 * Normalisasi nomor HP lokal
 * @param {string} phone
 * @return {string}
 */
function normalisasiNomorHP(phone) {
  phone = String(phone).trim();
  if (phone.startsWith("+62")) {
    phone = "0" + phone.slice(3);
  } else if (phone.startsWith("62")) {
    phone = "0" + phone.slice(2);
  }
  return phone.replace(/[- .]/g, "");
}

/**
 * Tes nomor HP lokal
 * @param {string} phone
 * @return {boolean}
 */
function tesNomorHP(phone) {
  if (!phone || !/^08[1-9][0-9]{7,10}$/.test(phone)) {
    return false;
  }
  return true;
}

/**
 * Deteksi operator seluler indonesia
 * @param {string} phone
 * @return {string?}
 */
function deteksiOperatorSeluler(phone) {
  const prefix = phone.slice(0, 4);
  if (["0831", "0832", "0833", "0838"].includes(prefix)) return "axis";
  if (["0895", "0896", "0897", "0898", "0899"].includes(prefix)) return "three";
  if (["0817", "0818", "0819", "0859", "0878", "0877"].includes(prefix))
    return "xl";
  if (["0814", "0815", "0816", "0855", "0856", "0857", "0858"].includes(prefix))
    return "indosat";
  if (
    [
      "0812",
      "0813",
      "0852",
      "0853",
      "0821",
      "0823",
      "0822",
      "0851",
      "0811",
    ].includes(prefix)
  )
    return "telkomsel";
  if (
    [
      "0881",
      "0882",
      "0883",
      "0884",
      "0885",
      "0886",
      "0887",
      "0888",
      "0889",
    ].includes(prefix)
  )
    return "smartfren";
  return null;
}

/**
 * Apakah nomor HP ini valid?
 * @param {string} phone
 * @return {boolean}
 */

function validasiNomorSeluler(phone) {
  phone = normalisasiNomorHP(phone);
  return tesNomorHP(phone) && !!deteksiOperatorSeluler(phone);
}
async function validasi(req, res) {
  try {
    const nohp = req.body.nohp;
    let valid = tesNomorHP(nohp);
    let operator = deteksiOperatorSeluler(nohp);
    res.json({ valid, operator });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
}

module.exports = validasi;
