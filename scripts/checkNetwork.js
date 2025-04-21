const { createProvider, PROVIDER_RPC } = require('./connectToProvider');

async function checkNetwork() {
  try {
    console.log('Connecting to network...');
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name
    );
    
    // Get the network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network);
    
    // Get the latest block number
    const blockNumber = await provider.getBlockNumber();
    console.log('Latest block number:', blockNumber);
    
    // Get the gas price
    const gasPrice = await provider.getFeeData();
    console.log('Gas price:', gasPrice);
    
    return true;
  } catch (error) {
    console.error('Error connecting to network:', error);
    return false;
  }
}

checkNetwork(); 