const { ethers } = require('ethers');

// Function to decode transaction data
function decodeTransactionData(data) {
    try {
        // Create an interface for the contract function
        const iface = new ethers.Interface([
            "function setNumber(uint256 _newNumber)"
        ]);

        // Parse the transaction data
        const decodedData = iface.parseTransaction({ data });
        
        console.log("\nDecoded function call:");
        console.log("Function:", decodedData.name);
        
        // Convert BigInt to Number for display
        const newNumber = Number(decodedData.args[0]);
        console.log("New number set to:", newNumber);
        
        return decodedData;
    } catch (error) {
        console.error("Error decoding transaction data:", error);
        throw error;
    }
}

// The transaction data to decode
const txData = "0x3fb5c1cb0000000000000000000000000000000000000000000000000000000000000045";

console.log("Decoding transaction data:", txData);
decodeTransactionData(txData); 