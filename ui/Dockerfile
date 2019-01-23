FROM node:9-slim

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    apt-get install -y apt-transport-https && \ 
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /usr/src/track-and-trace-ui

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y yarn

COPY . /usr/src/track-and-trace-ui/

WORKDIR /usr/src/track-and-trace-ui
RUN yarn global add serve
RUN yarn install

CMD [ "sh", "/usr/src/track-and-trace-ui/docker-run.sh" ]