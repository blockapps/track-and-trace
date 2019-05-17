#!/usr/bin/env bash
set -e
set -x

# Copy the correct nginx file
ln -sf nginx-$(${SSL:-false} || echo "no")ssl$(${DEVELOP:-false} || echo "-docker").conf /etc/nginx/nginx.conf

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
