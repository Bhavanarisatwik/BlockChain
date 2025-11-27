
const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const nonce = await provider.getTransactionCount(deployerAddress);
    console.log(`Nonce: ${nonce}`);

    if (nonce > 0) {
        // Calculate address of the last deployed contract (nonce - 1)
        const contractAddress = ethers.getCreateAddress({ from: deployerAddress, nonce: nonce - 1 });
        console.log(`Last Contract Address: ${contractAddress}`);

        const code = await provider.getCode(contractAddress);
        console.log(`Code Length: ${code.length}`);
    }
}

main().catch(console.error);
