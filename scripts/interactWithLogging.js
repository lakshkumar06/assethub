const { ethers } = require('ethers');
const { createProvider, PROVIDER_RPC } = require('./connectToProvider');

const interactWithLogging = async (contractAddress, mnemonic, newValue) => {
  try {
    console.log(`Interacting with contract at: ${contractAddress}`);
    
    // Create provider
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name
    );
    
    // Create wallet
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
    console.log(`Wallet address: ${await wallet.getAddress()}`);
    
    // Create contract instance
    const abi = [
      "function storedNumber() view returns (uint256)",
      "function setNumber(uint256 _newNumber) public"
    ];
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Get current value
    const currentValue = await contract.storedNumber();
    console.log(`Current stored value: ${currentValue.toString()}`);
    
    // Set new value
    console.log(`Setting new value to: ${newValue}`);
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    console.log(`Current gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
    
    // Increase gas price by 50% to ensure transaction goes through
    const increasedGasPrice = feeData.gasPrice * BigInt(15) / BigInt(10);
    console.log(`Using increased gas price: ${ethers.formatUnits(increasedGasPrice, 'gwei')} gwei`);
    
    // Send transaction with explicit gas settings
    const tx = await contract.setNumber(newValue, {
      gasPrice: increasedGasPrice,
      gasLimit: 300000, // Set a reasonable gas limit
      type: 2 // EIP-1559 transaction type
    });
    
    console.log(`Transaction sent with hash: ${tx.hash}`);
    console.log('Waiting for transaction to be mined...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log('\nTransaction confirmed!');
    console.log(`Transaction hash: ${receipt.hash}`);
    console.log(`Block number: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    // Get updated value
    const updatedValue = await contract.storedNumber();
    console.log(`Updated stored value: ${updatedValue.toString()}`);
    
    // Get block details
    const block = await provider.getBlock(receipt.blockNumber);
    if (block) {
      const timestamp = new Date(block.timestamp * 1000).toISOString();
      console.log(`Block timestamp: ${timestamp}`);
    }
    
    console.log('\nYou can view this transaction on a block explorer:');
    console.log(`https://westend.subscan.io/tx/${receipt.hash}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    if (error.transaction) {
      console.error('Transaction details:', error.transaction);
    }
  }
};

// Replace with your values
const contractAddress = '0x9798FcBd3e0235E7a90B24a33F9926823efEcC9D';
const mnemonic = 'glass milk vicious dwarf famous achieve short crane book spider obtain hat';
const newValue = 100;

interactWithLogging(contractAddress, mnemonic, newValue); 