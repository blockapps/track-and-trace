import { rest, util, importer } from "blockapps-rest";
import config from "../../load.config";
import fileTransactionJs from "./fileTransaction";
import RestStatus from "http-status-codes";

const contractName = "FileTransactionManager";
const contractFilename = `${util.cwd}/${config.dappPath}/fileTransaction/contracts/FileTransactionManager.sol`;

async function uploadContract(token, options) {
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
  };
  //console.log(contractArgs.source)  //  <<<<<<<<<<<<<<<  print the combined source here

  const contract = await rest.createContract(token, contractArgs, options);

  return bind(token, contract, options);
}

function bind(token, _contract, options) {
  const contract = _contract;
  contract.getState = async function() {
    return await rest.getState(contract, options);
  };
  contract.createFileTransaction = async function(args) {
    return await createFileTransaction(token, contract, args, options);
  };
  contract.setDetails = async function(args) {
    return await setDetails(token, contract, args, options);
  };

  return contract;
}

async function createFileTransaction(token, contract, args, options) {

  const callArgs = {
    contract,
    method: "createFileTransaction",
    args: util.usc(args)
  };

  const copyOfOptions = {
    ...options,
    history: [fileTransactionJs.contractName]
  };

  const [restStatus, fileTransactionError, fileTransactionAddress] = await rest.call(token, callArgs, copyOfOptions);

  if (restStatus != RestStatus.CREATED)
    throw new rest.RestError(restStatus, fileTransactionError, { callArgs });

  const contractArgs = {
    name: fileTransactionJs.contractName,
    address: fileTransactionAddress
  };

  const fileTransaction = await rest.waitForAddress(contractArgs, options);
  return fileTransaction
}

async function setDetails(token, contract, args, options) {

  const callArgs = {
    contract,
    method: "setDetails",
    args: util.usc(args)
  };

  const copyOfOptions = {
    ...options,
    history: [fileTransactionJs.contractName]
  };

  const [restStatus, fileTransactionError, address] = await rest.call(token, callArgs, copyOfOptions);

  if (restStatus != RestStatus.OK)
    throw new rest.RestError(restStatus, fileTransactionError, { callArgs });

  return address;
}

export default {
  uploadContract,
  bind
};
