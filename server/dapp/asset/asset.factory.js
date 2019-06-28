import { util } from 'blockapps-rest';

const factory = {
  getAssetArgs(overrideArgs = {}) {
    const defaultArgs = {
      sku: `${util.iuid()}`,
      name: `Name_${Math.random().toString(36).substring(7)}`,
      description: `Description_${Math.random().toString(36).substring(7)}`,
      price: Math.floor((Math.random() * 100) + 1),
      keys: [Math.random().toString(36).substring(7)],
      values: [Math.random().toString(36).substring(7)]
    };

    return Object.assign({}, defaultArgs, overrideArgs);
  },
    getAssetArgsDoubleQuotes(overrideArgs = {}) {
        const defaultArgs = {
            sku: `${util.iuid()}`,
            name: `Flat screen TV "4.7 in" bla bla `,
            description: '\"Test String\"',
            price: Math.floor((Math.random() * 100) + 1),
            keys: [Math.random().toString(36).substring(7)],
            values: [Math.random().toString(36).substring(7)]
        };

        return Object.assign({}, defaultArgs, overrideArgs);
    }

};

export {
  factory
};
