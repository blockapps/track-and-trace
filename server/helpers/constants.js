import { getEnums } from './parse';

import { getYamlFile } from './config';
const config = getYamlFile('config.yaml');

const baseUrl = `/api/v1`;
const deployParamName = `deploy`;

const getConstants = async () => {

  // get assertError Enums
  const AssetError = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`);

  // get assertState Enums
  const AssetState = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`);

  // get assertEvent Enums
  const AssetEvent = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`);

  // get BidState Enums
  const BidState = await getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidState.sol`);

  // get BidEvent Enums
  const BidEvent = await getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`);

  // get TtPermission Enums
  const TtPermission = await getEnums(`${config.dappPath}/ttPermission/contracts/TtPermission.sol`);

  // get TtRole Enums
  const TtRole = await getEnums(`${config.dappPath}/ttPermission/contracts/TtRole.sol`);

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

export default {
  baseUrl,
  deployParamName,
  getConstants
};
