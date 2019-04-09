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

export default {
  Assets,
  Users,
  Bids,
};
