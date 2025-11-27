
const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x071B8e1a406b98ef2c1f869F8e0d83C7C7D73449";
    console.log("Checking address:", contractAddress);
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Code length:", code.length);
}

main().catch(console.error);
