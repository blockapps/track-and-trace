#!/usr/bin/env bash
set -e
set -x

# Ensure HOST_IP is provided
if [ -z "$HOST_IP" ]; then
  echo "HOST_IP variable is not set. Please provide the external IP of the host for nginx to be able to reach app running on the host"
else
  if [ "$HOST_IP" = "localhost" ] || [ "$HOST_IP" = "127.0.0.1" ]; then
    echo "You cannot use 'localhost' or '127.0.0.1' for HOST_IP - they are not accessible from within the docker container"
  fi
fi

# Copy the correct nginx file
ln -sf nginx-$(${SSL:-false} || echo "no")ssl.conf /etc/nginx/nginx.conf

# Copy certs if SSL is true 
if [ "$SSL" = true ] ; then
	cp /tmp/ssl/server.key /etc/ssl/
	cp /tmp/ssl/server.${SSL_CERT_TYPE} /etc/ssl/
	sed -i 's/<SSL_CERT_TYPE>/'"$SSL_CERT_TYPE"'/g' /etc/nginx/nginx.conf
fi

# Update nginx configuration with the HOST IP
sed -i 's/<HOST_IP>/'"${HOST_IP}"'/g' /etc/nginx/nginx.conf

# Start nginx
nginx

# Tail logs
tail -n0 -F /var/log/nginx/*.log