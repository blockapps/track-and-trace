FROM nginx:alpine

EXPOSE 80 443

COPY docker-run.sh /

COPY *.conf /etc/nginx/

HEALTHCHECK --interval=2s --timeout=1s --start-period=300s \
  CMD ps -ef | grep nginx | grep master || \
      exit 1

CMD [ "sh", "/docker-run.sh" ]

