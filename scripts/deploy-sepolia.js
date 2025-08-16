const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts to Sepolia with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Factory
  console.log("Deploying LeafswapFactory...");
  const LeafswapFactory = await ethers.getContractFactory("LeafswapFactory");
  const factory = await LeafswapFactory.deploy(deployer.address);
  await factory.deployed();
  console.log("LeafswapFactory deployed to:", factory.address);

  // Deploy Router
  console.log("Deploying LeafswapRouter...");
  const LeafswapRouter = await ethers.getContractFactory("LeafswapRouter");
  // Sepolia WETH address: 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9
  const router = await LeafswapRouter.deploy(factory.address, "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9");
  await router.deployed();
  console.log("LeafswapRouter deployed to:", router.address);

  // Deploy test tokens
  console.log("Deploying test tokens...");
  const TestToken = await ethers.getContractFactory("TestToken");
  const tokenA = await TestToken.deploy("Test Token A", "TKA");
  await tokenA.deployed();
  console.log("Token A deployed to:", tokenA.address);

  const tokenB = await TestToken.deploy("Test Token B", "TKB");
  await tokenB.deployed();
  console.log("Token B deployed to:", tokenB.address);

  // Transfer some tokens to deployer for testing
  const deployerBalance = await tokenA.balanceOf(deployer.address);
  console.log("Deployer Token A balance:", ethers.utils.formatEther(deployerBalance));

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Sepolia Testnet");
  console.log("Deployer:", deployer.address);
  console.log("Factory:", factory.address);
  console.log("Router:", router.address);
  console.log("Token A:", tokenA.address);
  console.log("Token B:", tokenB.address);
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Update frontend/app.js with these contract addresses");
  console.log("2. Set CONTRACT_ADDRESSES in the frontend");
  console.log("3. Test the contracts on Sepolia");
  console.log("4. Consider verifying contracts on Etherscan");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
