import { ethers } from "hardhat";

// Example deployment script
async function main() {
  // Replace 'Voting' with your contract name
  const AnonymousVoting = await ethers.getContractFactory("AnonymousVoting");
  const contract = await AnonymousVoting.deploy();

  await contract.deployed();
  console.log(`Contract deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
