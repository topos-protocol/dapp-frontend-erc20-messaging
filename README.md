<div id="top"></div>
<!-- PROJECT LOGO -->
<br />
<div align="center">

  <img src="./.github/assets/topos_logo.png#gh-light-mode-only" alt="Logo" width="200">
  <img src="./.github/assets/topos_logo_dark.png#gh-dark-mode-only" alt="Logo" width="200">

<br />

<p align="center">
frontend is the React web app to interact with cross-subnet messages on any subnets.
</p>

<br />

</div>

[![codecov](https://codecov.io/gh/toposware/frontend/branch/main/graph/badge.svg?token=FOH2B2GRL9&style=flat)](https://codecov.io/gh/toposware/topos)
![example workflow](https://github.com/toposware/frontend/actions/workflows/test:unit.yml/badge.svg)
![example workflow](https://github.com/toposware/frontend/actions/workflows/test:coverage.yml/badge.svg)
[![](https://dcbadge.vercel.app/api/server/7HZ8F8ykBT?style=flat)](https://discord.gg/7HZ8F8ykBT)

## Getting Started

Install NodeJS by following the guidelines from the [official NodeJS website](https://nodejs.dev/en/).

### Environment

Create an `.env` file, at the root of the project, with the content of `.env.example` and fill the relevant env var values.

```
AUTH0_AUDIENCE=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_ISSUER_URL=
VITE_EXECUTOR_SERVICE_ENDPOINT=http://localhost:3000
VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS=0x0eF66D7Ce86381870EeC547Acd94f6b3926651bc
VITE_TOPOS_CORE_CONTRACT_ADDRESS=0x76394959E430e539b9c30d526c3b70518ca4A3C8
VITE_TOPOS_SUBNET_CHAIN_ID=2357
VITE_TOPOS_SUBNET_CURRENCY_SYMBOL=TOPOS
VITE_TOPOS_SUBNET_ENDPOINT=https://rpc.topos-subnet.devnet-1.toposware.com

```

### Install Dependencies

To installation `npm` dependencies, run the following command:

```
npm i
```

### Run the Application

To start an instance of the application, run the following command:

```
npm start
```

## Development

Contributions are very welcomed, the guidelines are outlined in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Support

Feel free to [open an issue](https://github.com/toposware/dapp-frontend-registrator/issues/new) if you have any feature request or bug report.<br />
If you have any questions, do not hesitate to reach us on [Discord](https://discord.gg/7HZ8F8ykBT)!

## Resources

- Website: https://toposware.com
- Technical Documentation: https://docs.toposware.com
- Medium: https://toposware.medium.com
- Whitepaper: [Topos: A Secure, Trustless, and Decentralized
  Interoperability Protocol](https://arxiv.org/pdf/2206.03481.pdf)

## License

This project is released under the terms of the MIT license.
