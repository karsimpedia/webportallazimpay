"use strict";

require("dotenv").config();
const { io } = require("socket.io-client");
const axios = require("axios");

let socketInstance = null;
let started = false;
const PORT = process.env.PORT;
function shouldSendPush(payload, eventName) {
  const status = String(payload?.status || "").toUpperCase();

  // trx:new biasanya optional, bisa dimatikan kalau tidak mau spam
  if (eventName === "trx:new") return false;

  return ["SUCCESS", "FAILED", "REFUNDED"].includes(status);
}

async function forwardToPush(payload, eventName) {
  try {
    if (!shouldSendPush(payload, eventName)) {
      console.log(
        "[WEBPORTAL SOCKET] skip push:",
        eventName,
        payload?.invoiceId || payload?.id,
        payload?.status,
      );
      return;
    }

    const appid = String(payload?.sender.value || "").trim();
    if (!appid) {
      console.log(
        "[WEBPORTAL SOCKET] skip push: resellerId/appid kosong",
        payload?.invoiceId || payload?.id,
      );
      return;
    }
    
    let msg = `Trx  ${payload.productCode} ke ${payload.msisdn} harga ${payload.sellPrice} status ${payload.status} sn: ${payload.sn}`;
    let title = `Transaksi ${payload.status}`;

    if (payload.type === "DEPOSIT") {
      title = `Deposit ${payload.status}`;
      msg = `Deposit via ${payload.productCode} sebesar ${payload.amountDue} telah ${payload.status} saldo anda  ${payload.saldoReseller} \nTerimakasih   `;
    }
    const pesan = msg;

    const pushUrl =
      process.env.WEBPORTAL_PUSH_URL || `http://127.0.0.1:${PORT}/api/sendpush`;
    const body = {
      appid,
      title,
      pesan,
      page: "detail",
      trxId: String(payload?.id || ""),
      invoiceId: String(payload?.invoiceId || ""),
      status: String(payload?.status || ""),
      msisdn: String(payload?.msisdn || ""),
      productCode: String(payload?.productCode || ""),
    };

    const res = await axios.post(pushUrl, body, {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WEBPORTAL_PUSH_KEY
          ? { "x-internal-key": process.env.WEBPORTAL_PUSH_KEY }
          : {}),
      },
    });

    console.log(
      "[WEBPORTAL SOCKET] push sent:",
      body.invoiceId || body.trxId,
      body.status,
      res?.data || {},
    );
  } catch (err) {
    console.error(
      "[WEBPORTAL SOCKET] push error:",
      err?.response?.data || err.message,
    );
  }
}

function startTrxSocketClient() {
  if (started) return socketInstance;
  started = true;

  const baseUrl =
    process.env.SERVER_UTAMA_SOCKET_URL || "http://127.0.0.1:3002";

  const namespaceUrl = `${baseUrl}/transactions`;

  const socket = io(namespaceUrl, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("[WEBPORTAL SOCKET] connected:", socket.id);

    socket.emit("register_webportal", {
      clientId: process.env.WEBPORTAL_CLIENT_ID || "webportal-main",
      app: "webportal",
      mode: "push-forwarder",
    });
  });

  socket.on("connected", (data) => {
    console.log("[WEBPORTAL SOCKET] server ack:", data);
  });

  socket.on("registered", (data) => {
    console.log("[WEBPORTAL SOCKET] registered:", data);
  });

  socket.on("trx:new", async (payload) => {
    console.log(
      "[WEBPORTAL SOCKET] trx:new:",
      payload?.invoiceId || payload?.id,
      payload?.status,
    );

    await forwardToPush(payload, "trx:new");
  });

  socket.on("trx:update", async (payload) => {
    console.log(
      "[WEBPORTAL SOCKET] trx:update:",
      payload?.invoiceId || payload?.id,
      payload?.status,
    );

    await forwardToPush(payload, "trx:update");
  });

  socket.on("disconnect", (reason) => {
    console.log("[WEBPORTAL SOCKET] disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[WEBPORTAL SOCKET] connect_error:", err.message);
  });

  socketInstance = socket;
  return socket;
}

module.exports = {
  startTrxSocketClient,
};
