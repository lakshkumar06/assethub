const { ethers } = require('ethers');
const { createProvider, PROVIDER_RPC } = require('./connectToProvider');

const viewContractState = async (contractAddress) => {
  try {
    console.log(`Checking contract state at: ${contractAddress}`);
    
    // Create provider
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name
    );
    
    // Check if contract exists at the address
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.error('No contract deployed at the specified address');
      return;
    }
    console.log('Contract exists at address');
    
    // Create a contract instance to read the stored value
    const abi = [
      "function storedNumber() view returns (uint256)"
    ];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Get the current value
    const storedValue = await contract.storedNumber();
    console.log(`Current stored value: ${storedValue.toString()}`);
    
    // Get contract creation info
    try {
      const history = await provider.getHistory(contractAddress);
      if (history && history.length > 0) {
        console.log('\nContract creation transaction:');
        console.log(`Transaction Hash: ${history[0].hash}`);
        console.log(`Block Number: ${history[0].blockNumber}`);
        
        const block = await provider.getBlock(history[0].blockNumber);
        if (block) {
          const timestamp = new Date(block.timestamp * 1000).toISOString();
          console.log(`Timestamp: ${timestamp}`);
        }
      }
    } catch (error) {
      console.log('Could not fetch contract creation info');
    }
    
    // Try to get recent transactions (this might not work on all networks)
    try {
      console.log('\nAttempting to fetch recent transactions...');
      const txCount = await provider.getTransactionCount(contractAddress);
      console.log(`Total transaction count: ${txCount}`);
      
      if (txCount > 0) {
        console.log('Note: Individual transactions may not be retrievable on this network');
      }
    } catch (error) {
      console.log('Could not fetch transaction count');
    }
    
    // Get block explorer URL
    console.log('\nYou can view this contract on a block explorer:');
    console.log(`https://westend.subscan.io/account/${contractAddress}`);
    
  } catch (error) {
    console.error('Error checking contract state:', error.message);
  }
};

// Replace with your contract address
const contractAddress = '0x9798FcBd3e0235E7a90B24a33F9926823efEcC9D';

viewContractState(contractAddress); 