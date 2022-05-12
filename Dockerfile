FROM node:14.15-alpine3.10
RUN apk update && apk add bash
RUN apk add git
RUN apk add  ffmpeg
RUN apk add imagemagick

ARG MONGO_NAME
ENV MONGO_CONTAINER_NAME=$MONGO_NAME
ENV NODE_ENV=production

WORKDIR /pisignage-server

COPY ["package.json", "package-lock.json*", "./"]

#RUN rm -rf node_modues package-lock.json

RUN npm install --production

COPY . .
RUN chmod +x ./wait-for-it.sh

CMD [ "./wait-for-it.sh", "${MONGO_NAME}:27017", "--", "node", "server.js"]