import { rest } from 'blockapps-rest';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

async function waitForAddress(contractName, address) {
  function predicate(response) {
    if (response.length)
      return response;
  }

  const contract = {
    name: contractName
  }

  const results = await rest.searchUntil(contract, predicate, { config, logger: console, query: { address: `eq.${address}` } });
  return results[0];
}

module.exports = {
  waitForAddress,
}
