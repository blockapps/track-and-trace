import { util } from 'blockapps-rest';

const factory = {
  /*
  curl -X POST "http://<your-ip-address>/apex-api/bloc/file/upload" -H "accept: application/json;charset=utf-8" -H "Content-Type: multipart/form-data"
  -F "username=<username>"
  -F "password=<password>"
  -F "address=<address-of-user>"
  -F "provider=s3"
  -F "metadata=<description>"
  -F "content=@<local-path-to-file>;type=<type-of-file>"
   */
  createUploadArgs(uid, overrideArgs = {}) {
    const defaultArgs = {
      metadata: `metadata ${uid}`,
      metadata: `metadata ${uid}`,
      name: `Name_${Math.random().toString(36).substring(7)}`,
      description: `Description_${Math.random().toString(36).substring(7)}`,
      price: Math.floor((Math.random() * 100) + 1),
      keys: [Math.random().toString(36).substring(7)],
      values: [Math.random().toString(36).substring(7)]
    };

    return Object.assign({}, defaultArgs, overrideArgs);
  },
}

export {
  factory
};
