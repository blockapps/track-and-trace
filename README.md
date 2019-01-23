# Track and Trace Demo App
Demo app that uses STRATO to track products through a supply chain using OAuth and Private chains.

# Setup

## Quick Start

```
HOST_IP=<INSERT_IP> docker-compose up -d
```

## Command Line Arguments

| Argument      | Description                                | Required | Default |
| ------------- | ------------------------------------------ | -------- | ------- |
| HOST_IP       | Public IP of host machine                  | Yes      |         |
| SSL           | Should server use SSL                      | No       | false   |
| SSL_CERT_TYPE | Type of SSL certificate                    | No       | crt     |
| SERVER        | Configuration selecter for node middleware | No       | docker  |      

