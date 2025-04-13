<p align="center">
  <img src="https://res.cloudinary.com/dhx65uemx/image/upload/v1744449207/xeam_logo_type2-removebg-preview_zonesj.png" alt="XEAM Logo" width="120">
</p>

# XEAM (DApp)

## Overview

**XEAM** is a decentralized application (DApp) that transforms everyday crypto transactions into automatic charitable donations. It combines DeFi staking rewards, Ethereum smart contracts, and nonprofit giving into one seamless, transparent platform.

The platform features a custom ERC-20 smart contract deployed on Ethereum, integrated into a full-stack web app built with Django and Web3.js, offering wallet connection, staking, reward tiers, and donation automation through The Giving Block.

## Purpose and Goals of the XEAM DApp

### Purpose

XEAM empowers users to earn while giving back. Every transaction generates real-world impact through smart contract-powered donations, sent directly to nonprofits — no middlemen.

### Goals

- **Automated Giving**: Dedicate a portion of each transaction to verified charities via The Giving Block.
- **Staking Rewards**: Users earn passive income through tier-based staking.
- **Transparency**: All donations and transactions are recorded on-chain.
- **Wallet Integration**: Connect with MetaMask and other Ethereum wallets.
- **User Dashboard**: View profile, wallet balance, staking rewards, and transaction history.
- **Responsive Interface**: Modern UI/UX with mobile support.
- **Security**: Features like anti-bot, max wallet limits, locked liquidity, and audited contracts.

## User Stories

- **Crypto Users**: Stake XEAM and earn while supporting global causes.
- **Nonprofits & NGOs**: Receive crypto donations automatically with full transparency.
- **DeFi Enthusiasts**: Engage in a mission-driven ecosystem with real utility.
- **Developers**: Use the DApp as a reference for smart contract integration in web platforms.
- **Educators**: Demonstrate blockchain-based giving and smart contract automation in real life.

## Features

- **Staking Dashboard**: Stake, unstake, and view reward multipliers based on tiers.
- **Claim System**: Retrieve unclaimed XEAM rewards.
- **Donation Automation**: 4% of each transaction is routed to the Encouragement Fund.
- **Tokenomics Visuals**: Charts displaying supply distribution and use.
- **Roadmap Timeline**: Milestones from contract launch to DAO governance and NFT series.
- **Admin Functions**: Contract pausing, fee adjustments, and multisig control options.

## Prerequisites

- [MetaMask](https://metamask.io/) wallet installed
- Ethereum testnet or mainnet setup (depending on the network in use)
- XEAM tokens (test or live)

## Dependencies

### Frontend

- [Bootstrap 5](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [Chart.js](https://www.chartjs.org/)
- [Web3.js](https://web3js.readthedocs.io/) or [Ethers.js](https://docs.ethers.io/)

### Backend

- [Python](https://www.python.org/)
- [Django](https://www.djangoproject.com/)
- [Django Rest Framework](https://www.django-rest-framework.org/)
- [MySQL](https://www.mysql.com/) or PostgreSQL
- [Django Admin + ORM](https://docs.djangoproject.com/en/stable/ref/models/)
- [Node.js](https://nodejs.org/) (for utilities like Web3 scripts)

### Smart Contract

- **Solidity 0.8.20**
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [Remix IDE](https://remix.ethereum.org/)
- Deployed to Ethereum or Amoy testnet

## Deployment

The smart contract was developed using Solidity and deployed via **Remix IDE**. Users can interact with it using MetaMask and the frontend DApp.

### Steps:

1. **Open Remix**, paste contract, compile with Solidity `^0.8.20`
2. **Connect MetaMask** to Remix with correct network (e.g., Ethereum testnet or mainnet)
3. **Deploy** using Injected Web3
4. **Verify contract** on Etherscan or testnet explorer and copy the ABI

## Contract Interaction

- Contract ABI is used in the frontend with Web3.js or Ethers.js
- Functions include:
  - `stake()` / `unstake()`
  - `claimRewards()`
  - `setTaxRates()` (owner)
  - `transfer()` / `transferFrom()`
  - DAO voting (planned)

## Contact

📧 Email: [info@xeam.io](mailto:info@xeam.io)
🌐 Website: [xeam.io](https://xeam.io)
🤝 In partnership with [The Giving Block](https://thegivingblock.com)

---




