"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useConfig, useAccount, useAccountEffect } from "wagmi";
import { getEthersSigner } from "@/lib/web3-utils";
import { VotingGuardianABI } from "@/abis";
import { ethers } from "ethers";

interface ContractContextType {
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
  isReady: boolean;
}

const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const config = useConfig();
  const { address, isConnected } = useAccount();

  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);

  // Setup signer and contract when wallet connects
  const setup = useCallback(async () => {
    if (!isConnected) {
      setSigner(null);
      setContract(null);
      return;
    }
    const _signer = await getEthersSigner(config);
    setSigner(_signer);
    if (_signer) {
      const _contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        VotingGuardianABI,
        _signer
      );
      setContract(_contract);
    } else {
      setContract(null);
    }
  }, [config, isConnected]);

  React.useEffect(() => {
    setup();
    // Only rerun if config, address, or isConnected changes
  }, [setup, address]);

  useAccountEffect({
    onConnect() {
      setup(); // Refresh signer/contract when wallet connects
    },
    onDisconnect() {
      setSigner(null);
      setContract(null);
    },
  });

  const value = useMemo(
    () => ({
      contract,
      signer,
      isReady: !!contract && !!signer && !!address,
    }),
    [contract, signer, address]
  );

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const ctx = useContext(ContractContext);
  if (!ctx)
    throw new Error("useContract must be used within a ContractProvider");
  return ctx;
}
