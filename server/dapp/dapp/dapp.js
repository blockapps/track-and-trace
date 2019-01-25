const ba = require('blockapps-rest');

const rest = ba.rest6;
const { config, util, fsutil, cwd } = ba.common;

const contractName = 'TtDapp';
const contractFilename = `${config.dappPath}/dapp/contracts/ttDapp.sol`;
const managersNames = ['userManager', 'assetManager', 'ttPermissionManager'];

const userManagerJs = require(`${process.cwd()}/server/blockapps-sol/auth/user/userManager`);
const userJs = require(`${process.cwd()}/server/blockapps-sol/auth/user/user`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);
const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/TtPermissionManager`);
const RestStatus = rest.getFields(`${config.libPath}/rest/contracts/RestStatus.sol`);
const { TtError } = rest.getEnums(`${config.dappPath}/asset/TtError.sol`);
const { TtRole } = rest.getEnums(`${config.dappPath}/ttPermission/TtRole.sol`);
const { AssetEvent } = rest.getEnums(`${config.dappPath}/asset/contracts/AssetEvent.sol`);

rest.calllistBatch = function* (admin, txs) {
  const batchSize = 60;
  const results = [];
  for (let i = 0; i < txs.length; i += batchSize) {
    const slice = txs.slice(i, i + batchSize);
    const batchResults = yield rest.callList(admin, slice);
    results.push(...batchResults);
  }
  return results;
}

function* uploadContract(admin, ttPermissionManager) {
  const args = {
    ttPermissionManager: ttPermissionManager.address,
  };
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, util.usc(args));
  contract.src = 'removed';
  yield util.sleep(5 * 1000);
  // // add permissions to the AI
  //  MANAGERS_MANAGER role does not exist in Track and Trace
  // yield echoPermissionManager.grantManagersManager(contract); // TODO -LS: move into the AI
  return yield bind(admin, contract);
}

function* getManagers(contract) {
  rest.verbose('getManagers', { contract, managersNames });
  const state = yield rest.getState(contract);
  const managers = {};
  managersNames.forEach((name) => {
    const address = state[name];
    if (address === undefined || address == 0) throw new Error(`Sub contract address not found ${name}`);
    managers[name] = {
      name: name[0].toUpperCase() + name.substring(1),
      address,
    };
  });
  return managers;
}

function* bind(admin, _contract) {
  rest.verbose('bind', { admin, _contract });
  const contract = _contract;
  // set the managers
  const unboundManagers = yield getManagers(contract);
  const userManager = userManagerJs.bind(admin, unboundManagers.userManager);
  const assetManager = assetManagerJs.bind(admin, unboundManagers.assetManager);
  const ttPermissionManager = ttPermissionManagerJs.bind(admin, unboundManagers.ttPermissionManager);

  // deploy
  contract.deploy = function* (deployFilename, presetsDeployFilename, presetFilename, userTokens) {
    const managers = {
      userManager,
      assetManager,
      ttPermissionManager,
    }
    return yield deploy(admin, contract, deployFilename, presetsDeployFilename, managers, presetFilename, userTokens)
  }
  // /*
  //   Assets  WAITING FOR assetManager.js functions
  // */
  // // create gas deal
  // contract.createGasDeal = function* (args) {
  //   return yield gasDealManager.createGasDeal(args);
  // };
  // // makeup gas deal
  // contract.makeupGasDeal = function* (args) {
  //   return yield gasDealManager.createGasDeal(args);
  // };
  //
  // // get gas deal price indexes
  // contract.getAllPriceIndexItems = function* () {
  //   return yield gasDealManager.getAllPriceIndexItems();
  // };
  // // get gas deal price indexes
  // contract.getGasDeals = function* (args) {
  //   return yield gasDealManager.getAll(args);
  // };
  // // get gas deal by uid
  // contract.getGasDealByUid = function* (uid) {
  //   return yield gasDealManager.getGasDealByUid(uid);
  // };
  // // get gas deals by uids
  // contract.getGasDealsByUids = function* (args) {
  //   return yield gasDealManager.getGasDealsByUids(args);
  // };
  // // get gas deal by trader ID
  // contract.getGasDealsByTraderId = function* (traderId) {
  //   return yield gasDealManager.getGasDealsByTraderId(traderId);
  // };
  // // set the counter party price
  // contract.rejectGasDeal = function* (args) {
  //   return yield gasDealManager.rejectGasDeal(args);
  // };
  // // set the counter party price
  // contract.setCounterPartyPriceForGasDeal = function* (args) {
  //   return yield gasDealManager.setCounterPartyPriceForGasDeal(args);
  // };
  // // set the trader price
  // contract.setTraderPriceForGasDeal = function* (args) {
  //   return yield gasDealManager.setTraderPriceForGasDeal(args);
  // };
  //
  // // handle GasDealEvent event (used for testing respondExceptionCut route)
  // contract.handleGasDealEvent = function* (args) {
  //   return yield gasDealManager.handleGasDealEvent(args);
  // }
  // // ECHO-841 Removed as hotfix for release
  // // handle nomination event - both NOMINATION and VOLUME_NOMINATED
  // // contract.gasHandleNomination = function* (args) {
  // //   return yield gasDealManager.handleNomination(args);
  // // }
  // // handle final event - both FINAL_VOLUME_MATCH and FINAL_VOLUME_MISMATCH
  // contract.gasHandleFinal = function* (_args) {
  //   // return yield gasDealManager.handleFinal(args);
  //   const args = { ..._args, gasDealEvent: _args.isCut ? GasDealEvent.FINAL_VOLUME_MISMATCH : GasDealEvent.FINAL_VOLUME_MATCH };
  //   return yield gasDealManager.handleGasDealEvent(args);
  // }
  // // handle final event - both FINAL_VOLUME_MATCH and FINAL_VOLUME_MISMATCH
  // contract.gasHandleCutResolution = function* (_args) {
  //   const args = { ..._args, gasDealEvent: GasDealEvent.RESOLVED };
  //   return yield gasDealManager.handleGasDealEvent(args);
  // }
  //
  // // create gas deals from preset data
  // contract.createPresetGasDeals = function* (presetGasDeals) {
  //   return yield createPresetGasDeals(admin, gasDealManager, presetGasDeals);
  // }

  // get all users
  contract.getUsers = function* (args) {
    const user = yield userManager.getUsers(args);
    return user;
  };

  contract.getUser = function* (username) {
    const user = yield userManager.getUser(username);
    return user;
  };

  // replace asset manager
  contract.replaceAssetManager = function* (args) {
    return yield replaceGasDealManager(admin, contract, args);
  };

  return contract;
}

// =========================== deployment ========================
function* deploy(admin, contract, deployFilename, presetsDeployFilename, managers, presetFilename, userTokens) {
  rest.verbose('dapp: deploy');
  const { assetManager, ttPermissionManager, userManager } = managers;

  // grant permissions
  yield ttPermissionManager.grantAssetManager(assetManager);

  // authoring the deployment
  let deployment = {
    url: config.getBlocUrl(),
    contract: {
      name: contract.name,
      address: contract.address,
    },
  };
  // write
  if (config.apiDebug) {
    console.log('deploy filename:', deployFilename);
    console.log(fsutil.yamlSafeDumpSync(deployment));
  }

  fsutil.yamlWrite(deployment, deployFilename);

  if (presetFilename) {
    // read the preset data
    const presetData = fsutil.yamlSafeLoadSync(presetFilename);
    if (presetData === undefined) throw new Error(`Preset data read failed ${presetFilename}`);

    yield createPresets(admin, ttPermissionManager, userManager, assetManager, presetData, userTokens);
    // authoring the deployment
    const presetDeployment = {
      users: presetData.users,
      // assets: presetData.assets,
    };
    // write
    if (config.apiDebug) {
      console.log('preset deploy filename:', presetsDeployFilename);
      console.log(fsutil.yamlSafeDumpSync(presetDeployment));
    }

    fsutil.yamlWrite(presetDeployment, presetsDeployFilename);
    deployment = {
      ...deployment,
      presetDeployment,
    }
  }

  return deployment;
}

function* createPresets(admin, ttPermissionManager, userManager, assetManager, presetData, userTokens) {
  // Create preset users
  yield createPresetUsers(admin, ttPermissionManager, userManager, presetData.users, userTokens);
  // Create preset asset deals
  // yield createPresetGasDeals(admin, assetManager, presetData.assets);
}

function readAccountData(filename) {
  const accountData = fsutil.yamlSafeLoadSync(filename);
  if (accountData === undefined) {
    throw new Error(`Account data read error: ${filename}`);
  }
  rest.verbose(`Account data: ${filename}`, JSON.stringify(accountData, null, 2));
  return accountData;
}

const createPresetUserTxs = function* (admin, userManager, presetUserArgs) {
  const adminAddressObj = yield rest.getKey(admin);
  const { nonce } = yield rest.getNonce(adminAddressObj);

  return presetUserArgs.map((presetUserArg, index) => {
    const tx = {
      contractName: userManager.name,
      contractAddress: userManager.address,
      method: 'createUser',
      value: 0,
      args: util.usc(presetUserArg),
      txParams: { nonce: nonce + index },
    }
    return tx;
  });
}

/**
 * Converts a string array to byte array
 *
 * @param {Array} args The string array to be converted.
 * @return {Array} The converted byte array.
 */
function argsToBytes32(args) {
  // create b32 array
  const newArgs = [];
  args.forEach(arg => newArgs.push(util.toBytes32(arg || 0)));
  return newArgs;
}

function* formatPresetUsers(presetUsers, userTokens) {
  const userArgsArray = [];
  for (let i = 0; i < presetUsers.length; i += 1) {
    const userArgs = presetUsers[i];
    const userToken = userTokens[userArgs.username];
    const userCreated = yield utils.createUser(userToken, userArgs.username);
    if (userCreated.status !== 200) throw new Error(`Unable to create OAuth user ${userArgs.username}`)
    userArgsArray.push({
      uid: userArgs.uid,
      account: userCreated.address,
      username: userArgs.username,
      orgIds: argsToBytes32(userArgs.orgIds),
      role: TtRole[userArgs.role],
    });
  }
  return userArgsArray;
}

const validateUserTokens = (presetUsers, userTokens) => {
  if (!userTokens || !Object.keys(userTokens).length) {
    throw new Error('User tokens are empty. Please check the user tokens file.');
  }
  if (!presetUsers || !presetUsers.length) {
    throw new Error('Preset users are empty. Please check preset users file.');
  }
  const usersMissingTokens = []
  for (let i = 0; i < presetUsers.length; i += 1) {
    const { username } = presetUsers[i];
    const userToken = userTokens[username];
    if (!userToken) {
      usersMissingTokens.push(username);
    }
  }
  if (usersMissingTokens.length) {
    throw new Error(`Tokens missing for user(s) - ${usersMissingTokens.join(', ')}`);
  }
}

function* createPresetUsers(admin, ttPermissionManager, userManager, presetUsers, userTokens) {
  console.log('Creating preset users')
  validateUserTokens(presetUsers, userTokens);
  const formattedPresetUserArgs = yield formatPresetUsers(presetUsers, userTokens);
  const txs = yield createPresetUserTxs(admin, userManager, formattedPresetUserArgs);
  const results = yield rest.callList(admin, txs);
  console.log('Granting user roles')
  for (let i = 0; i < results.length; i += 1) {
    const [restStatus, address] = results[i];
    if (restStatus != RestStatus.CREATED) {
      throw new Error(`Unable to create user: ${presetUsers[i].username}`);
    }
    if (!util.isAddress(address)) {
      throw new Error(`Invalid user address: ${address} for user: ${presetUsers[i].username}`);
    }
    const user = yield userManager.getUser(presetUsers[i].username);
    yield ttPermissionManager.grantRole(user, EchoRole[presetUsers[i].role]);
  }
}

const createPresetAssetTxs = function* (admin, assetManager, presetAssetArgs) {
  const adminAddressObj = yield rest.getKey(admin);
  const { nonce } = yield rest.getNonce(adminAddressObj);

  return presetAssetArgs.map((presetAssetArg, index) => {
    const tx = {
      contractName: assetManager.name,
      contractAddress: assetManager.address,
      method: 'createAsset',
      value: 0,
      args: util.usc(presetAssetArg),
      txParams: { nonce: nonce + index },
    };
    return tx;
  });
}

// function formatPresetAssets(presetAssets) {
//   const uid = util.uid();
//   return presetAssets.map((presetAsset) => {
//     const args = {
//       ...presetAsset,
//       uid: `${presetAsset.uid}_${uid}`,
//       // priceType: PriceType[presetGasDeal.priceType], // convert string to enum
//       // volumeUnits: GasVolumeUnits[presetGasDeal.volumeUnits], // convert string to enum
//       // // dates
//       // dealDate: (new Date(presetGasDeal.dealDate).getTime() / 1000).toString(), // date to epoch
//       // beginFlowDate: (new Date(presetGasDeal.beginFlowDate).getTime() / 1000).toString(), // date to epoch
//       // endFlowDate: (new Date(presetGasDeal.endFlowDate).getTime() / 1000).toString(), // date to epoch
//     };
//     // price
//     if (Number(args.priceType) === 1) { // fixed
//       args.dealPrice *= 10 ** Constants.PRECISION;
//     } else {
//       args.indexPriceAdder *= 10 ** Constants.PRECISION;
//     }
//     const foundPipeline = pipelines.filter(pipeline => pipeline.name === args.pipelineEBB);
//     if (foundPipeline.length !== 1) {
//       console.log('ERROR: not found: pipeline:', args.pipelineEBB);
//       process.exit();
//     }
//     args.pipelineEBB = foundPipeline[0].duns;
//     const byteArrayArgs = {
//       bytes32Array: assetJs.argsToBytes32(args),
//     };
//     return byteArrayArgs;
//   });
// }

function* createPresetAssets(admin, assetManager, presetAssets) {
  const formattedPresetAssetArgs = formatPresetAssets(presetAssets);
  const txs = yield createPresetAssetTxs(admin, assetManager, formattedPresetAssetArgs);
  const results = yield rest.callList(admin, txs);
  results.forEach((result, index) => {
    const [restStatus, echoError, address] = result
    if (restStatus != RestStatus.CREATED) {
      throw new Error(`Unable to create asset: ${presetAssets[index].uid} - ${RestStatus[restStatus]} - ${EchoError[echoError]}`);
    }
    if (!util.isAddress(address)) {
      throw new Error(`Invalid asset address: ${address} for asset: ${presetAssets[index].uid}`);
    }
  })
}

// =========================== Business Functions ========================

function* login(userManager, username, pwHash) {
  rest.verbose('dapp: login', { username, pwHash });
  const args = { username, pwHash };
  const result = yield userManager.authenticate(args);    //Unsure if functional
  // auth failed
  if (!result) {
    return { authenticate: false };
  }
  // auth OK
  const baUser = yield userManager.getUser(username);
  return { authenticate: true, user: baUser };
}

function* replaceAssetManager(admin, contract, args) {
  // replace
  const method = 'replaceAssetManager'
  const [restStatus] = yield rest.callMethod(admin, contract, method, util.usc(args));
  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(restStatus, method, args);
  }
  // MUST refresh the managers of the dapp
  return yield bind(admin, contract)
}
