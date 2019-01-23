FROM nginx:alpine

EXPOSE 80
EXPOSE 443

COPY docker-run.sh /
COPY *.conf /etc/nginx/

CMD [ "sh", "/docker-run.sh" ]

