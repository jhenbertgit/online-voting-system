import hre from "hardhat";

async function main() {
  const VotingGuardian = await hre.ethers.getContractFactory("VotingGuardian");
  const contract = await VotingGuardian.deploy();
  await contract.waitForDeployment();
  console.log(`Contract deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
