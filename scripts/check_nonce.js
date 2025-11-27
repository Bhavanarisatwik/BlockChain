
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Account:", deployer.address);
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Nonce:", nonce);
}

main().catch(console.error);
