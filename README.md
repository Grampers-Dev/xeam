# xeam (DAAP)

## Overview

Identity Protocol is a Layer 2 solution web application that allows users to interact with a blockchain smart contract for claiming Ethereum addresses. The application integrates a Solidity smart contract deployed on the Polygon Mumbai testnet, providing functionalities such as claiming and unclaiming addresses, and administrative controls like pausing and unpausing contract functions.

## Purpose and Goals of the Identity Protocol Application

### Purpose

The Identity Protocol serves as a comprehensive web application for interacting with the Ethereum blockchain, particularly designed for identity management. It provides users with a secure and efficient way to claim, verify, and manage Ethereum addresses.

### Goals

- **Identity Claiming**: Allow users to claim their Ethereum addresses securely. This feature enables a robust method of address verification and identity management on the blockchain.

- **Admin Controls**: Provide administrative functionalities to manage the application effectively. This includes pausing and unpausing contract functionalities to ensure operational control.

- **MetaMask Integration**: Seamlessly integrate with MetaMask, a popular Ethereum wallet, to facilitate user interactions with the blockchain directly from their browsers.

- **Real-Time Transaction Monitoring**: Enable users to monitor transactions and interactions with the smart contract in real-time, using tools like Mumbai PolygonScan for the Mumbai testnet.

- **Responsive Web Interface**: Offer a user-friendly and responsive web interface built with Bootstrap 5, ensuring accessibility and ease of use across various devices.

- **Security and Reliability**: Implement robust security measures and error handling to manage network issues, API errors, and user inputs, enhancing the application's overall reliability.

### User Stories

- **Blockchain Enthusiasts**: For individuals keen on exploring blockchain technology, Identity Protocol offers an intuitive platform for managing and verifying Ethereum addresses.
- **Crypto Users**: Users who frequently interact with Ethereum can utilize the Identity Protocol for secure address management and identity verification.
- **Security-focused Individuals**: Users concerned with the security of their blockchain identity can leverage the Identity Protocol to claim and manage their addresses securely.
- **Developers and Researchers**: The platform serves as a valuable tool for developers and researchers interested in blockchain identity solutions, providing a practical implementation of Ethereum address management.
- **Educators and Students**: As a practical application of blockchain technology, Identity Protocol can be an educational tool for those learning about blockchain identity management and Ethereum functionalities.

## Usage

### Configuration and Setup

1. **MetaMask Integration**: Users must configure MetaMask to connect with the Mumbai testnet to interact with the Identity Protocol.
2. **Claiming Identity**: Through the web interface, users can claim their Ethereum addresses after connecting their MetaMask wallet.
3. **Admin Features**: Contract owners can access administrative functions like pausing and unpausing the smart contract.
4. **Transaction Monitoring**: Users can monitor their interactions with the smart contract in real-time using Mumbai PolygonScan.

For more detailed instructions on usage and interaction with the Identity Protocol, please refer to the [User Guide](#).

## Features

- **Ethereum Address Claim**: Users can claim their own Ethereum address.
- **Check Claim Status**: Users can check if an address has been claimed.
- **Unclaim Address**: Users can unclaim their address.
- **Admin Controls**: Contract owner can pause and unpause the contract functionalities.
- **Responsive Web Interface**: Built with Bootstrap 5 for a responsive and intuitive user interface.
- **Comment Modal**: A feature that allows users to submit comments, enhancing interaction and user engagement.

## Prerequisites

- [MetaMask](https://metamask.io/) wallet installed and configured for the Mumbai testnet.
- Test MATIC tokens from the [Mumbai Polygon Faucet](https://faucet.polygon.technology/).
- Test tokens can also be requested from the site admin as we have a reserve batch of test tokens.

## Dependencies

### Frontend

- [Bootstrap 5](https://getbootstrap.com/)
- [Font Awesome 5](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [jQuery](https://jquery.com/)
- [Chart.js](https://www.chartjs.org/)
- [Web3.js](https://web3js.readthedocs.io/) or [Ethers.js](https://docs.ethers.io/)

### Backend

- **Python**: A high-level, interpreted programming language used for backend logic. - [Python](https://www.python.org/)
- **Django**: A Python-based web framework that follows the model-template-views architectural pattern. - [Django](https://www.djangoproject.com/)
- **MySQL**: An open-source relational database management system. - [MySQL](https://www.mysql.com/)
- **Django ORM**: An integral part of Django for database interactions using Python code. Provides a layer of abstraction over SQL queries.
- **Django Admin**: A built-in feature of Django for easy administration of the database through a web interface.
- **Django Rest Framework**: A powerful toolkit for building Web APIs in Django projects. - [Django Rest Framework](https://www.django-rest-framework.org/)
- **Python Virtual Environment**: A tool for creating isolated Python environments. Essential for managing dependencies specific to the project.
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine. Used for running JavaScript on the server-side. - [Node.js](https://nodejs.org/)

### Smart Contract

- **Solidity 0.8.20**: A programming language for writing smart contracts on the Ethereum blockchain. - [Solidity Docs](https://docs.soliditylang.org/en/v0.8.20/)
- **OpenZeppelin Contracts**: A library of secure and reusable smart contract components. - [OpenZeppelin](https://openzeppelin.com/contracts/)
- **Remix IDE**: An open-source web and desktop application for Solidity development, used to write, test, and deploy the smart contract. - [Remix IDE](https://remix.ethereum.org/)

## Deploying the Smart Contract Using Remix IDE

The **Identity Protocol**'s smart contract was developed using Solidity and deployed to the Polygon Mumbai testnet via **Remix IDE**. Here’s how to deploy the contract:

### 1. **Set Up Remix IDE**:
   - Open [Remix IDE](https://remix.ethereum.org/).
   - Select the **Solidity** compiler version `0.8.20` (or the version compatible with your smart contract).

### 2. **Write and Compile the Smart Contract**:
   - Create a new Solidity file in Remix (e.g., `IdentityProtocol.sol`).
   - Write or paste the smart contract code in the file.
   - Click on the **Solidity Compiler** tab and compile the contract.

### 3. **Connect MetaMask to Remix IDE**:
   - Ensure MetaMask is set to the **Polygon Mumbai testnet**.
   - In Remix, go to the **Deploy & Run Transactions** tab.
   - Select **Injected Web3** as the environment to connect Remix with your MetaMask wallet.
   - Ensure the correct account and network are selected in MetaMask.

### 4. **Deploy the Smart Contract**:
   - After connecting Remix to MetaMask, select the contract from the dropdown in the **Deploy & Run Transactions** tab.
   - Click on **Deploy** to deploy the contract to the Polygon Mumbai testnet.
   - Confirm the transaction in MetaMask to complete the deployment.

## Verifying the Smart Contract

Once the smart contract is deployed, you can verify it on the Mumbai PolygonScan to obtain the **ABI code** required to interact with the contract in your web application.

### 1. **Verify the Contract on PolygonScan**:
   - Go to [Polygon Mumbai Scan](https://mumbai.polygonscan.com/).
   - Search for your deployed contract address (you can get this from Remix or MetaMask).
   - Once on the contract page, click on the **Verify and Publish** button.
   - Fill in the necessary details, including the contract’s source code, compiler version, and optimization settings (ensure they match the settings used during deployment).
   - After submitting, PolygonScan will verify the contract.

### 2. **Obtain the ABI Code**:
   - After the contract is verified, PolygonScan will display the **ABI code** under the **Contract** tab.
   - Copy the **ABI** and use it in your web application to interact with the smart contract via **Web3.js** or **Ethers.js**.


