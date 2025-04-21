const { ethers } = require('ethers');
const { readFileSync } = require('fs');
const { join } = require('path');
const { createProvider, PROVIDER_RPC } = require('./connectToProvider');

const createWallet = (mnemonic, provider) => {
  return ethers.Wallet.fromPhrase(mnemonic).connect(provider);
};

const loadContractAbi = (contractName) => {
  const contractPath = join(__dirname, '..', 'abis', `${contractName}.json`);
  const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));
  return contractJson;
};

const createContract = (contractAddress, abi, wallet) => {
  return new ethers.Contract(contractAddress, abi, wallet);
};

const sendTransaction = async (contract, method, args, wallet, multiplier = 1) => {
  const nonce = await wallet.getNonce();
  const feeData = await wallet.provider.getFeeData();
  
  // Increase gas price by multiplier
  const gasPrice = feeData.gasPrice * BigInt(multiplier);
  
  const tx = await contract[method](...args, {
    nonce: nonce,
    gasPrice: gasPrice
  });
  
  console.log(`Transaction sent with hash: ${tx.hash}`);
  console.log(`Using gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  
  return tx;
};

const interactWithStorageContract = async (
  contractName,
  contractAddress,
  mnemonic,
  numberToSet
) => {
  try {
    console.log(`Interacting with Storage contract at ${contractAddress}`);

    // Create provider and wallet
    console.log('Creating provider...');
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name
    );
    
    console.log('Creating wallet from mnemonic...');
    const wallet = createWallet(mnemonic, provider);
    console.log('Wallet address:', await wallet.getAddress());

    // Load the contract ABI and create the contract instance
    console.log('Loading contract ABI...');
    const abi = loadContractAbi(contractName);
    console.log('Creating contract instance...');
    const contract = createContract(contractAddress, abi, wallet);
    console.log('Contract instance created');

    // Check if contract exists at the address
    console.log('Checking if contract exists at address:', contractAddress);
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.error('No contract deployed at the specified address');
      return;
    }
    console.log('Contract exists at address');

    // First, read the current value
    console.log('Reading current stored number...');
    const currentValue = await contract.storedNumber();
    console.log(`Current stored number: ${currentValue.toString()}`);

    // Only proceed with setting a new value if it's different
    if (currentValue.toString() === numberToSet.toString()) {
      console.log(`Number is already set to ${numberToSet}, skipping set operation`);
    } else {
      console.log(`Setting new number to ${numberToSet}...`);
      try {
        const tx1 = await sendTransaction(contract, 'setNumber', [numberToSet], wallet, 2);
        console.log('Waiting for transaction to be mined...');
        
        // Set a timeout for the transaction
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000);
        });
        
        try {
          await Promise.race([tx1.wait(), timeoutPromise]);
          console.log(`Number successfully set to ${numberToSet}`);
        } catch (waitError) {
          console.error('Error waiting for transaction:', waitError.message);
          console.log('Transaction may still be pending. Check the transaction hash on a block explorer.');
        }
      } catch (txError) {
        console.error('Error sending transaction:', txError.message);
      }
    }

    // Retrieve the updated number
    console.log('Retrieving stored number...');
    const storedNumber = await contract.storedNumber();
    console.log(`Retrieved stored number: ${storedNumber.toString()}`);

    // Only proceed with doubling if the current value is not already the doubled value
    const doubledValue = numberToSet * 2;
    if (storedNumber.toString() === doubledValue.toString()) {
      console.log(`Number is already set to ${doubledValue}, skipping double operation`);
    } else {
      console.log(`Setting number to double (${doubledValue})...`);
      try {
        const tx2 = await sendTransaction(contract, 'setNumber', [doubledValue], wallet, 3);
        console.log('Waiting for transaction to be mined...');
        
        try {
          await Promise.race([tx2.wait(), timeoutPromise]);
          console.log(`Number successfully set to ${doubledValue}`);
        } catch (waitError) {
          console.error('Error waiting for transaction:', waitError.message);
          console.log('Transaction may still be pending. Check the transaction hash on a block explorer.');
        }
      } catch (txError) {
        console.error('Error sending transaction:', txError.message);
      }
    }

    // Retrieve the final updated number
    console.log('Retrieving final stored number...');
    const updatedNumber = await contract.storedNumber();
    console.log(`Final stored number: ${updatedNumber.toString()}`);
  } catch (error) {
    console.error('Error interacting with Storage contract:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    if (error.transaction) {
      console.error('Transaction details:', error.transaction);
    }
  }
};

// Replace these values with your actual values
const mnemonic = 'glass milk vicious dwarf famous achieve short crane book spider obtain hat';
const contractName = 'Storage';
const contractAddress = '0x9798FcBd3e0235E7a90B24a33F9926823efEcC9D';
const newNumber = 69;

interactWithStorageContract(
  contractName,
  contractAddress,
  mnemonic,
  newNumber
); 