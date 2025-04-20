import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { expect } from "chai";

describe("VotingGuardian", () => {
  it("Should deploy with admin role", async () => {
    const [owner] = await ethers.getSigners();

    // Correct balance check
    const balance = await ethers.provider.getBalance(owner.address);
    console.log("Deployer balance:", ethers.formatEther(balance));

    const Voting = await ethers.getContractFactory("VotingGuardian");
    const voting = await Voting.deploy();

    // Verify admin role
    const ADMIN_ROLE = await voting.ADMIN_ROLE();
    expect(await voting.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
  });
});

async function test() {
  const voting = await ethers.getContractAt(
    "VotingGuardian",
    "0x4473Fae1Bd167677D379FB02752a3D412d9713e7"
  );

  // 1. Generate valid merkleRoot
  const voters = ["test_voter_1", "test_voter_2"];

  const leaves = voters.map((v) =>
    keccak256(
      ethers.solidityPacked(["string", "bytes32"], [v, ethers.randomBytes(32)])
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const merkleRoot = tree.getHexRoot();

  // 2. Create election with valid times
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + 86400; // 24 hours later

  await voting.createElection(
    1,
    "Mock Election - Testing of contract functions",
    startTime,
    endTime,
    merkleRoot
  );

  // 3. Add candidates with proper hashes
  const candidate1Hash = ethers.keccak256(ethers.toUtf8Bytes("Inday Sara"));
  const candidate2Hash = ethers.keccak256(ethers.toUtf8Bytes("Romualdez"));

  await voting.addCandidate(candidate1Hash, 1);
  await voting.addCandidate(candidate2Hash, 1);

  // Verification
  console.log("Election created:", await voting.elections(1));
  console.log("Candidate 1:", await voting.candidates(candidate1Hash));
  console.log("Candidate 2:", await voting.candidates(candidate2Hash));
}

test()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
