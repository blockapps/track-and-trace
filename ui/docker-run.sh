
#!/usr/bin/env bash
set -e
set -x

echo 'Starting track-and-trace-ui...'

serve --single build
echo 'Done!'

tail -f /dev/null