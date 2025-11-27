
const { ethers } = require("hardhat");

async function main() {
    const address = "0x8dFa3C07992ab403B79F1b93E117D9843c51a90E";
    const nonce = 0;
    const contractAddress = ethers.getCreateAddress({ from: address, nonce: nonce });
    console.log("Calculated Contract Address:", contractAddress);

    const code = await ethers.provider.getCode(contractAddress);
    console.log("Code length:", code.length);
    if (code.length > 2) {
        console.log("✅ Contract found at this address!");
    } else {
        console.log("❌ No contract code found.");
    }
}

main().catch(console.error);
