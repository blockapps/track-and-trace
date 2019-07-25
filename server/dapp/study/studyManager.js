import { rest, util, importer } from "blockapps-rest";
import config from "../../load.config";
import studyJs from "./study";

const contractName = "StudyManager";
const contractFilename = `${util.cwd}/${config.dappPath}/study/contracts/StudyManager.sol`;

const options = { config };

async function uploadContract(token) {
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
  };

  const contract = await rest.createContract(token, contractArgs, options);

  return bind(token, contract);
}

function bind(token, contract) {
  contract.createStudy = async function(args) {
    return await createStudy(token, contract, args);
  };

  return contract;
}

async function createStudy(token, contract, args) {

  const callArgs = {
    contract,
    method: "createStudy",
    args: util.usc(args)
  };

  const copyOfOptions = {
    ...options,
    history: [studyJs.contractName]
  };

  const [restStatus, studyError, studyAddress] = await rest.call(token, callArgs, copyOfOptions);

  if (restStatus != RestStatus.CREATED)
    throw new rest.RestError(restStatus, assetError, { callArgs });

  const contractArgs = {
    name: studyJs.contractName,
    address: studyAddress
  };

  const study = await rest.waitForAddress(contractArgs, options);
  return study
}

export default {
  uploadContract,
  bind
};
