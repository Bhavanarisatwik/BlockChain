
const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log(`Checking contract at ${contractAddress}...`);

    try {
        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
            console.log("❌ No code found at this address! The node might have been restarted without redeploying.");
        } else {
            console.log(`✅ Contract code found (${code.length} bytes).`);

            // Check admin role
            const SupplyChain = await ethers.getContractFactory("SupplyChain");
            const contract = SupplyChain.attach(contractAddress).connect(provider);
            const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
            const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
            const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer);
            console.log(`Deployer (${deployer}) is Admin: ${isAdmin}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main().catch(console.error);
