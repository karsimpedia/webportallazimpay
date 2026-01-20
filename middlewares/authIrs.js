"use strict";

const md5 = require("md5");

module.exports = function authIrs(req, res, next) {
  const header = req.headers["x-auth-irs"];
  const uuid = req.body?.uuid || req.query?.uuid;

  if (!uuid) {
    return res.status(400).json({
      success: false,
      msg: "UUID required",
    });
  }

  const valid = md5(process.env.SECRET + uuid).toLowerCase();

  if (header !== valid) {
    return res.status(401).json({
      success: false,
      msg: "NOT AUTHORIZE",
    });
  }

  next();
};
