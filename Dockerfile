FROM node:26-alpine3.23

RUN apk add --no-cache openssh-keygen yarn openssl bash unzip && mkdir /keys

RUN mkdir -p /var/www/platform
WORKDIR  /var/www/platform
COPY ./ci  ./ci
COPY Dockerfile assets.zip* ./
RUN yarn global add --silent --cache-folder /tmp/.junk pm2 && rm -rf /tmp/.junk

# Download latest release if no assets.zip present
RUN if [ ! -e "assets.zip" ]; then echo "Downloading latest release" && wget https://github.com/founek2/IOT-Platform/releases/latest/download/assets.zip ; else echo "WARNING Using local release assets.zip"; fi

# Unzip and install dependencies
RUN ./ci/jenkins/docker-build.sh

COPY ./ci/jenkins/docker-entrypoint.sh ./ci/jenkins/generate-jwt-certs.sh .

CMD [ "./docker-entrypoint.sh" ]