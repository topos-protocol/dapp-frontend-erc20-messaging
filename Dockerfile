FROM node:lts-alpine

ARG VITE_ERC20_MESSAGING_CONTRACT_ADDRESS
ARG VITE_EXECUTOR_SERVICE_ENDPOINT
ARG VITE_OTEL_SERVICE_NAME
ARG VITE_OTEL_SERVICE_VERSION
ARG VITE_OTEL_EXPORTER_OTLP_ENDPOINT
ARG VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS
ARG VITE_TOPOS_CORE_PROXY_CONTRACT_ADDRESS
ARG VITE_TOPOS_SUBNET_ENDPOINT_WS
ARG VITE_TOPOS_SUBNET_ENDPOINT_HTTP

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/common/package.json ./packages/common/package.json

RUN npm ci

COPY . ./

RUN npm run frontend:build

CMD npm run backend:build && npm run backend:start:prod
