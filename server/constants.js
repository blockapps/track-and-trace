const ba = require('blockapps-rest')

const rest = ba.rest6;
const { config } = ba.common

const { AssetError } = rest.getEnums(`${config.dappPath}/asset/contracts/AssetError.sol`);
const { AssetEvent } = rest.getEnums(`${config.dappPath}/asset/contracts/AssetEvent.sol`);
const { AssetState } = rest.getEnums(`${config.dappPath}/asset/contracts/AssetState.sol`);
const { BidEvent } = rest.getEnums(`${config.dappPath}/bid/contracts/BidEvent.sol`);
const { BidState } = rest.getEnums(`${config.dappPath}/bid/contracts/BidState.sol`);
const { TtPermission } = rest.getEnums(`${config.dappPath}/ttPermission/contracts/TtPermission.sol`);
const { TtRole } = rest.getEnums(`${config.dappPath}/ttPermission/contracts/TtRole.sol`);

// Categorize constants 
const Asset = {
  AssetError,
  AssetEvent,
  AssetState
}

const Bid = {
  BidEvent,
  BidState
}

const TT = {
  TtPermission,
  TtRole
}

const constants = {
  Asset,
  Bid,
  TT
}

module.exports = constants;
