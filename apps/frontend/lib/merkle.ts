import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers";

export function generateMerkleTree(addresses: string[]) {
  const leaves = addresses.map((addr) => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  return {
    merkleRoot: tree.getHexRoot(),
    merkleTree: tree,
  };
}
