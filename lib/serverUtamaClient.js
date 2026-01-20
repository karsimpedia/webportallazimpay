// lib/serverUtamaClient.js

const axios = require("axios")
const crypto = require("crypto")
const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:3002",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const body = config.data || {};
  const timestamp = new Date().toISOString();

  const signature = crypto
    .createHmac("sha256", process.env.LAZIM_KEY_SECRET)
    .update(JSON.stringify(body) + timestamp)
    .digest("hex");

  config.headers["x-timestamp"] = timestamp;
  config.headers["x-signature"] = signature;

  return config;
});

module.exports = api

