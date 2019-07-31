const Assets = {
  assets: '/assets',
  asset: '/assets/:sku',
  event: '/assets/:sku/event'
};

const Users = {
  users: '/users',
  me: '/users/me'
}

const Bids = {
  bids: '/bids',
  bid: '/bids/:address',
  event: '/bids/:address/event'
};

const Exstorage = {
  upload: '/exstorage',
  download: '/exstorage/:address',
  verify: '/exstorage/:address/sign'
};

export default {
  Assets,
  Users,
  Bids,
  Exstorage
};
