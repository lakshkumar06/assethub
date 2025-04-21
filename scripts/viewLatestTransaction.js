const { ethers } = require('ethers');
const { createProvider, PROVIDER_RPC } = require('./connectToProvider');

const viewLatestTransaction = async (contractAddress) => {
  try {
    console.log(`Checking latest transaction for contract: ${contractAddress}`);
    
    // Create provider
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name
    );
    
    // Get the current block number
    const currentBlock = await provider.getBlockNumber();
    console.log(`Current block number: ${currentBlock}`);
    
    // Look at a wider range of blocks
    const fromBlock = Math.max(0, currentBlock - 10000);
    console.log(`Searching from block ${fromBlock} to ${currentBlock}`);
    
    // Get all events for the contract
    const filter = {
      address: contractAddress,
      fromBlock: fromBlock,
      toBlock: currentBlock
    };
    
    console.log('Fetching logs...');
    const logs = await provider.getLogs(filter);
    
    if (logs.length === 0) {
      console.log('No transaction logs found in the specified block range.');
      console.log('This could mean:');
      console.log('1. The contract was deployed before the block range we checked');
      console.log('2. The contract doesn\'t emit events when setNumber is called');
      console.log('3. The RPC node doesn\'t support the getLogs method');
      
      // Try to get the contract creation transaction
      console.log('\nTrying to get contract creation transaction...');
      try {
        const history = await provider.getHistory(contractAddress);
        if (history && history.length > 0) {
          console.log('Contract creation transaction:');
          console.log(`Transaction Hash: ${history[0].hash}`);
          console.log(`Block Number: ${history[0].blockNumber}`);
          
          const block = await provider.getBlock(history[0].blockNumber);
          if (block) {
            const timestamp = new Date(block.timestamp * 1000).toISOString();
            console.log(`Timestamp: ${timestamp}`);
          }
        } else {
          console.log('Could not find contract creation transaction');
        }
      } catch (error) {
        console.log('Error getting contract history:', error.message);
      }
      
      return;
    }
    
    console.log(`Found ${logs.length} transaction logs:`);
    
    // Process each log
    for (const log of logs) {
      const block = await provider.getBlock(log.blockNumber);
      const timestamp = new Date(block.timestamp * 1000).toISOString();
      
      console.log(`\nTransaction Hash: ${log.transactionHash}`);
      console.log(`Block Number: ${log.blockNumber}`);
      console.log(`Timestamp: ${timestamp}`);
      console.log(`Log Index: ${log.logIndex}`);
      
      // Try to decode the data if possible
      if (log.data && log.data !== '0x') {
        console.log(`Data: ${log.data}`);
      }
      
      // Get transaction details
      try {
        const tx = await provider.getTransaction(log.transactionHash);
        if (tx) {
          console.log(`From: ${tx.from}`);
          console.log(`To: ${tx.to}`);
          console.log(`Value: ${ethers.formatEther(tx.value)} ETH`);
          console.log(`Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} gwei`);
        }
      } catch (error) {
        console.log('Could not fetch transaction details');
      }
    }
    
    // Get the current value stored in the contract
    try {
      // Create a contract instance to read the stored value
      const abi = [
        "function storedNumber() view returns (uint256)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const storedValue = await contract.storedNumber();
      console.log(`\nCurrent stored value: ${storedValue.toString()}`);
    } catch (error) {
      console.log('Could not read current stored value');
    }
    
  } catch (error) {
    console.error('Error fetching transaction history:', error.message);
  }
};

// Replace with your contract address
const contractAddress = '0x9798FcBd3e0235E7a90B24a33F9926823efEcC9D';

viewLatestTransaction(contractAddress); 