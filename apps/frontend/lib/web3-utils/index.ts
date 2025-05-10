import type { Account, Chain, Client, Transport } from "viem";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { Config, getConnectorClient } from "@wagmi/core";

/**
 * Converts a viem Client with Account to an ethers.js v6 Signer.
 */
function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/**
 * Action to convert a viem Wallet Client to an ethers.js Signer.
 * @see https://wagmi.sh/core/guides/ethers
 */
async function getEthersSigner(
  config: Config,
  { chainId }: { chainId?: number } = {}
) {
  const client = await getConnectorClient(config, { chainId });
  return clientToSigner(client);
}

export { getEthersSigner };
