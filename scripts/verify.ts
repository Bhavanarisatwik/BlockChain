import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 Starting contract verification...\n");

  // Load deployment info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentPath = path.join(__dirname, `../deployments/${networkName}.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found: ${deploymentPath}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  console.log("📄 Loaded deployment info:");
  console.log("  Contract:", deploymentInfo.contractAddress);
  console.log("  Deployer:", deploymentInfo.deployerAddress);
  console.log("  Network:", deploymentInfo.network);

  console.log("\n⏳ Verifying contract on Etherscan...");

  try {
    await run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: [deploymentInfo.deployerAddress],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ Contract is already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
