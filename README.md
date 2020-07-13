# Track and Trace Demo App

Demo app that uses STRATO to track products through a supply chain using OAuth and Private chains.

## Setup

### Pre-requisites

1. Install Docker from https://www.docker.com
2. Install `docker-compose` from https://docs.docker.com/compose/install/
3. STRATO node running with parameters:
   ```
    - HTTP_PORT=8080
    - NODE_HOST=localhost:8080
    - OAUTH_ENABLED=true
    - OAUTH_DISCOVERY_URL=https://keycloak.blockapps.net/auth/realms/public/.well-known/openid-configuration
    - OAUTH_CLIENT_ID=<OAUTH_CLIENT_ID_HERE>
    - OAUTH_CLIENT_SECRET=<OAUTH_CLIENT_SECRET_HERE>
   ```

Example command to start STRATO with the correct parameters:

```
HTTP_PORT=8080 \
  NODE_HOST=localhost:8080 \
  OAUTH_ENABLED=true \
  OAUTH_DISCOVERY_URL=https://keycloak.blockapps.net/auth/realms/public/.well-known/openid-configuration \
  OAUTH_CLIENT_ID=<OAUTH_CLIENT_ID_HERE> \
  OAUTH_CLIENT_SECRET=<OAUTH_CLIENT_SECRET_HERE> \
  ./strato --single
```

### Run Track and Trace

#### Clone Track and Trace demo application:

```
git clone https://github.com/blockapps/track-and-trace.git
cd track-and-trace
```

**NOTE:** *STRATO-1565_compatibilityWithOauth* this version of blockapps-sol will be used for new version

#### Token setup:

```
cd server
```

Now create `.env` file and add all the tokens from here: [Get tokens](README.md#tokens)

#### Run application with docker

To run application against the STRATO node running locally (uses config `server/config/docker.config.yaml` by default):

```
docker-compose up -d
```

To run application with the custom configuration - create the new config file at `server/config/mycustomconfig.config.yaml` and run application as follows:

```
SERVER=mycustomconfig docker-compose up -d
```

This will make the application use `server/config/mycustomconfig.config.yaml` configuration file instead of the default.

**Wait for all containers to report healthy status in the output of `docker ps`, then visit http://localhost**

**Note:** to avoid running the deploy script (when running with previously deployed contracts on the blockchain, e.g. on multinode) - copy the deploy file from initial deployment (`docker exec track-and-trace_track-and-trace-server_1 cat config/docker.config.yaml`) to the T&T source directory on the new node: `server/config/docker.deploy.yaml` and rebuild track-and-trace-server docker image. This will make T&T to use existing contracts. For custom SERVER choose the filename accordingly: `server/config/mycustomconfig.deploy.yaml`

#### Run application without docker (for development/debugging)

##### Install dependencies

```
cd server
yarn build
```

##### Start api server

```
yarn install
SERVER=localhost yarn deploy
SERVER=localhost yarn start
```

##### Start nginx

**Note:** Your interface might be different

On Linux your IP can be obtained by `ifconfig`.

```
cd nginx-docker
#
HOST_IP=$(ipconfig getifaddr en0) docker-compose up -d
```

##### Start UI

```
cd ui
yarn install
REACT_APP_URL=http://localhost yarn start
```

### Usernames for oauth server

- administrator@tt.app
- distributor@tt.app
- manufacturer@tt.app
- master@tt.app
- regulator@tt.app
- retailer@tt.app

Password for all users is `1234`

### Tokens

This app uses oauth for authentication. To get admin token and master tokens, use

```
cd server
yarn install
# `SERVER=mycustomconfig` here refers to config file located at: `config/mycustomconfig.config.yaml`:
sudo SERVER=mycustomconfig yarn token-getter
```

Follow the displayed URL and sign-in using OAuth provider login page using credentials of each of the above-mentioned users

These tokens can be provided on the command line as `ADMIN_TOKEN` and `MASTER_TOKEN` respectively. The recommended way is to store these tokens in the `.env` file under the `/server` folder. A valid `.env` file is as follows:

The `.env` with pre-created demo tokens:
```
ADMIN_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMNkVKeVVTNGlHZGlxUkw3UFpLTGVHNWJyelFOZjM2YkVqbGZIdElPQm5ZIn0.eyJqdGkiOiIxZmQ2MWQzNS1mYTdiLTQ5M2ItYjY1MS1kODliNWFhNjY4NDIiLCJleHAiOjIwMjY2NjI0NzUsIm5iZiI6MCwiaWF0IjoxNTk0NjYyNDc1LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmJsb2NrYXBwcy5uZXQvYXV0aC9yZWFsbXMvcHVibGljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImZmOWM2NWZmLWVmY2MtNGFkMS04MmViLWY4NTAzZDM2ZWYzYSIsInR5cCI6IkJlYXJlciIsImF6cCI6InB1YmxpYy1kZXYiLCJhdXRoX3RpbWUiOjE1OTQ2NjI0NzUsInNlc3Npb25fc3RhdGUiOiI4YzllMGU4Ni00OGJhLTQ0MjAtOTNlMy0zNzhlYjQyNmU1MDkiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRyYWNrIGFuZCBUcmFjZSBBZG1pbmlzdHJhdG9yIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW5pc3RyYXRvckB0dC5hcHAiLCJnaXZlbl9uYW1lIjoiVHJhY2sgYW5kIFRyYWNlIiwiZmFtaWx5X25hbWUiOiJBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbmlzdHJhdG9yQHR0LmFwcCJ9.Me2q0IEcuES2uNWi9kFwdJ1TGjdA21QNaCVq1vP6bnpw_qLh2M50lzTIQMMCPSi1vB6oujfvsJYpYbMsKQYkVwiLzePLCxm-2_upmxfSoDE5iUwqZVxdzSTvPEnLskZyZZzt6jC7kOlVzzxZbyYX93SKifDCCvjKuS30PE7NeVOPgWUo8OAwVoigUeeTiT_CLAwYOsC3QUqioKQ42wWArEWjbIViAl4Mbk3FTjGyECNRQb1Il7xKNbLfp6K465HqGgs6gdFS0-hg3HIb6kw6Lv3Vtnky24j2wOQXzQur9siSzaUvT6FLDRqtRsPuICeYq4FPMz3p0_Iv02rQ6IssGg
MASTER_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMNkVKeVVTNGlHZGlxUkw3UFpLTGVHNWJyelFOZjM2YkVqbGZIdElPQm5ZIn0.eyJqdGkiOiJlNTE5MmMzOS1hZGM1LTQ2MzQtYjY1NC0zMzBkNzZiYTMzNzEiLCJleHAiOjIwMjY2NjI1MjgsIm5iZiI6MCwiaWF0IjoxNTk0NjYyNTI5LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmJsb2NrYXBwcy5uZXQvYXV0aC9yZWFsbXMvcHVibGljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjNlMjllOGNhLTkwYzUtNDRhMC05MzI5LTM1NmMzMmMxZjM5NyIsInR5cCI6IkJlYXJlciIsImF6cCI6InB1YmxpYy1kZXYiLCJhdXRoX3RpbWUiOjE1OTQ2NjI1MjgsInNlc3Npb25fc3RhdGUiOiJhYTc0OTQwYi0wNDBmLTQ2ZTgtOTZkOS1jZTA3MzlhYjA4MDIiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRyYWNrIGFuZCBUcmFjZSBNYXN0ZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYXN0ZXJAdHQuYXBwIiwiZ2l2ZW5fbmFtZSI6IlRyYWNrIGFuZCBUcmFjZSIsImZhbWlseV9uYW1lIjoiTWFzdGVyIiwiZW1haWwiOiJtYXN0ZXJAdHQuYXBwIn0.Z8dhKwYPic5eNbeNuDJF0pw-wSv5t-T8Ci_ChoJEi3_5e88wO5-X4-3xYporq4K1GRkiZYJMEZN60kevRJ756nFL64Wp6AlhjcUuj8f4aRENizz0ZVVKGSoadcuMq_XOYCDAfyxfEm_P1T3bI8dWoVjOIk7oOeMtMxTthjQHhbt113zg3FsRhX_xvlpJbDT2BUbbDKn5NuCobZPRU7HK78_icy-bOybmXV0figP-_dpRAqSQkhwX45bwyIjqAitdoUgxZHxoXDMZo12ULhoUMTc2wJdrFfl5tH4nJFlzGrKQlefwIxhJQvjysA1ZJaERNCEvNsVvv0qjZG-7YsSUQg
DISTRIBUTOR_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMNkVKeVVTNGlHZGlxUkw3UFpLTGVHNWJyelFOZjM2YkVqbGZIdElPQm5ZIn0.eyJqdGkiOiI4NGE2NDE0MS0xNGY0LTRlMWUtYWMyMy1kYTQ3NGIwYzdiMTciLCJleHAiOjIwMjY2NjI1NDQsIm5iZiI6MCwiaWF0IjoxNTk0NjYyNTQ0LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmJsb2NrYXBwcy5uZXQvYXV0aC9yZWFsbXMvcHVibGljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6Ijk0OTYyNDA0LWUwNGQtNGNhNS1hZWYwLTc1ZDkyYTc3NjA1OSIsInR5cCI6IkJlYXJlciIsImF6cCI6InB1YmxpYy1kZXYiLCJhdXRoX3RpbWUiOjE1OTQ2NjI1NDQsInNlc3Npb25fc3RhdGUiOiJjMGVlYzk3YS1lZmQ3LTQzMGQtYjc3ZS1jNjFjMWJhMzcxZDIiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRyYWNrIGFuZCBUcmFjZSBEaXN0cmlidXRvciIsInByZWZlcnJlZF91c2VybmFtZSI6ImRpc3RyaWJ1dG9yQHR0LmFwcCIsImdpdmVuX25hbWUiOiJUcmFjayBhbmQgVHJhY2UiLCJmYW1pbHlfbmFtZSI6IkRpc3RyaWJ1dG9yIiwiZW1haWwiOiJkaXN0cmlidXRvckB0dC5hcHAifQ.B23hrICZ0AYM1bmKf4s1pjSjp2N3hz-xnQwttNeZ5SkVOOie-UZqiGM-hlRooaZGVyPWOOd8XP-vroBBjrDIyyalnJRqQgECQw8t9R4KouOfh7mn5SntcoYIvSGo5AJwED4xgPBQCgtU7nSJ2Xc5oNWEMJrFd8FNTbDXqLBtlwfSerpplEXiYQ40cejHtR5gk2Z-0Oz1F-IXgSsvKgIS5yrIeY0MoJbLUd18M7AIbcoqhhPLe8lQtJ-Wo2__AS_esvpixI5vgOhYALbWS_D_Tg_xlN8EX-67tMxYbpD3MvhvK8aOtNkrO4MyWlFZktAZXprS5ee1g90Ue7JYaKT-bw
MANUFACTURER_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMNkVKeVVTNGlHZGlxUkw3UFpLTGVHNWJyelFOZjM2YkVqbGZIdElPQm5ZIn0.eyJqdGkiOiIwYjViYzA4ZC1iMjcyLTQ5Y2EtYTZjOS1mODI1NDA0YTQ0YmMiLCJleHAiOjIwMjY2NjI1NTQsIm5iZiI6MCwiaWF0IjoxNTk0NjYyNTU0LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmJsb2NrYXBwcy5uZXQvYXV0aC9yZWFsbXMvcHVibGljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImIxYTNiMDJhLTlmNWYtNDY3Yi04NTVjLTQwNGQzODk1OWQxNiIsInR5cCI6IkJlYXJlciIsImF6cCI6InB1YmxpYy1kZXYiLCJhdXRoX3RpbWUiOjE1OTQ2NjI1NTQsInNlc3Npb25fc3RhdGUiOiI3ZmU0MDcxZS1lZmY5LTQ4MWMtYmEzNS03YWViN2RhYWJlZDMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRyYWNrIGFuZCBUcmFjZSBNYW51ZmFjdHVyZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYW51ZmFjdHVyZXJAdHQuYXBwIiwiZ2l2ZW5fbmFtZSI6IlRyYWNrIGFuZCBUcmFjZSIsImZhbWlseV9uYW1lIjoiTWFudWZhY3R1cmVyIiwiZW1haWwiOiJtYW51ZmFjdHVyZXJAdHQuYXBwIn0.RNllho__Csvn7h2cpc8py2Qz1u2_bfd-wOArc476YB9BHsErOd4al5AvFfl1aCnJAbIaYapAEDuc2L-9_f0ZN4sNeSbGw7UdmPqjNiV4nYO-HTIkLcaksb2Kq6ax0M37NonIukDfdX_9ERu3r5HKpRQ_yHyouVJPf4JE9xTUcZKVii6eoTlzpznqqn1wEW7e4IdqGa-wKnWHtYKQzhpIBXd0_XcZy_q-YmZpk0LhkWZHDn3iJS-JTPd86F6A9MWYlRfiiv7lLz5u-AnKmtguCA21HbQfV3RndvQQTo7AoWmrWbOyjYDPS498xg067HhYXbZWqWkQ34Js9QTIElnXPw
REGULATOR_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMNkVKeVVTNGlHZGlxUkw3UFpLTGVHNWJyelFOZjM2YkVqbGZIdElPQm5ZIn0.eyJqdGkiOiI4NWMzOWZmMy01NTViLTRjMzUtYTg4My0xNWUzNWU4YzMwZGYiLCJleHAiOjIwMjY2NjI1NjQsIm5iZiI6MCwiaWF0IjoxNTk0NjYyNTY0LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmJsb2NrYXBwcy5uZXQvYXV0aC9yZWFsbXMvcHVibGljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImRiMmRiZDczLWUzM2UtNDk3ZC1iYmQzLThiNjhjZDg3YTliNCIsInR5cCI6IkJlYXJlciIsImF6cCI6InB1YmxpYy1kZXYiLCJhdXRoX3RpbWUiOjE1OTQ2NjI1NjQsInNlc3Npb25fc3RhdGUiOiJmY2ZjMDI5ZS0xOGQ0LTRhMTQtOTMyNS0xN2M3YTZkZjZlZDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRyYWNrIGFuZCBUcmFjZSBSZWd1bGF0b3IiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJyZWd1bGF0b3JAdHQuYXBwIiwiZ2l2ZW5fbmFtZSI6IlRyYWNrIGFuZCBUcmFjZSIsImZhbWlseV9uYW1lIjoiUmVndWxhdG9yIiwiZW1haWwiOiJyZWd1bGF0b3JAdHQuYXBwIn0.di6zh_fRB7kupmSfzlPyjtbfuctxgckRohZ5R6d1w3cjM75GhQx108sJZ8kykzFWS6aYnQsYkEB6IZK2OfZVn4SnDk47cEIyrtannyuqlLF0k1yG5zDuoAQPZGclAVfMvfM3x_KRaPRw1-OxCUUj4XWLyiTY2GkRzbmUWmsx1mtlFWn0-5mNi7-wG7mzF2oiFbi672OSI5OtdeJsywoA0mWYidlt-JzQPRuEbPg14Ny2EL6h6auWiNw3w3imB-nfRQ22eotuVZEnib8UzLCpW4wZIaR4a1O-5_rtqCGLWNBr6UEg8H6nRMURXJk3dJHZIMicCWWx2yOUDtry3ypfjQ
RETAILER_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMNkVKeVVTNGlHZGlxUkw3UFpLTGVHNWJyelFOZjM2YkVqbGZIdElPQm5ZIn0.eyJqdGkiOiI1YjRjYjA1OS1mYzBmLTQwMTktYTI3NC1kZDU3ZWFhZWI0ZjQiLCJleHAiOjIwMjY2NjI1NzMsIm5iZiI6MCwiaWF0IjoxNTk0NjYyNTc0LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmJsb2NrYXBwcy5uZXQvYXV0aC9yZWFsbXMvcHVibGljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImExZDBhNDQ3LTQzNGYtNDUwNi1hZmM3LWQxMWQxYjE0MTM3NiIsInR5cCI6IkJlYXJlciIsImF6cCI6InB1YmxpYy1kZXYiLCJhdXRoX3RpbWUiOjE1OTQ2NjI1NzMsInNlc3Npb25fc3RhdGUiOiJiMmViMjg1YS0yN2YxLTQ4ZmMtOThmYi04MjZkZDRiYjJjYzIiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRyYWNrIGFuZCBUcmFjZSBSZXRhaWxlciIsInByZWZlcnJlZF91c2VybmFtZSI6InJldGFpbGVyQHR0LmFwcCIsImdpdmVuX25hbWUiOiJUcmFjayBhbmQgVHJhY2UiLCJmYW1pbHlfbmFtZSI6IlJldGFpbGVyIiwiZW1haWwiOiJyZXRhaWxlckB0dC5hcHAifQ.aMmmvuzyu_SYM5iO91zUM5ZsXldXz4Lih3rVog5Ybj8S2F0ePFCLTcy_3FfGVJOfCFo7ok7qO0eCcu90WsKu5TzDoeI9QwOogD51Bjf-Hl5acSIZUuV288w3JdXXEwvVTzXfCVAd_jxXX8CSzDmGV1czuU8oamwtcH68ETMD5iMn4rqkO_HBu3q48HPzfTu0wPXK7JTOItyeARR3PFU-flL4Rh5MzgX5IdiS8CBr9AqNEKAhj55zAcfq-SrjA2DKX4fmwP-q2jfZrIUyYdDuECBF70FUQq29G3QeXnhFejBNusY-TdDQZbm8jbRcTxV83JkD8M52-RFy8RoGd-Ccpg
```

## Run tests

```
cd server
yarn install
yarn build
yarn test
```

## Usage Guide

The above tokens correspond to four different users in in four different roles:

1. manufacturer@tt.app in Manufacturer role : This user can create the original asset
2. distributor@tt.app in Distributor role : This user can bid on an asset after its creation
3. retailer@tt.app in Retailer role : Similar to the distributor role but could be expanded in the future.
4. regulator@tt.app in Regulator role: This user can see the audit history for all assets and bidding activity

### Basic flow

1. A manufacturer logs in and creates an asset
2. Manufacturer makes asset available for bidding
3. A Distributor can then bid on this asset. The bid is created on private chain (state channel) and the bid information can only be accessed by the asset owner (manufacturer), distributor and regulator
4. The owner of the asset (manufacturer) can accept or reject the bid. If the bid is accepted, the owner of the asset changes to the user that placed the bid.
5. This same process then repeats between the distributor and retailer.

### Creating an asset

![Manufacturer creating an asset](docs/manufacturer-create-asset.gif)

### Request Bids

![Manufacturer requesting bids](docs/manufacturer-request-bids.gif)

### Placing a Bid

![Distributor placing a bid](docs/distributor-place-bid.gif)

### Accepting a Bid

![Manufacturer accepting a bid](docs/manufacturer-accept-bid.gif)

### Viewing Audit Logs

![Regulator views audit trail](docs/regulator-view-audit-trail.gif)

## Additional information

### Run with minishift

#### Run STRATO on minishift with OAuth configured for track-and-trace

These are the steps to run this app against the STRATO deployed in minishift (local Openshift).
STRATO should be deployed in minishift using blockapps/strato-openshift, branch `update-to-4.4` (until merged to master):

```
./deploy_strato_minishift.sh
```

Follow the steps, enter:

```
OAUTH discovery url: https://keycloak.blockapps.net/auth/realms/public/.well-known/openid-configuration
STRATO v4.2-compatible OAuth : yes
uiPassword: any
```

Your STRATO should become available at `http://node-strato.$(minishift ip).nip.io` (where `$(minishift ip)` resolves to your local minishift vm ip)
This may take few minutes.

#### Run track-and-trace app against STRATO in minishift

To run track-and-trace against STRATO in minishift:

1. edit server/config/minishift.config.yaml by changing the url to `http://node-strato.$(minishift ip).nip.io` (resolve the IP first)
2. from track-and-trace root dir execute:

```
SERVER=minishift docker-compose up -d --build
```

Done. The application should be available on `http://localhost` in few minutes.
