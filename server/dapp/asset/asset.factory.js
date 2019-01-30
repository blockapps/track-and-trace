const { common } = require('blockapps-rest');
const { util } = common;

const factory = {
  getAssertArgs(overrideArgs = {}) {
    const defaultArgs = {
      uid: util.iuid(),
    };

    return Object.assign({}, defaultArgs, overrideArgs);
  },
}


module.exports = factory;
