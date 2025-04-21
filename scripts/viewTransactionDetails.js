const { ethers } = require('ethers');
const { createProvider, PROVIDER_RPC } = require('./connectToProvider');

const viewTransactionDetails = async (transactionHash) => {
  try {
    console.log(`Viewing details for transaction: ${transactionHash}`);
    
    // Create provider
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name
    );
    
    // Get transaction
    console.log('Fetching transaction...');
    const tx = await provider.getTransaction(transactionHash);
    
    if (!tx) {
      console.log('Transaction not found. It might be pending or the hash might be incorrect.');
      return;
    }
    
    console.log('\nTransaction details:');
    console.log(`From: ${tx.from}`);
    console.log(`To: ${tx.to}`);
    console.log(`Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} gwei`);
    console.log(`Gas Limit: ${tx.gasLimit.toString()}`);
    console.log(`Nonce: ${tx.nonce}`);
    console.log(`Data: ${tx.data}`);
    
    // Get transaction receipt
    console.log('\nFetching transaction receipt...');
    const receipt = await provider.getTransactionReceipt(transactionHash);
    
    if (!receipt) {
      console.log('Transaction receipt not found. The transaction might be pending.');
      return;
    }
    
    console.log('\nTransaction receipt:');
    console.log(`Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`Effective Gas Price: ${ethers.formatUnits(receipt.effectiveGasPrice, 'gwei')} gwei`);
    
    // Get block details
    console.log('\nFetching block details...');
    const block = await provider.getBlock(receipt.blockNumber);
    
    if (block) {
      const timestamp = new Date(block.timestamp * 1000).toISOString();
      console.log(`Block Timestamp: ${timestamp}`);
      console.log(`Block Hash: ${block.hash}`);
    }
    
    // Try to decode the transaction data
    try {
      console.log('\nDecoding transaction data...');
      const abi = [
        "function setNumber(uint256 _newNumber) public"
      ];
      const iface = new ethers.Interface(abi);
      const decodedData = iface.parseTransaction({ data: tx.data });
      
      console.log('Decoded function call:');
      console.log(`Function: ${decodedData.name}`);
      console.log(`Arguments: ${JSON.stringify(decodedData.args)}`);
    } catch (error) {
      console.log('Could not decode transaction data:', error.message);
    }
    
    // Get the current value of the contract
    try {
      console.log('\nGetting current contract value...');
      const contractAddress = tx.to;
      const abi = [
        "function storedNumber() view returns (uint256)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const storedValue = await contract.storedNumber();
      console.log(`Current stored value: ${storedValue.toString()}`);
    } catch (error) {
      console.log('Could not get current contract value:', error.message);
    }
    
    console.log('\nYou can view this transaction on a block explorer:');
    console.log(`https://westend.subscan.io/tx/${transactionHash}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Replace with your transaction hash
const transactionHash = '0xe760ef6a74e220d23bfa6ba7ebd7abbf68dc6b148e5a0b612994a7a26ce60126';

viewTransactionDetails(transactionHash); 