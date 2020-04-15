import { fsUtil } from "blockapps-rest";

let config;

if (!config) {
  config = fsUtil.getYaml(
    `config/${
      process.env.SERVER ? process.env.SERVER : "localhost"
    }.config.yaml`
  );
}

export default config;
