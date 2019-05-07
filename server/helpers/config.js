import fs from "fs";
import yaml from "js-yaml";
// TODO: All of this should be in blockapps-rest
// read a yaml or die
function getYamlFile(yamlFilename) {
  return yaml.safeLoad(fs.readFileSync(yamlFilename, "utf8"));
}

function yamlSafeDumpSync(object) {
  return yaml.safeDump(object);
}

function yamlWrite(object, filename) {
  const yaml = yamlSafeDumpSync(object);
  writeFileSync(filename, yaml, "utf8");
}

function writeFileSync(file, data, options) {
  fs.writeFileSync(file, data, options);
}

export { getYamlFile, yamlSafeDumpSync, yamlWrite, writeFileSync };
