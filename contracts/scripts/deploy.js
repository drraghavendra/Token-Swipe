const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy TokenSwipeRouter
  const TokenSwipeRouter = await ethers.getContractFactory("TokenSwipeRouter");
  const router = await TokenSwipeRouter.deploy(deployer.address);
  await router.deployed();
  
  console.log("TokenSwipeRouter deployed to:", router.address);

  // Add supported DEXes on Base
  const DEXES = {
    UNISWAP_V2: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    BASESWAP: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
    AERODROME: "0xcF77a3Ba9A5CA399B7c97a74dA6ea5EB0CaDf6a9"
  };

  for (const [name, address] of Object.entries(DEXES)) {
    await router.addDEX(address);
    console.log(`Added ${name}: ${address}`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "base",
    contracts: {
      TokenSwipeRouter: router.address
    },
    dexes: DEXES,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });