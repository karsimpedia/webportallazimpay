"use strict";

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const bodyParser = require("body-parser");
require("dotenv").config();
const { startTrxSocketClient } = require("../lib/trxSocketClient");
// middlewares
const corsConfig = require("../config/cors");
const authIrs = require("../middlewares/authIrs");
const authJwt = require("../middlewares/authJwt");
const notFound = require("../middlewares/notFound");
const errorHandler = require("../middlewares/errorHandler");
const blogCategoryRoutes = require("../routes/blog/blogCategory.routes");
const blogArticleRoutes = require("../routes/blog/blogArticle.routes");


// routes
const viewRoutes = require("../routes/view");
const apiWeb = require("../routes/authWeb");
const trxRoutes = require("../routes/api");
const apk = require("../routes/apk");
const admin = require("../routes/admin.routes");

const app = express();

// ================= HARDENING =================
app.disable("x-powered-by");
app.use(responseTime());

// ================= CORS =================
app.use(corsConfig);

// ================= BODY PARSER =================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// ================= COOKIE & STATIC =================
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// ================= VIEW =================
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// ================= ROUTES =================
app.use("/", viewRoutes);
app.use("/api", apiWeb);



app.use("/apk", apk);
app.use("/admin", admin);
app.use("/blog/categories", blogCategoryRoutes);
app.use("/blog/articles", blogArticleRoutes);
// 🔐 INTERNAL / H2H

app.use("/trx", authJwt, trxRoutes);
// app.use("/trx",  trxRoutes); // testing no uth
// ================= ERROR =================

startTrxSocketClient();
app.use(notFound);
app.use(errorHandler);

module.exports = app;
