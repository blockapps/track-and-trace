# Run tests

## Install blockapps-sol submodule
```
git submodule update --init --recursive --remote
```
## Install dependencies
```
yarn install
```
## Run STRATO
```
./strato --wipe && HTTP_PORT=8080 NODE_HOST=localhost:8080 ./strato --single
```
## Run tests
```
yarn test:asset
```
