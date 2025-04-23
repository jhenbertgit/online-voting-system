import React from "react";
import { useAccount } from "wagmi";
import { Account } from "./Account";
import { WalletOptions } from "./WalletOption";

export function WalletConnectButton() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;

  return <WalletOptions />;
}
