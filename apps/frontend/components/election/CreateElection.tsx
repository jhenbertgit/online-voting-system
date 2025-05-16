import { useState, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { postApiResource } from "@/lib/api-client";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { useAuth } from "@clerk/nextjs";
import { useElections } from "@/contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VotingGuardianABI } from "@/abis";
import { isAddress, ethers } from "ethers";
import { config as wagmiConfig } from "@/lib/wagmi/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ElectionFormType,
  PositionFormType,
  CandidateFormType,
  electionSchema,
  positionSchema,
  candidateSchema,
} from "./schema";
import { ElectionStep } from "./ElectionStep";
import { PositionStep } from "./PositionStep";
import { CandidateStep } from "./CandidateStep";
import { UserPlus2Icon, CheckCircle2Icon } from "lucide-react";

/**
 * CreateElection orchestrates the full multi-step election creation process, including blockchain and API logic, tab navigation, and form state management.
 *
 * This is the main orchestrator for the modular, maintainable election creation flow. All business logic and UI are preserved from the original implementation.
 *
 * @remarks
 * Intended to be used inside a Dialog or as a standalone page section. All steps (Election, Position, Candidate) are handled through modular components.
 *
 * @returns {React.JSX.Element} The complete election creation workflow UI.
 */
interface CreateElectionProps {
  onCancel: () => void;
}

export function CreateElection({
  onCancel,
}: CreateElectionProps): React.JSX.Element {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"election" | "position" | "candidate">(
    "election"
  );
  const { getToken } = useAuth();
  const { elections, loading: electionsLoading, refresh } = useElections();
  const queryClient = useQueryClient();

  // --- React Hook Form ---
  const electionForm = useForm<ElectionFormType>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      name: "",
      description: "",
      dateRange: { from: undefined, to: undefined },
    },
  });
  const dateRange = useWatch({
    control: electionForm.control,
    name: "dateRange",
  });
  useEffect(() => {
    console.log("[DEBUG] Current dateRange:", dateRange);
  }, [dateRange]);

  const positionForm = useForm<PositionFormType>({
    resolver: zodResolver(positionSchema),
    defaultValues: { name: "", description: "", electionId: "" },
  });
  const candidateForm = useForm<CandidateFormType>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      bio: "",
      party: "",
      image: "",
      positionId: "",
      electionId: "",
    },
  });

  const contractAddress = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  if (!contractAddress || !isAddress(contractAddress)) {
    throw new Error(
      "Invalid or missing contract address in environment variables"
    );
  }

  // --- TanStack Query Mutations ---
  const createElectionMutation = useMutation({
    mutationFn: async (data: ElectionFormType) => {
      let txHash: `0x${string}`;
      if (!isConnected)
        throw new Error(
          "Please connect your wallet before creating an election."
        );
      const token = await getToken();
      if (!token)
        throw new Error("Missing authentication token for election creation.");
      if (!data.dateRange.from || !data.dateRange.to)
        throw new Error("Both start and end dates must be selected.");
      const startTime = Math.floor(data.dateRange.from.getTime() / 1000);
      const endTime = Math.floor(data.dateRange.to.getTime() / 1000);
      try {
        const { writeContract, waitForTransactionReceipt } = await import(
          "@wagmi/core"
        );
        txHash = await writeContract(wagmiConfig, {
          abi: VotingGuardianABI,
          address: contractAddress,
          functionName: "createElection",
          args: [
            ethers.id(data.name),
            data.name.toLowerCase(),
            startTime,
            endTime,
            ethers.ZeroHash, // TODO: Add merkle root (voter IDs)
          ],
          account: address as `0x${string}`,
        });
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
          confirmations: 1,
        });
      } catch (err) {
        throw new Error(
          (err instanceof Error && err.message) ||
            "Transaction confirmation failed."
        );
      }
      // Add election to database (off-chain)
      const startDate =
        data.dateRange.from instanceof Date
          ? data.dateRange.from.toISOString()
          : undefined;
      const endDate =
        data.dateRange.to instanceof Date
          ? data.dateRange.to.toISOString()
          : undefined;
      if (!startDate || !endDate)
        throw new Error("Invalid date range provided.");
      if (!contractAddress)
        throw new Error("Missing contract address for election creation.");
      if (!address)
        throw new Error("Missing admin address for election creation.");
      await postApiResource(
        "/api/elections",
        {
          name: data.name.toLowerCase(),
          description: data.description,
          startDate,
          endDate,
          merkleRoot: ethers.ZeroHash, // TODO: Add merkle root (valid voter IDs)
          contractAddress: contractAddress,
          adminAddress: address,
          onChainElectionId: ethers.id(data.name),
        },
        token,
        "Backend submission failed"
      );
      return { txHash };
    },
    onSuccess: (data) => {
      const { txHash } = data || {};
      toast.success("Election created successfully!", {
        description: txHash
          ? `Transaction: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`
          : undefined,
        action: txHash
          ? {
              label: "View",
              onClick: () =>
                window.open(
                  `${process.env.NEXT_PUBLIC_POLYGONSCAN_URL}/tx/${txHash}`,
                  "_blank"
                ),
            }
          : undefined,
      });
      setTab("position");
      queryClient.invalidateQueries({ queryKey: ["elections"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create election");
    },
  });

  const createPositionMutation = useMutation({
    mutationFn: async (data: PositionFormType) => {
      if (!isConnected)
        throw new Error(
          "Please connect your wallet before creating a position."
        );
      const token = await getToken();
      if (!token)
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      const onChainPositionId = ethers.id(data.name);
      //TODO: Add position to blockchain
      await postApiResource(
        "/api/positions",
        { ...data, onChainPositionId },
        token,
        "Failed to create position"
      );
      return true;
    },
    onSuccess: () => {
      toast.success("Position created!");
      positionForm.reset();
      refresh();
      setTab("candidate");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create position");
    },
  });

  const { reset: resetAddCandidate } = useWriteContract();

  type CreateCandidateMutationReturn = {
    payload: CandidateFormType & { onChainCandidateId: string };
    toastId: string | number;
    txHash: `0x${string}`;
  };

  const createCandidateMutation = useMutation<
    CreateCandidateMutationReturn,
    Error,
    CandidateFormType
  >({
    mutationFn: async (
      data: CandidateFormType
    ): Promise<CreateCandidateMutationReturn> => {
      let txHash: `0x${string}`;
      let toastId: string | number = toast.loading("Registering candidate...");
      if (!isConnected) {
        toast.dismiss(toastId);
        throw new Error(
          "Please connect your wallet before registering a candidate."
        );
      }
      const token = await getToken();
      if (!token)
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      const idHash = ethers.id(data.name);
      // Pre-check for existing candidate in the same election (by onChainCandidateId)
      const election = elections.find((e) => e.id === data.electionId);
      if (
        election?.candidates.some(
          (candidate) => candidate.onChainCandidateId === idHash
        )
      ) {
        toast.dismiss(toastId);
        throw new Error(
          "A candidate with this name already exists in this election."
        );
      }
      // Convert positionId to a number for contract call (uint256 expected)
      const positionId = BigInt(ethers.id(data.positionId));
      try {
        const { simulateContract } = await import("@wagmi/core");
        await simulateContract(wagmiConfig, {
          abi: VotingGuardianABI,
          address: contractAddress,
          functionName: "addCandidate",
          args: [idHash, positionId],
          account: address as `0x${string}`,
        });
      } catch (simError) {
        toast.dismiss(toastId);
        throw new Error(`Simulation failed: ${(simError as Error).message}`);
      }
      try {
        const { writeContract, waitForTransactionReceipt } = await import(
          "@wagmi/core"
        );
        txHash = await writeContract(wagmiConfig, {
          abi: VotingGuardianABI,
          address: contractAddress,
          functionName: "addCandidate",
          args: [idHash, positionId],
          account: address as `0x${string}`,
        });
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
          confirmations: 1,
        });
      } catch (err) {
        toast.dismiss(toastId);
        throw new Error(
          (err instanceof Error && err.message) ||
            "Transaction confirmation failed."
        );
      }
      // Add candidate to database
      const payload = {
        name: data.name,
        bio: data.bio,
        party: data.party,
        avatar: data.image,
        onChainCandidateId: idHash,
        positionId: data.positionId,
        electionId: data.electionId,
      };
      await postApiResource(
        "/api/candidates",
        payload,
        token,
        "Candidate registration failed",
        toastId
      );
      return { payload, toastId, txHash };
    },
    onSuccess: (data) => {
      const { toastId, txHash } = data || {};
      if (toastId) {
        toast.success("Candidate registered!", {
          id: toastId,
          description: `Transaction: ${txHash?.slice(0, 6)}...${txHash?.slice(-4)}`,
          action: txHash
            ? {
                label: "View",
                onClick: () =>
                  window.open(
                    `${process.env.NEXT_PUBLIC_POLYGONSCAN_URL}/tx/${txHash}`,
                    "_blank"
                  ),
              }
            : undefined,
        });
      }
      candidateForm.reset();
      resetAddCandidate();
    },
    onError: (err, _variables) => {
      toast.error(err.message || "Failed to register candidate");
      resetAddCandidate();
    },
  });

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (
          value === "election" ||
          value === "position" ||
          value === "candidate"
        )
          setTab(value);
      }}
      className="w-full max-w-2xl mx-auto"
    >
      <TabsList className="mb-6 flex w-full justify-center gap-2 bg-muted rounded-lg p-1">
        <TabsTrigger
          value="election"
          className="flex-1 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2Icon className="w-5 h-5" />
            Election Details
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="position"
          className="flex-1 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition"
        >
          <span className="flex items-center gap-2">
            <UserPlus2Icon className="w-5 h-5" />
            Positions
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="candidate"
          className="flex-1 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition"
        >
          <span className="flex items-center gap-2">
            <UserPlus2Icon className="w-5 h-5" />
            Candidates
          </span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="election">
        <FormProvider {...electionForm}>
          <ElectionStep
            form={electionForm}
            onSubmit={(data) => createElectionMutation.mutate(data)}
            isPending={createElectionMutation.isPending}
            onCancel={onCancel}
          />
        </FormProvider>
      </TabsContent>
      <TabsContent value="position">
        <FormProvider {...positionForm}>
          <PositionStep
            form={positionForm}
            elections={elections}
            electionsLoading={electionsLoading}
            onSubmit={(data) =>
              createPositionMutation.mutate({
                ...data,
                name: data.name.toLowerCase(),
              })
            }
            isPending={createPositionMutation.isPending}
            onBack={() => setTab("election")}
          />
        </FormProvider>
      </TabsContent>
      <TabsContent value="candidate">
        <FormProvider {...candidateForm}>
          <CandidateStep
            form={candidateForm}
            elections={elections}
            onSubmit={(data) => createCandidateMutation.mutate(data)}
            isPending={createCandidateMutation.isPending}
            onBack={() => setTab("position")}
          />
        </FormProvider>
      </TabsContent>
    </Tabs>
  );
}
