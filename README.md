<p align="center">
  <img src="/public/logo-ares.svg" style="width: 400px; margin: 0 auto;" >
</p>

Javascript libraries to help your web and mobile JS/TS applications communicate to Internet Computer Protocol canisters and Internet Identity.

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

| Library           | Version                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| ares-core         | ![npm version](https://img.shields.io/npm/v/@bundly/ares-core)         |
| ares-react-native | ![npm version](https://img.shields.io/npm/v/@bundly/ares-react-native) |
| ares-react        | ![npm version](https://img.shields.io/npm/v/@bundly/ares-react)        |
| ares-rest         | ![npm version](https://img.shields.io/npm/v/@bundly/ares-rest)         |

## Overview

This repository contains JavaScript modules that work as connectors designed to establish seamless communication between Javascript Web and Native applications and ICP Backend Services (Canisters).

Contributors are welcome. While we don't have a formal process for proposals, you are encouraged to open an issue at any time before making a pull request.

## Library Packages Content

1. **ares-rest**

HTTP client for calling REST APIs and seamlessly integrating Internet Identity with them.

2. **ares-core**

A JavaScript library for interacting with the Internet Computer (IC) and identity providers.

3. **ares-react**

Wrapps `ares-core` for React applications and provides a components for ease of use.

4. **ares-react-native**

Provides Internet Identity Middleware provider and AuthButton to enable the Internet Identity integration for React Native Apps.

## How to use

Please visit the dedicated **README.ME** file for each package.

ares-rest [README.ME](https://github.com/bundlydev/ares/blob/main/packages/ares-rest/README.md)

ares-core [README.ME](https://github.com/bundlydev/ares/blob/main/packages/ares-core/README.md)

ares-react [README.ME](https://github.com/bundlydev/ares/blob/main/packages/ares-react/README.md)

ares-react-native [README.ME](https://github.com/bundlydev/ares/blob/main/packages/ares-react-native/README.md)

## Glossary

- **[Internet Computer](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp)**: A blockchain-based, decentralized, and permissionless identity system. Internet Identity allows you to authenticate securely and anonymously while you interact with Internet Computer and its dApps.

- **[Canister](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp#canister-smart-contracts)**: In the context of the Internet Computer, a canister is a computational unit that can hold both smart contract code and state. Each canister has a unique identifier and can communicate with other canisters through inter-canister calls.

- **[Internet Identity](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/overview)**: A decentralized and distributed computing platform that allows developers to build websites, enterprise IT systems, internet services, and software directly on the public Internet. Developed by DFINITY.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository. If you would like to contribute code, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
