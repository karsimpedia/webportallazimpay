"use strict";

module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    msg: err.message || "Internal Server Error",
  });
};
