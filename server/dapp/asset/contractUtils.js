import { rest } from 'blockapps-rest';

import config from '../../load.config';

const options = { config }

async function waitForAddress(contractName, address) {
  function predicate(response) {
    if (response.length)
      return response;
  }

  const contract = {
    name: contractName
  }

  const copyOfOptions = {
    ...options,
    query: {
      address: `eq.${address}`
    }
  }

  const results = await rest.searchUntil(contract, predicate, copyOfOptions);
  return results[0];
}

export {
  waitForAddress,
}
