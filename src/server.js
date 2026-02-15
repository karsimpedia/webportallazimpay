"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const USE_HTTPS = process.env.USE_HTTPS === "true";
app.set("trust proxy", 1);
if (USE_HTTPS) {
  const credentials = {
    key: fs.readFileSync("./ssl/private.key"),
    cert: fs.readFileSync("./ssl/certificate.pem"),
  };

  https.createServer(credentials, app).listen(PORT, () => {
    console.log("HTTPS server running on port", PORT);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log("HTTP server running on port", PORT);
  });
}
