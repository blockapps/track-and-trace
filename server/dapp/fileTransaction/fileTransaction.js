import { rest, util, importer } from "blockapps-rest";
import config from "../../load.config";

const contractName = "FileTransaction";
const contractFilename = `${util.cwd}/${config.dappPath}/fileTransaction/contracts/FileTransaction.sol`;

const options = { config };

async function uploadContract(token, args) {
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  };

  const contract = await rest.createContract(token, contractArgs, options);
  contract.src = "removed";

  return bind(token, contract);
}

function bind(token, contract) {
  contract.getState = async function() {
    return await rest.getState(contract, options);
  };
  contract.setDetails = async function(args) {
    return await setDetails(token, contract, args, options);
  };

  return contract;
}

function bindAddress(token, address) {
  const contract = {
    name: contractName,
    address
  };
  return bind(token, contract);
}


async function setDetails(token, contract, args, options) {

  const callArgs = {
    contract,
    method: "setDetails",
    args: util.usc(args)
  };

  const [restStatus] = await rest.call(
    token,
    callArgs,
    options
  );

  // if (restStatus != RestStatus.OK) {
  //   throw new rest.RestError(restStatus, "setDetail failed", {
  //     method: callArgs.method,
  //     args
  //   });
  // }
}



export default {
  uploadContract,
  contractName,
  bindAddress,
};
