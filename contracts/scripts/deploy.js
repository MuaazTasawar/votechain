const { ethers } = require("hardhat");

async function main() {
  console.log("🗳️  Deploying VoteChain...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  const VoteChain = await ethers.getContractFactory("VoteChain");
  const voteChain = await VoteChain.deploy();
  await voteChain.waitForDeployment();

  const address = await voteChain.getAddress();
  console.log("✅ VoteChain deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Paste it into frontend/.env.local as NEXT_PUBLIC_CONTRACT_ADDRESS");
  console.log("3. The ABI is already synced at frontend/src/lib/contract.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });