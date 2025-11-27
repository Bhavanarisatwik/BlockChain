
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  try {
      const balance = await ethers.provider.getBalance(deployer.address);
      console.log("Balance:", ethers.formatEther(balance));
  } catch (e) {
      console.error("Error fetching balance:", e);
  }
}

main().catch(console.error);
