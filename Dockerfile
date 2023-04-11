FROM node:lts as base
ARG NPM_TOKEN
WORKDIR /usr/src/app
COPY package.json package-lock.json .npmrc ./
RUN npm set //npm.pkg.github.com/:_authToken $NPM_TOKEN

FROM base as build
RUN npm install
COPY . .
RUN npx nx build frontend
RUN npx nx build backend

FROM base as test
RUN npm install
COPY . .
RUN npm test --watchAll=false

FROM base as coverage
RUN npm install
COPY . .
RUN npm run test:coverage

FROM node:lts as prod
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist/apps .
CMD node backend/main.js
