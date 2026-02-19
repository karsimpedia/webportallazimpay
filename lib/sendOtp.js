const prisma = require("./prisma");
const axios = require("axios");

const MAX_RETRY = 3;
const TIMEOUT_MS = 10000;

function replaceTemplate(obj, variables) {
  const str = JSON.stringify(obj);

  const replaced = str.replace(/{{(.*?)}}/g, function (_, key) {
    return variables[key.trim()] || "";
  });

  return JSON.parse(replaced);
}

async function sendRequest(setting, phone, otp) {
  const variables = {
    phone,
    otp,
    apiKey: setting.apiKey,
    ...(setting.variables || {}),
  };

  const finalHeaders = replaceTemplate(setting.headers || {}, variables);
  const finalBody = replaceTemplate(setting.bodyJson || {}, variables);

  const method = (setting.method || "POST").toUpperCase();

  if (method === "GET") {
    return axios.get(setting.baseUrl, {
      headers: finalHeaders,
      params: finalBody,
      timeout: TIMEOUT_MS,
    });
  }

  if (method === "PUT") {
    return axios.put(setting.baseUrl, finalBody, {
      headers: finalHeaders,
      timeout: TIMEOUT_MS,
    });
  }

  return axios.post(setting.baseUrl, finalBody, {
    headers: finalHeaders,
    timeout: TIMEOUT_MS,
  });
}

async function sendOtp(phone, otp) {
  // Ambil semua provider aktif
  const settings = await prisma.otpApiSetting.findMany({
    where: { isActive: true },
    orderBy: { priority: "asc" }, // primary dulu
  });

  if (!settings.length) {
    throw new Error("Tidak ada OTP provider aktif");
  }

  let lastError = null;

  for (const setting of settings) {
    console.log("Mencoba provider:", setting.name);

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        console.log(`Retry ${attempt} ke ${setting.name}`);

        const response = await sendRequest(setting, phone, otp);

        console.log("Sukses via:", setting.name);

        return {
          success: true,
          provider: setting.name,
          response: response.data,
        };
      } catch (err) {
        lastError = err;
        console.error(
          `Gagal attempt ${attempt} di ${setting.name}:`,
          err.message
        );

        if (attempt === MAX_RETRY) {
          console.log("Pindah ke provider berikutnya...");
        }
      }
    }
  }

  throw new Error(
    "Semua provider gagal. Last error: " + (lastError?.message || "")
  );
}

module.exports = { sendOtp };
