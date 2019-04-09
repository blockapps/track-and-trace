import { getYamlFile } from './helpers/config';

let config;

if (!config) {
  config = getYamlFile('config.yaml');
}

export default config;