const { common } = require('blockapps-rest');
const { util } = common;

const factory = {
  getAssetArgs(overrideArgs = {}) {
    const defaultArgs = {
      sku: `${util.iuid()}`,
      name: `Name_${Math.random().toString(36).substring(7)}`,
      description: `Description_${Math.random().toString(36).substring(7)}`,
      price: Math.floor((Math.random() * 100) + 1)
    };

    return Object.assign({}, defaultArgs, overrideArgs);
  },
}


module.exports = factory;
