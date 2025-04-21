const { ethers } = require('ethers');

// Define different networks to check
const networks = [
  {
    name: 'Westend Asset Hub',
    rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
    chainId: 420420421,
    explorer: 'https://westend.subscan.io/account/'
  },
  {
    name: 'Kusama Asset Hub',
    rpc: 'https://kusama-asset-hub-eth-rpc.polkadot.io',
    chainId: 420420420,
    explorer: 'https://kusama.subscan.io/account/'
  },
  {
    name: 'Polkadot Asset Hub',
    rpc: 'https://polkadot-asset-hub-eth-rpc.polkadot.io',
    chainId: 420420419,
    explorer: 'https://polkadot.subscan.io/account/'
  }
];

const checkContractOnNetwork = async (contractAddress, network) => {
  try {
    console.log(`\nChecking ${network.name}...`);
    
    // Create provider for this network
    const provider = new ethers.JsonRpcProvider(network.rpc, {
      chainId: network.chainId,
      name: network.name.toLowerCase().replace(/\s+/g, '-')
    });
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log(`Contract not found on ${network.name}`);
      return false;
    }
    
    console.log(`✅ Contract found on ${network.name}!`);
    
    // Create a contract instance to read the stored value
    const abi = [
      "function storedNumber() view returns (uint256)"
    ];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Get the current value
    const storedValue = await contract.storedNumber();
    console.log(`Current stored value: ${storedValue.toString()}`);
    
    // Get block explorer URL
    console.log(`Block explorer URL: ${network.explorer}${contractAddress}`);
    
    return true;
  } catch (error) {
    console.log(`Error checking ${network.name}: ${error.message}`);
    return false;
  }
};

const checkContractOnAllNetworks = async (contractAddress) => {
  console.log(`Checking contract ${contractAddress} on all networks...`);
  
  let found = false;
  
  for (const network of networks) {
    const exists = await checkContractOnNetwork(contractAddress, network);
    if (exists) {
      found = true;
    }
  }
  
  if (!found) {
    console.log('\nContract not found on any of the checked networks.');
    console.log('Possible reasons:');
    console.log('1. The contract address might be incorrect');
    console.log('2. The contract might be deployed on a different network');
    console.log('3. The contract might not have been properly deployed');
    console.log('4. The contract might have been deployed very recently and not yet indexed');
  }
};

// Replace with your contract address
const contractAddress = '0x9798FcBd3e0235E7a90B24a33F9926823efEcC9D';

checkContractOnAllNetworks(contractAddress); 