#!/usr/bin/env bash
set -e
set -x

# echo 'Checking if app has been deployed...'
if [ ! -f config/docker.deploy.yaml ]; then
  echo 'Deploying app...'
  SERVER=${SERVER:-docker} yarn deploy
fi

echo 'Starting track-and-trace-server...'
yarn start
