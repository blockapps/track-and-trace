import { fsUtil, parser } from 'blockapps-rest';

const getEnums = async (filePath) => {
  const assetErrorSource = fsUtil.get(filePath)
  return await parser.parseEnum(assetErrorSource);
}

export { getEnums };