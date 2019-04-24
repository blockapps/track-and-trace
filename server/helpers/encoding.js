const ba = require("blockapps-rest");
const rest = ba.rest;

const encodeToHex = function(str) {
  if (!str) return "";

  return Buffer.from(str).toString("hex");
};

const toBytes32 = function(arg) {
  if (arg === undefined) return undefined;
  if (arg === null) return null;

  let hexStr = this.encodeToHex(arg);

  return `${hexStr}${"0".repeat(64 - hexStr.length)}`;
};

const decodeHex = function(hexString) {
  let j;
  let hexes = hexString.match(/.{1,2}/g) || [];
  let back = "";

  for (j = 0; j < hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }
  return back;
};

const fromBytes32 = function(x) {
  if (x === undefined) return undefined;

  return this.decodeHex(x).replace(/\0/g, "");
};

export default { encodeToHex, toBytes32, decodeHex, fromBytes32 };
