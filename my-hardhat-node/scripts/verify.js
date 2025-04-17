const hre = require("hardhat");

async function main() {
  const contractAddress = "0x1d0d7460f1a0d8b0a401c7fe6f5a61e7be46eaa9"; // Replace if redeployed
  const constructorArgs = []; // Add any constructor args if needed

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArgs
  });

  console.log("Verification complete ✅");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


