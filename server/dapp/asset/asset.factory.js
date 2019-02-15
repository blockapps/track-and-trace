const { common } = require('blockapps-rest');
const { util } = common;

const factory = {
  getAssetArgs(overrideArgs = {}) {
    const defaultArgs = {
      sku: `${util.iuid()}`,
      name: `Name_${Math.random().toString(36).substring(7)}`,
      description: `Description_${Math.random().toString(36).substring(7)}`,
      price: Math.floor((Math.random() * 100) + 1),
      keys: [toBytes32(`Width_${Math.random().toString(36).substring(7)}`)],
      values: [toBytes32(`${Math.floor((Math.random() * 100) + 1)}_in`)]
    };

    return Object.assign({}, defaultArgs, overrideArgs);
  },
}

function encodeToHex(str) {
    if (!str) return '';

    return Buffer.from(str).toString('hex');
  }

function toBytes32(arg) {
  if (arg === undefined) return undefined;
  if (arg === null) return null;

  let hexStr = encodeToHex(arg);
  return `${hexStr}${'0'.repeat(64 - hexStr.length)}`;
}



module.exports = factory;
