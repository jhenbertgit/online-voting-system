"use client";
import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  ReactNode,
  JSX,
} from "react";
import { useConfig, useAccount, useAccountEffect } from "wagmi";
import { getEthersSigner } from "@/lib/web3-utils";
import { VotingGuardianABI } from "@/abis";
import { ethers } from "ethers";

/**
 * ContractContextType defines the context shape for Ethereum contract access.
 */
export interface ContractContextType {
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
  isReady: boolean;
}

const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

/**
 * ContractProvider supplies contract and signer to descendants.
 * @param props - Children React nodes.
 * @returns {JSX.Element}
 */
function ContractProvider({ children }: { children: ReactNode }): JSX.Element {
  const config = useConfig();
  const { address, isConnected } = useAccount();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  /**
   * Sets up signer and contract when wallet connects.
   */
  const setup = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      setSigner(null);
      setContract(null);
      return;
    }
    const _signer = await getEthersSigner(config);
    setSigner(_signer);
    if (_signer) {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        setContract(null);
        return;
      }
      const _contract = new ethers.Contract(
        contractAddress,
        VotingGuardianABI,
        _signer
      );
      setContract(_contract);
    } else {
      setContract(null);
    }
  }, [config, isConnected]);

  useEffect(() => {
    setup();
  }, [setup, address]);

  useAccountEffect({
    onConnect() {
      setup();
    },
    onDisconnect() {
      setSigner(null);
      setContract(null);
    },
  });

  const value = useMemo<ContractContextType>(
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

/**
 * useContract provides access to the ContractContext.
 * @returns {ContractContextType}
 * @throws Error if used outside ContractProvider.
 */
function useContract(): ContractContextType {
  const ctx = useContext(ContractContext);
  if (!ctx)
    throw new Error("useContract must be used within a ContractProvider");
  return ctx;
}

export { ContractProvider, useContract };
