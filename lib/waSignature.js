// lib/waSignature.js

const crypto = require("crypto")
const SECRET = process.env.SECRET_KEY;

export function signRequest(body) {
  const timestamp = new Date().toISOString();
  const bodyString = JSON.stringify(body || {});

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(bodyString + timestamp)
    .digest("hex");

  return {
    timestamp,
    signature,
  };
}
