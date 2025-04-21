const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ethers } = require('ethers');

const viewPolkadotHistory = async (contractAddress) => {
  try {
    console.log(`Checking transaction history for contract: ${contractAddress}`);
    
    // Connect to Westend network
    console.log('Connecting to Westend network...');
    const provider = new WsProvider('wss://westend-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider });
    
    console.log('Connected to Westend network');
    
    // Get the current block number
    const header = await api.rpc.chain.getHeader();
    const currentBlock = header.number.toNumber();
    console.log(`Current block number: ${currentBlock}`);
    
    // Convert Ethereum address to Polkadot format
    // This is a simplified conversion and might not work for all addresses
    const polkadotAddress = contractAddress.replace('0x', '');
    console.log(`Polkadot address format: ${polkadotAddress}`);
    
    // Try to get account info
    try {
      console.log('\nTrying to get account info...');
      const accountInfo = await api.query.system.account(polkadotAddress);
      console.log('Account info:');
      console.log(accountInfo.toHuman());
    } catch (error) {
      console.log('Could not get account info:', error.message);
    }
    
    // Try to get recent events
    try {
      console.log('\nTrying to get recent events...');
      // Get the last 100 blocks
      const fromBlock = Math.max(0, currentBlock - 100);
      console.log(`Searching from block ${fromBlock} to ${currentBlock}`);
      
      // This is a simplified approach and might not work for all cases
      const events = await api.query.system.events();
      console.log(`Found ${events.length} events in the current block`);
      
      // Filter events related to our contract
      const relevantEvents = events.filter(event => {
        const eventData = event.toHuman();
        return JSON.stringify(eventData).includes(contractAddress);
      });
      
      if (relevantEvents.length > 0) {
        console.log(`Found ${relevantEvents.length} relevant events:`);
        relevantEvents.forEach((event, index) => {
          console.log(`\nEvent ${index + 1}:`);
          console.log(event.toHuman());
        });
      } else {
        console.log('No relevant events found');
      }
    } catch (error) {
      console.log('Error getting events:', error.message);
    }
    
    // Get the current value using Ethers.js
    try {
      console.log('\nGetting current value using Ethers.js...');
      const ethersProvider = new ethers.JsonRpcProvider('https://westend-asset-hub-eth-rpc.polkadot.io', {
        chainId: 420420421,
        name: 'westend-asset-hub'
      });
      
      const abi = [
        "function storedNumber() view returns (uint256)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, ethersProvider);
      const storedValue = await contract.storedNumber();
      console.log(`Current stored value: ${storedValue.toString()}`);
    } catch (error) {
      console.log('Error getting current value:', error.message);
    }
    
    // Disconnect from the network
    await api.disconnect();
    console.log('\nDisconnected from Westend network');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Replace with your contract address
const contractAddress = '0x9798FcBd3e0235E7a90B24a33F9926823efEcC9D';

viewPolkadotHistory(contractAddress); 