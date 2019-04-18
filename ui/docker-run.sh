
#!/usr/bin/env bash
set -e
set -x

echo 'Starting track-and-trace-ui...'

yarn build
serve --single build
echo 'Done!'

tail -f /dev/null