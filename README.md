<p align="center">
  <img src="/public/logo.svg" style="width: 400px; margin: 0 auto;" >
</p>

Javascript libraries to help your frontend and native JS applications communicate to Internet Computer Protocol canisters and Internet Identity.

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

| Library    | Version                                                         | Library         | Version                                                              |
| ---------- | --------------------------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| ic-core-js | ![npm version](https://img.shields.io/npm/v/@bundly/ic-core-js) | ic-react-native | ![npm version](https://img.shields.io/npm/v/@bundly/ic-react-native) |
| ic-react   | ![npm version](https://img.shields.io/npm/v/@bundly/ic-react)   | ic-http-client  | ![npm version](https://img.shields.io/npm/v/@bundly/ic-http-client)  |
| ares       | ![npm version](https://img.shields.io/npm/v/@bundly/ares)       |

## Overview

This repository contains JavaScript modules that work as connectors designed to establish seamless communication between Javascript Web and Native applications and ICP Backend Services (Canisters).

Contributors are welcome. While we don't have a formal process for proposals, you are encouraged to open an issue at any time before making a pull request.

## Library Packages Content

1. **ic-core-js**

Includes :

- Client class that abstracts canister communication.
- Identity Provider Interface defines the methods that should have all identity providers.
- Internet Identity Provider is a class that implements authentication with Internet Identity implementing the methods declared in Identity Provider Interface.

2. **ic-react**

Wrapps `ic-core-js` for React applications and provides a context and hooks for ease of use.

3. **ic-react-native**

Includes Internet Identity Middleware provider and AuthButton to enable the Internet Identity integration for React Native Apps.

4. **ic-http-client**
   TBD

5. **ares**
   TBD

## How to use

Please visit the dedicated **READ.ME** file for each package.

ic-core-js [READ.ME](https://github.com/bundlydev/ic-connect-js/blob/main/packages/ic-core-js/README.md)

ic-react [READ.ME](https://github.com/bundlydev/ic-connect-js/blob/main/packages/ic-react/README.md)

ic-react-native [READ.ME](https://github.com/bundlydev/ic-connect-js/blob/main/packages/ic-react-native/README.md)

ares [READ.ME](https://github.com/bundlydev/ic-connect-js/blob/main/packages/ares/README.md)

## Glossary

- **[Internet Computer](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp)**: A blockchain-based, decentralized, and permissionless identity system. Internet Identity allows you to authenticate securely and anonymously while you interact with Internet Computer and its dApps.

- **[Canister](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp#canister-smart-contracts)**: In the context of the Internet Computer, a canister is a computational unit that can hold both smart contract code and state. Each canister has a unique identifier and can communicate with other canisters through inter-canister calls.

- **[Internet Identity](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/overview)**: A decentralized and distributed computing platform that allows developers to build websites, enterprise IT systems, internet services, and software directly on the public Internet. Developed by DFINITY.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository. If you would like to contribute code, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
