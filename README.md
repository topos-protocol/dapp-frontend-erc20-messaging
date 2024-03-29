<div id="top"></div>
<!-- PROJECT LOGO -->
<br />
<div align="center">

  <img src="./.github/assets/topos_logo.png#gh-light-mode-only" alt="Logo" width="200">
  <img src="./.github/assets/topos_logo_dark.png#gh-dark-mode-only" alt="Logo" width="200">

<br />

<p align="center">
dApp Frontend ERC20 Messaging is the web app to transfer ERC20 tokens across any subnets.
</p>

<br />

</div>

<div align="center">

![docker-build](https://github.com/topos-protocol/dapp-frontend-erc20-messaging/actions/workflows/docker_build_push.yml/badge.svg)
![test](https://github.com/topos-protocol/dapp-frontend-erc20-messaging/actions/workflows/test.yml/badge.svg)
![release](https://img.shields.io/github/v/release/topos-protocol/dapp-frontend-erc20-messaging)
[![codecov](https://codecov.io/gh/topos-protocol/dapp-frontend-erc20-messaging/graph/badge.svg?token=gP7Zvl56fx)](https://codecov.io/gh/topos-protocol/dapp-frontend-erc20-messaging)
[![](https://dcbadge.vercel.app/api/server/7HZ8F8ykBT?style=flat)](https://discord.gg/7HZ8F8ykBT)

</div>

## Getting Started

Install NodeJS by following the guidelines from the [official NodeJS website](https://nodejs.dev/en/).

### Environment

In all `packages/*` workspaces, create an `.env` file, at the root of the workspace, with the content of `.env.example` and fill the relevant env var values.

### Install Dependencies

To installation `npm` dependencies, run the following command:

```
npm install
```

### Run the Application

To start an instance of the application, you need to 1. build the Frontend and 2. run the Backend:

#### Build the Frontend

```
npm run frontend:build
```

#### Run the Backend

```
npm run backend:start
```

## Development

Contributions are very welcomed, the guidelines are outlined in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Support

Feel free to [open an issue](https://github.com/topos-protocol/dapp-frontend-erc20-messaging/issues/new) if you have any feature request or bug report.<br />
If you have any questions, do not hesitate to reach us on [Discord](https://discord.gg/7HZ8F8ykBT)!

## Resources

- Website: https://toposware.com
- Technical Documentation: https://docs.toposware.com
- Medium: https://toposware.medium.com
- Whitepaper: [Topos: A Secure, Trustless, and Decentralized
  Interoperability Protocol](https://arxiv.org/pdf/2206.03481.pdf)

## License

This project is released under the terms of the MIT license.
