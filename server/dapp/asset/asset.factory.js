const { common } = require('blockapps-rest');
const { util } = common;
const ttUtil = require('../../helpers/util');
const factory = {
  getAssetArgs(overrideArgs = {}) {
    const defaultArgs = {
      sku: `${util.iuid()}`,
      name: `Name_${Math.random().toString(36).substring(7)}`,
      description: `Description_${Math.random().toString(36).substring(7)}`,
      price: Math.floor((Math.random() * 100) + 1),
      keys: [ttUtil.toBytes32(`Width_${Math.random().toString(36).substring(7)}`)],
      values: [ttUtil.toBytes32(`${Math.floor((Math.random() * 100) + 1)}_in`)]
    };

    return Object.assign({}, defaultArgs, overrideArgs);
  },
}

module.exports = factory;
