
#!/usr/bin/env bash
set -e
set -x

echo 'Starting track-and-trace-ui...'

serve build
echo 'Done!'

tail -f /dev/null