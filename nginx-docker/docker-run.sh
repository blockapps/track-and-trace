#!/usr/bin/env bash
set -ex

if [ -n "$HOST_IP" ]; then
  if [ "$HOST_IP" = "localhost" ] || [ "$HOST_IP" = "127.0.0.1" ]; then
    echo "You can not use 'localhost' or '127.0.0.1' for HOST_IP - they are not accessible from within the docker container"
  fi
  ln -sf nginx-$(${SSL:-false} || echo "no")ssl.conf /etc/nginx/nginx.conf
  sed -i 's/<HOST_IP>/'"${HOST_IP}"'/g' /etc/nginx/nginx.conf
else
  ln -sf nginx-$(${SSL:-false} || echo "no")ssl-docker.conf /etc/nginx/nginx.conf
fi

# Copy certs if SSL is true 
if [ "$SSL" = true ] ; then
	cp /tmp/ssl/server.key /etc/ssl/
	cp /tmp/ssl/server.${SSL_CERT_TYPE} /etc/ssl/
	sed -i 's/<SSL_CERT_TYPE>/'"$SSL_CERT_TYPE"'/g' /etc/nginx/nginx.conf
fi

# Start nginx
nginx

# Tail logs
tail -n0 -F /var/log/nginx/*.log
