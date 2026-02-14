"use strict";

const jwt = require("jsonwebtoken");

module.exports = function authJwt(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({
      success: false,
      msg: "Token missing",
    });
  }

  const token = auth.split(" ")[1];

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        msg: "Token invalid or expired",
      });
    }

    req.user = decoded;
    // console.log(decoded)
    next();
  });
};
