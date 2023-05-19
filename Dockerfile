FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/common/package.json ./packages/common/package.json

RUN npm ci

COPY . ./

RUN npm run frontend:build

RUN npm run backend:build

CMD npm run backend:start:prod
