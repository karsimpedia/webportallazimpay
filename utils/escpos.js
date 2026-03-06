const { Buffer } = require("buffer");

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

function textBytes(text) {
  return Buffer.from(String(text ?? ""), "ascii");
}

function lf(count = 1) {
  return Buffer.from(Array(count).fill(LF));
}

function initialize() {
  return Buffer.from([ESC, 0x40]); // ESC @
}

function alignLeft() {
  return Buffer.from([ESC, 0x61, 0x00]);
}

function alignCenter() {
  return Buffer.from([ESC, 0x61, 0x01]);
}

function alignRight() {
  return Buffer.from([ESC, 0x61, 0x02]);
}

function boldOn() {
  return Buffer.from([ESC, 0x45, 0x01]);
}

function boldOff() {
  return Buffer.from([ESC, 0x45, 0x00]);
}

function normalSize() {
  return Buffer.from([GS, 0x21, 0x00]);
}

function doubleSize() {
  return Buffer.from([GS, 0x21, 0x11]); // width x2, height x2
}

function cutPartial() {
  return Buffer.from([GS, 0x56, 0x41, 0x10]);
}

function joinBuffers(parts) {
  return Buffer.concat(parts.filter(Boolean));
}

module.exports = {
  textBytes,
  lf,
  initialize,
  alignLeft,
  alignCenter,
  alignRight,
  boldOn,
  boldOff,
  normalSize,
  doubleSize,
  cutPartial,
  joinBuffers,
};