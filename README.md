# Ethers.js Asset Hub Project

This project demonstrates how to interact with the Polkadot Asset Hub using Ethers.js. It includes a simple Storage smart contract and scripts to compile, deploy, and interact with it.

## Prerequisites

- Node.js v22.13.1 or later
- npm v6.13.4 or later
- A wallet with some test tokens on the Westend Asset Hub network

## Project Structure

```
ethers-asset-hub/
├── contracts/
│   ├── Storage.sol
├── scripts/
│   ├── connectToProvider.js
│   ├── compile.js
│   ├── deploy.js
│   ├── checkStorage.js
├── abis/
│   ├── Storage.json
├── artifacts/
│   ├── Storage.polkavm
├── contract-address.json
├── package.json
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

1. Compile the smart contract:
```bash
node scripts/compile.js
```

2. Deploy the contract:
   - Edit `scripts/deploy.js` and replace `INSERT_MNEMONIC` with your wallet's mnemonic
   - Run:
```bash
node scripts/deploy.js
```

3. Interact with the contract:
   - Edit `scripts/checkStorage.js` and replace:
     - `INSERT_MNEMONIC` with your wallet's mnemonic
     - `INSERT_CONTRACT_ADDRESS` with the deployed contract address
   - Run:
```bash
node scripts/checkStorage.js
```

## Configuration

The project is configured to connect to the Westend Asset Hub network with the following parameters:
- RPC URL: https://westend-asset-hub-eth-rpc.polkadot.io
- Chain ID: 420420421
- Chain Name: westend-asset-hub

## Security

Never commit your mnemonic or private keys to version control. Always use environment variables or secure key management solutions in production. 