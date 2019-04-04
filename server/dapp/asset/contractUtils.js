import { rest } from 'blockapps-rest';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

const options = { config }

async function waitForAddress(contractName, address) {
  function predicate(response) {
    if (response.length)
      return response;
  }

  const contract = {
    name: contractName
  }

  const metadata = {
    ...options,
    query: {
      address: `eq.${address}`
    }
  }

  const results = await rest.searchUntil(contract, predicate, metadata);
  return results[0];
}

export {
  waitForAddress,
}
