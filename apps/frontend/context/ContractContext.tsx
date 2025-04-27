"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useConfig, useAccount } from "wagmi";
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

  React.useEffect(() => {
    async function setup() {
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
    }
    setup();
    // Only rerun if config, address, or isConnected changes
  }, [config, address, isConnected]);

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
