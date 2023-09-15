FROM node:18.17.1-alpine3.17
MAINTAINER Ballbot <5252bb@daum.net>

RUN mkdir /app
WORKDIR /app
COPY * ./

RUN ls -al
RUN npm ci && npm run build
RUN mkdir uploads

EXPOSE 3001
ENTRYPOINT ["node", "./dist/main.js"]