const { run } = require('runjs')

const isWindows = process.platform == 'win32'; // even 64-bit uses win32

// On Windows run scripts with -- [value] EX: npm run deploy -- toolbox

function configure(environment = 'localhost') {
  try {
    if (isWindows) {
      run('more config.yaml')
    } else {
      run('cat config.yaml');
    }
    console.log("WARNING: 'config.yaml' exists - skipping the configure step")
  } catch (e) {
    console.log('ENVIRONMENT - ', environment);
    if (isWindows) {
      run(`copy server\\config\\${environment}.config.yaml .\\config.yaml`)
    } else {
      run(`cp server/config/${environment}.config.yaml ./config.yaml`)
    }
    console.log('./config.yaml was successfully created');
  }
}

function deploy(environment, presetFilename) {
  configure(environment);
  const presetArg = (presetFilename == undefined) ? '' : `--presetFilename server/presets/${presetFilename}.yaml`;
  run(`mocha server/dapp/dapp/dapp.deploy.js --config config.yaml ${presetArg}`)
}

module.exports = {
  configure,
  deploy,
}
