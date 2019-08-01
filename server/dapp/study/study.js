import { rest, util, importer } from "blockapps-rest";
import config from "../../load.config";

const contractName = "Study";
const contractFilename = `${util.cwd}/${config.dappPath}/study/contracts/Study.sol`;

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

  return contract;
}


export default {
  uploadContract,
  contractName,
};
