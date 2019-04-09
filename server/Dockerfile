FROM node:10-slim

RUN apt-get update && \
    apt-get install -y git && \
    apt-get install -y apt-transport-https && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /usr/src/track-and-trace-server

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y yarn

COPY . /usr/src/track-and-trace-server/

WORKDIR /usr/src/track-and-trace-server
RUN yarn install
RUN yarn build

CMD [ "sh", "/usr/src/track-and-trace-server/docker-run.sh" ]