const hre = require("hardhat");

async function main() {
  console.log("Deploying Carbon Credit Token...");

  // Get the contract factory
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  
  // Deploy the contract
  const carbonCreditToken = await CarbonCreditToken.deploy();
  
  // Wait for deployment to finish
  await carbonCreditToken.deployed();
  
  console.log(`Carbon Credit Token deployed to: ${carbonCreditToken.address}`);
  
  // Verify the contract on Etherscan (if on a public network)
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for 6 block confirmations...");
    await carbonCreditToken.deployTransaction.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: carbonCreditToken.address,
      constructorArguments: [],
    });
    
    console.log("Contract verified on Etherscan!");
  }
  
  // Create a sample project
  console.log("Creating a sample project...");
  const createProjectTx = await carbonCreditToken.createProject(
    "Amazon Rainforest Conservation",
    "Brazil",
    "Forest Conservation",
    "VCS",
    50000 // 50,000 metric tons of CO2
  );
  await createProjectTx.wait();
  
  console.log("Sample project created with ID: 0");
  
  // Verify the project
  console.log("Verifying the project...");
  const verifyProjectTx = await carbonCreditToken.verifyProject(0);
  await verifyProjectTx.wait();
  
  console.log("Project verified and tokens issued!");
  
  // Get project details
  const projectDetails = await carbonCreditToken.getProject(0);
  console.log("Project Details:");
  console.log(`Name: ${projectDetails[0]}`);
  console.log(`Location: ${projectDetails[1]}`);
  console.log(`Type: ${projectDetails[2]}`);
  console.log(`Standard: ${projectDetails[3]}`);
  console.log(`Carbon Reduction: ${projectDetails[4]} metric tons`);
  console.log(`Issuance Date: ${new Date(projectDetails[5] * 1000).toLocaleString()}`);
  console.log(`Verified: ${projectDetails[6]}`);
  console.log(`Verifier: ${projectDetails[7]}`);
  console.log(`Token Amount: ${projectDetails[8]}`);
  
  console.log("Deployment and setup completed successfully!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 