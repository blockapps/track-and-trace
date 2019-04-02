import { rest, fsUtil, parser } from 'blockapps-rest';

// TODO: refactor same code.
import { getYamlFile } from './helpers/config';
const config = getYamlFile('config.yaml');

const constants = {
  getConstants: async () => {

    // TODO: create a util function that will return only data
    const assetErrorSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`)
    const AssetError = await parser.parseEnum(assetErrorSource);

    const assetEventSource = fsUtil.get(`${config.dappPath}/asset/contracts/AssetEvent.sol`)
    const AssetEvent = await parser.parseEnum(assetEventSource);

    const assetStateSource = fsUtil.get(`${config.dappPath}/asset/contracts/AssetState.sol`)
    const AssetState = await parser.parseEnum(assetStateSource);

    const bidEventSource = fsUtil.get(`${config.dappPath}/bid/contracts/BidEvent.sol`)
    const BidEvent = await parser.parseEnum(bidEventSource);

    const bidStateSource = fsUtil.get(`${config.dappPath}/bid/contracts/BidState.sol`)
    const BidState = await parser.parseEnum(bidStateSource);

    const ttPermissionSource = fsUtil.get(`${config.dappPath}/ttPermission/contracts/TtPermission.sol`);
    const TtPermission = await parser.parseEnum(ttPermissionSource);

    const ttRoleSource = fsUtil.get(`${config.dappPath}/ttPermission/contracts/TtRole.sol`);
    const TtRole = await parser.parseEnum(ttRoleSource);

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

    return {
      Asset,
      Bid,
      TT
    }
  }
}

module.exports = constants;
