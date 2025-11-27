
const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x071B8e1a406b98ef2c1f869F8e0d83C7C7D73449";
    const userAddress = "0x8dFa3C07992ab403B79F1b93E117D9843c51a90E"; // User's new wallet

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const contract = SupplyChain.attach(contractAddress);

    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, userAddress);

    console.log(`Checking Admin Role for ${userAddress}`);
    console.log(`Is Admin: ${isAdmin}`);

    if (isAdmin) {
        console.log("✅ VERIFIED: This wallet is the Admin.");
    } else {
        console.log("❌ FAILED: This wallet is NOT the Admin.");
    }
}

main().catch(console.error);
