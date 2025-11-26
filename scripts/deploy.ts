import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting SupplyChain deployment...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy SupplyChain contract
  console.log("📦 Deploying SupplyChain contract...");
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(deployer.address);
  
  await supplyChain.waitForDeployment();
  const contractAddress = await supplyChain.getAddress();
  
  console.log("✅ SupplyChain deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", supplyChain.deploymentTransaction()?.hash);

  // Wait for confirmations (skip on localhost as it auto-mines)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    console.log("\n⏳ Waiting for block confirmations...");
    await supplyChain.deploymentTransaction()?.wait(2);
    console.log("✅ Confirmed!\n");
  } else {
    console.log("✅ Deployed on localhost (no confirmations needed)\n");
  }

  // Verify roles are set correctly
  console.log("🔐 Verifying initial roles...");
  const DEFAULT_ADMIN_ROLE = await supplyChain.DEFAULT_ADMIN_ROLE();
  const MANUFACTURER = await supplyChain.MANUFACTURER();
  const AUDITOR = await supplyChain.AUDITOR();
  
  const hasAdminRole = await supplyChain.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasManufacturerRole = await supplyChain.hasRole(MANUFACTURER, deployer.address);
  const hasAuditorRole = await supplyChain.hasRole(AUDITOR, deployer.address);
  
  console.log("  Admin role:", hasAdminRole ? "✅" : "❌");
  console.log("  Manufacturer role:", hasManufacturerRole ? "✅" : "❌");
  console.log("  Auditor role:", hasAuditorRole ? "✅" : "❌");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: supplyChain.deploymentTransaction()?.hash,
    roles: {
      DEFAULT_ADMIN_ROLE,
      MANUFACTURER,
      AUDITOR,
      LOGISTICS: await supplyChain.LOGISTICS(),
      RETAILER: await supplyChain.RETAILER(),
    }
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = deploymentInfo.network === "unknown" ? "localhost" : deploymentInfo.network;
  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

  // Copy ABI for frontend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/SupplyChain.sol/SupplyChain.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const abiPath = path.join(__dirname, "../frontend/src/lib/abi");
    if (!fs.existsSync(abiPath)) {
      fs.mkdirSync(abiPath, { recursive: true });
    }
    fs.writeFileSync(
      path.join(abiPath, "SupplyChain.json"),
      JSON.stringify({ abi: artifact.abi, address: contractAddress }, null, 2)
    );
    console.log("📄 ABI copied to frontend\n");
  }

  console.log("═".repeat(50));
  console.log("🎉 Deployment Complete!");
  console.log("═".repeat(50));
  console.log(`\nContract Address: ${contractAddress}`);
  console.log(`Network: ${networkName} (Chain ID: ${deploymentInfo.chainId})`);
  console.log("\nNext steps:");
  console.log("1. Update NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env.local");
  console.log("2. Run: npx hardhat verify --network sepolia", contractAddress, deployer.address);
  console.log("═".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
