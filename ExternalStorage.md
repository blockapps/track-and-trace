#External Storage

This feature allows users to upload files to a specified S3 bucket and store a record of the transaction as a contract on STRATO.

##Prerequisites before running using External Storage

- S3 bucket Name
- S3 bucket AWS Access Key
- S3 bucket AWS Secret Key
- Bloc user created on STRATO with the following credentials:
  - Username: admin
  - Password: 1234

##Running STRATO with External Storage enabled

We need to use the following command to run STRATO with external storage compatibility:

```
EXT_STORAGE_S3_BUCKET=<YOUR STORAGE BUCKET NAME> \
EXT_STORAGE_S3_ACCESS_KEY_ID=<YOUR ACCESS KEY ID> \
EXT_STORAGE_S3_SECRET_ACCESS_KEY=<YOUR SECRET ACCESS KEY> \
./strato.sh
```

##Running the environment for External Storage web app locally

1. Clone the repository onto your machine.

2. Run the API server with the following steps:
   - `cd server`
   - Create a `.env` file with appropriate user tokens.
   - `cd config`
   - Create a new file called `alten-single.config.yaml` with the following contents:
    ```
    apiDebug: false
    restVersion: 6
    timeout: 120000
    dappPath: ./dapp
    libPath: blockapps-sol/dist
    apiUrl: /api/v1
    deployFilename: ./config/alten-single.deploy.yaml

    nodes:
    - id: 0
        url: "http://alten-single.hosting.blockapps.net:8080"
        publicKey: "6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0"
        port: 30303
        oauth:
        appTokenCookieName: "tt_session"
        scope: "email openid"
        appTokenCookieMaxAge: 7776000000 # 90 days: 90 * 24 * 60 * 60 * 1000
        clientId: "tt-localhost"
        clientSecret: "10352ea6-f286-47cf-936c-2cb7ce6c1c39"
        openIdDiscoveryUrl: "https://keycloak.blockapps.net/auth/realms/track-and-trace/.well-known/openid-configuration"
        redirectUri: "http://localhost/api/v1/authentication/callback"
      logoutRedirectUri: "http://localhost"
    ```
   - `cd ..`
   - `git submodule update --init --recursive`
   - `yarn build`
   - `yarn install`
   - `SERVER=alten-single yarn deploy`
   - `SERVER=alten-single yarn start`
  
3. Run the nginx reverse proxy server with the following steps:
   - `cd nginx-docker`
   - `HOST_IP=$(ipconfig getifaddr en0) docker-compose up -d`
        NOTE: The command to figure out the HOST_IP address (`ipconfig getifaddr en0`) may sometimes result in an incorrect IP address. If you get a bad gateway error while trying to run the application, then run `ifconfig` command and paste the correct IP in this command.

4. Run the front end with the following steps
   - `cd ui`
   - `yarn install`
   - `REACT_APP_URL=http://localhost yarn start`

5. Login with one of the Track and Trace users

6. Go to `localhost/exstorage`


##Running the environment for External Storage web app on the remote node

1. Clone the repository onto your machine.

2. Run the API server with the following steps:
   - `cd server`
   - Create a `.env` file with appropriate user tokens.
   - `cd config`
   - Create a new file called `alten-single.config.yaml` with the following contents:
    ```
    apiDebug: false
    restVersion: 6
    timeout: 120000
    dappPath: ./dapp
    libPath: blockapps-sol/dist
    apiUrl: /api/v1
    deployFilename: ./config/alten-single.deploy.yaml

    nodes:
    - id: 0
        url: "http://alten-single.hosting.blockapps.net:8080"
        publicKey: "6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0"
        port: 30303
        oauth:
        appTokenCookieName: "tt_session"
        scope: "email openid"
        appTokenCookieMaxAge: 7776000000 # 90 days: 90 * 24 * 60 * 60 * 1000
        clientId: "tt-localhost"
        clientSecret: "10352ea6-f286-47cf-936c-2cb7ce6c1c39"
        openIdDiscoveryUrl: "https://keycloak.blockapps.net/auth/realms/track-and-trace/.well-known/openid-configuration"
        redirectUri: "http://localhost/api/v1/authentication/callback"
      logoutRedirectUri: "http://localhost"
    ```
   - `cd ..`
   - `git submodule update --init --recursive`
   - `yarn build`
   - `yarn install`
   - `SERVER=alten-single yarn deploy`
   - `SERVER=alten-single yarn start`
  
3. Run the nginx reverse proxy server with the following steps:
   - `cd nginx-docker`
   - `HOST_IP=$(ipconfig getifaddr en0) docker-compose up -d`
        NOTE: The command to figure out the HOST_IP address (`ipconfig getifaddr en0`) may sometimes result in an incorrect IP address. If you get a bad gateway error while trying to run the application, then run `ifconfig` command and paste the correct IP in this command.

4. Run the front end with the following steps
   - `cd ui`
   - `yarn install`
   - `REACT_APP_URL=http://alten-single.hosting.blockapps.net yarn start`

5. Login with one of the Track and Trace users

6. Go to `localhost/exstorage`