# Track and Trace Demo App
Demo app that uses STRATO to track products through a supply chain using OAuth and Private chains.

# Setup

## Instructions for Development using OAuth

### Start api server
```
cd server
yarn install
yarn start

```

### Start UI
```
cd ui
yarn install
APP_URL=http://localhost yarn start
```

### Start nginx
```
cd nginx-docker
HOST_IP=<YOUR_IP> docker-compose up -d
```

Your ip can be obtained by `ifconfig`.

### Usernames for oauth server
administrator@track-and-trace.app
distributor@track-and-trace.app 	
manufacturer@track-and-trace.app 	
master@track-and-trace.app 	
regulator@track-and-trace.app 	
retailer@track-and-trace.app

Password for all users is `1234`

## Command Line Arguments

| Argument      | Description                                | Required | Default |
| ------------- | ------------------------------------------ | -------- | ------- |
| SSL           | Should server use SSL                      | No       | false   |
| SSL_CERT_TYPE | Type of SSL certificate                    | No       | crt     |
| SERVER        | Configuration selecter for node middleware | No       | docker  |      

