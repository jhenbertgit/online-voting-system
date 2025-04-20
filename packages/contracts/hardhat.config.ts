import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "dotenv/config";

const { POLYGON_AMOY_RPC_URL, PRIVATE_KEY, POLYGONSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: POLYGON_AMOY_RPC_URL, // Correct RPC endpoint
      accounts: [PRIVATE_KEY!], // Secure key handling
      gasPrice: 30_000_000_000, // Reasonable for testnet
      gas: "auto",
      gasMultiplier: 1.2,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: POLYGONSCAN_API_KEY!,
    },
  },
  paths: {
    artifacts: "./artifacts/contract-artifacts",
  },
  contractSizer: {
    runOnCompile: true,
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
