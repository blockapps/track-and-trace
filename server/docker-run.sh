#!/usr/bin/env bash
set -e
set -x

# echo 'Checking if app has been deployed...'
# if [ ! -f config/docker.deploy.yaml ]; then
#     echo 'Deploying app...'
#     npm run deploy
# fi

echo 'Starting track-and-trace-server...'
yarn start > /dev/null 2>&1 &

tail -f /dev/null