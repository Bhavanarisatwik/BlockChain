
const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // The address user is connected with (Account #0)
    const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // The contract address from .env.local (I need to read this or assume it from previous steps)
    // From previous step: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log(`Checking Admin Role on Localhost...`);
    console.log(`Contract: ${contractAddress}`);
    console.log(`User: ${userAddress}`);

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const contract = SupplyChain.attach(contractAddress).connect(provider);

    try {
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, userAddress);
        console.log(`Is Admin: ${isAdmin}`);
    } catch (error) {
        console.error("Error checking role:", error);
    }
}

main().catch(console.error);
