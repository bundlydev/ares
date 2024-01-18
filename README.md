# ic-connect-js

Welcome to the `ic-connect-js` monorepo!

## Overview

This monorepo contains the source code for the `ic-connect-js` library, which contains 3 different SDKs that enable you to consume Internet Computer(IC) backend services seamlessly.

## Packages content

1. **ic-core-js**

   Includes :

   - Client class abstracts canister communication.
   - Identity Provider Interface defines the methods that should have all identity providers.
   - Internet Identity Provider is a class that implements authentication with Internet Identity implementing the methods declared in Identity Provider Interface.

2. **ic-react**

   Manages authentication flow with Internet Identity and enables react components to interact with frontend client.

3. **ic-react-native**

   Manages authentication flow of ic-react but for react-native using the Internet Identity middleware.

## Glossary

- **[Internet Computer](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp)**: A blockchain-based, decentralized, and permissionless identity system. Internet Identity allows you to authenticate securely and anonymously while you interact with Internet Computer and its dapps.

- **[Canister](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp#canister-smart-contracts)**: In the context of the Internet Computer, a canister is a computational unit that can hold both smart contract code and state. Each canister has a unique identifier and can communicate with other canisters through inter-canister calls.

- **[Internet Identity](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/overview)**: A decentralized and distributed computing platform that allows developers to build websites, enterprise IT systems, internet services, and software directly on the public Internet. Developed by DFINITY.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository. If you would like to contribute code, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
