async function upload(args) {

    const command = `curl \
      -X POST "${args.host}/apex-api/bloc/file/upload" \
      -H "accept: application/json;charset=utf-8" -H "Content-Type: multipart/form-data" \
      -F "username=${args.username}" \
      -F "password=${args.password}" \
      -F "address=${args.address}" \
      -F "provider=s3" \
      -F "metadata=${args.metadata}" \
      -F "content=@${args.content};type=${args.type}"`
    const resultsString = await exec(command)

    return JSON.parse(resultsString)
}


async function download(args) {
    /*
    curl -X GET "http://<your-ip-address>/apex-api/bloc/file/download?contractAddress=<contract-address-of-externally-stored-object>"
    -H "accept: application/json;charset=utf-8"
    */
    const command = `curl \
      -X GET "${args.host}/apex-api/bloc/file/download?contractAddress=${args.contractAddress}" \
      -H "accept: application/json;charset=utf-8"`
    const resultsString = await exec(command)
    return JSON.parse(resultsString)
}

async function verify(args) {
    /*
    curl -X GET "http://<your-ip-address>/apex-api/bloc/file/verify?contractAddress=<contract-address-of-externally-stored-object>"
         -H "accept: application/json;charset=utf-8"
    */
    const command = `curl \
      -X GET "${args.host}/apex-api/bloc/file/verify?contractAddress=${args.contractAddress}" \
    -H "accept: application/json;charset=utf-8"`
    const resultsString = await exec(command)
    return JSON.parse(resultsString)
}

async function exec(command) {
    const child = require('child_process')
    return new Promise(function (resolve, reject) {
        child.exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err) // throws exception
            }
            resolve(stdout) // return value
        })
    })
}

export default {
    upload,
    download,
    verify
};
