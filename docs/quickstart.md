# Quick start

## Generování JWT certifikátů

```
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
cat jwtRS256.key
cat jwtRS256.key.pub
```

## Enviroment promněné

Pro funkčnost aplikace je potřeba nastavit enviroment promněné, buď pomocí `.env` souboru v rootu projektu nebo v rámci systému. Promněné jsou následující:

- **HOME_PAGE** - url of main page - ex. <https://iotplatforma.cloud>
- **INFLUXDB_PASSWORD** - password for admin account to InfluxDB database
- **INFLUXDB_ADMIN_TOKEN** - admin access token to InfluxDB database

[Optional]

- **JWT_EXPIRES_IN** - lifespan of JWT token [default 14 days]
- **FIREBASE_ADMIN_PATH** - path to firebase account credentials file, required only for notification feature
- **OAUTH_SEZNAM_CLIENT_ID** - OAuth2 client id for `Seznam` provider
- **OAUTH_SEZNAM_CLIENT_SECRET** - OAuth2 secret for `Seznam` provider
- **AGENDA_JOB_TYPES** - which agenda jobs are enabled separeted with comma - email, clean
- **LOG_LEVEL** - set logging level, 0 = error, 1 = warning, 2 = info [default], 3 = dev, 4 = debug, 5 = silly
- **WEB_MQTT_URL** - public MQTT over WebSocket url (rabbitmq_web_mqtt) for browser devices - ex. <wss://iotplatforma.cloud:15676/ws>, required only for controllable device feature in profile

- **EMAIL_HOST** - smtp email server
- **EMAIL_PORT** - port on which smtp listen, ssl/tls is required [465]
- **EMAIL_USERNAME** - username to email account
- **EMAIL_PASSWORD** - password to email account

> email is required only for forgot password feature

## Lokální vývoj

Pro spuštění aplikace pro lokální vývoj jsou potřeba tyto příkazy:

```
# instalace potřebných závislostí (node_modules)
yarn

git clone https://github.com/founek2/IOT-Platform.git iot-platform
cd iot-platform

# spustí server obsluhující API požadavky
yarn --cwd packages/backend dev

# server pro obsluhu MQTT zpráv + rabbitMQ authentication server + WebSocket
yarn --cwd packages/backend-mqtt dev

# webový server pro uživatelské rozhraní
yarn --cwd packages/frontend dev

# spustí testy
yarn test
```
