FROM node:lts as base
ARG NPM_TOKEN
WORKDIR /usr/src/app
COPY package.json yarn.lock .npmrc ./
RUN npm set //npm.pkg.github.com/:_authToken $NPM_TOKEN

FROM base as build
RUN yarn
COPY . .
RUN yarn build

FROM base as test
RUN yarn
COPY . .
RUN yarn test --watchAll=false

FROM base as coverage
RUN yarn
COPY . .
RUN yarn test:coverage

FROM nginx:1.12-alpine as prod
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD nginx -g daemon off
