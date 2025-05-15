"use client";

import { useState, useEffect } from "react";
import { postApiResource } from "./api-client";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { UserPlus2Icon, CheckCircle2Icon } from "lucide-react";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { ethers } from "ethers";
import { useAuth } from "@clerk/nextjs";
import { useElections } from "@/contexts";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import { VotingGuardianABI } from "@/abis";
import { isAddress } from "ethers";
import { config as wagmiConfig } from "@/lib/wagmi/config";
import { useForm, FormProvider, useWatch, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Zod Schemas ---
const electionSchema = z.object({
  name: z.string().min(1, "Election name required"),
  description: z.string().optional(),
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required" }),
    to: z.date({ required_error: "End date is required" }),
  }),
});

const positionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  description: z.string().optional(),
  electionId: z.string().min(1, "Election ID required"),
});

const candidateSchema = z.object({
  name: z.string().min(1, "Candidate name required"),
  bio: z.string().optional(),
  party: z.string().optional(),
  image: z.string().optional(),
  positionId: z.string().min(1, "Position is required"),
  electionId: z.string().min(1, "Election is required"),
});

// --- Types ---
type ElectionFormType = z.infer<typeof electionSchema>;
type PositionFormType = z.infer<typeof positionSchema>;
type CandidateFormType = z.infer<typeof candidateSchema>;

// --- UI Stepper ---
const steps = [
  { label: "Election Details", icon: <CheckCircle2Icon className="w-5 h-5" /> },
  { label: "Candidates", icon: <UserPlus2Icon className="w-5 h-5" /> },
];

/**
 * CreateElection renders the content for creating an election, intended to be used inside a Dialog.
 * @returns {React.JSX.Element} The dialog content for election creation.
 */
export function CreateElection(): React.JSX.Element {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
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
      dateRange: {
        from: undefined,
        to: undefined,
      },
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
    defaultValues: {
      name: "",
      description: "",
      electionId: "",
    },
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
      if (!isConnected) {
        throw new Error(
          "Please connect your wallet before creating an election."
        );
      }
      const token = await getToken();
      if (!token) {
        throw new Error("Missing authentication token for election creation.");
      }
      if (!data.dateRange.from || !data.dateRange.to) {
        throw new Error("Both start and end dates must be selected.");
      }
      // Write to blockchain using wagmi writeContract
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
      if (!startDate || !endDate) {
        throw new Error("Invalid date range provided.");
      }
      if (!contractAddress) {
        throw new Error("Missing contract address for election creation.");
      }
      if (!address) {
        throw new Error("Missing admin address for election creation.");
      }
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
      if (!isConnected) {
        throw new Error(
          "Please connect your wallet before creating a position."
        );
      }
      const token = await getToken();
      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }
      const onChainPositionId = ethers.id(data.name);
      //TODO: Add position to blockchain

      // Add position to database
      await postApiResource(
        "/api/positions",
        {
          ...data,
          onChainPositionId,
        },
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
    payload: CandidateFormType & {
      onChainCandidateId: string;
    };
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
      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }
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
      // Write to blockchain using wagmi hook
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
      // context is undefined by default unless set via mutation options; so fallback to showing generic error
      toast.error(err.message || "Failed to register candidate");
      resetAddCandidate();
    },
  });

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (
            value === "election" ||
            value === "position" ||
            value === "candidate"
          ) {
            setTab(value);
          }
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
        {/* Election Tab */}
        <TabsContent value="election">
          <FormProvider {...electionForm}>
            <form
              onSubmit={electionForm.handleSubmit((data) =>
                createElectionMutation.mutate(data)
              )}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    {...electionForm.register("name")}
                    className="col-span-3"
                    placeholder="Election name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    {...electionForm.register("description")}
                    className="col-span-3"
                    placeholder="Election description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="col-span-1">Election Period</Label>
                  <div className="flex gap-4 col-span-3">
                    <Controller
                      control={electionForm.control}
                      name="dateRange"
                      render={({ field }) => (
                        <DatePickerWithRange
                          className="w-full"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                    disabled={createElectionMutation.isPending}
                  >
                    {createElectionMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2 text-white" />
                        Creating...
                      </>
                    ) : (
                      "Create Election"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </TabsContent>
        {/* Position Tab */}
        <TabsContent value="position">
          <FormProvider {...positionForm}>
            <form
              onSubmit={positionForm.handleSubmit((data) =>
                createPositionMutation.mutate({
                  ...data,
                  name: data.name.toLowerCase(),
                })
              )}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position-name" className="col-span-1">
                    Position Name
                  </Label>
                  <Input
                    id="position-name"
                    {...positionForm.register("name")}
                    className="col-span-3"
                    placeholder="e.g. President"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position-description" className="col-span-1">
                    Description
                  </Label>
                  <Input
                    id="position-description"
                    {...positionForm.register("description")}
                    className="col-span-3"
                    placeholder="e.g. The highest office in the election."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position-election" className="col-span-1">
                    Election
                  </Label>
                  <Select
                    value={positionForm.watch("electionId")}
                    onValueChange={(value: any) =>
                      positionForm.setValue("electionId", value)
                    }
                    disabled={electionsLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select election" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Election</SelectLabel>
                        {elections.map((e: any) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setTab("election")}
                  >
                    Back
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                    disabled={createPositionMutation.isPending}
                  >
                    {createPositionMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2 text-white" />
                        Adding...
                      </>
                    ) : (
                      "Add Position"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </TabsContent>
        {/* Candidate Tab */}
        <TabsContent value="candidate">
          <FormProvider {...candidateForm}>
            <form
              onSubmit={candidateForm.handleSubmit((data) =>
                createCandidateMutation.mutate(data)
              )}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="candidate-name" className="col-span-1">
                    Name
                  </Label>
                  <Input
                    id="candidate-name"
                    {...candidateForm.register("name")}
                    className="col-span-3"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="candidate-bio" className="col-span-1">
                    Bio
                  </Label>
                  <Input
                    id="candidate-bio"
                    {...candidateForm.register("bio")}
                    className="col-span-3"
                    placeholder="Short bio"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="candidate-party" className="col-span-1">
                    Party
                  </Label>
                  <Input
                    id="candidate-party"
                    {...candidateForm.register("party")}
                    className="col-span-3"
                    placeholder="e.g. Independent"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="candidate-image" className="col-span-1">
                    Avatar URL
                  </Label>
                  <Input
                    id="candidate-image"
                    {...candidateForm.register("image")}
                    className="col-span-3"
                    placeholder="Avatar URL"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="col-span-1">Election</Label>
                  <Select
                    value={candidateForm.watch("electionId")}
                    onValueChange={(value: any) =>
                      candidateForm.setValue("electionId", value)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select Election" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Election</SelectLabel>
                        {elections.map((el) => (
                          <SelectItem key={el.id} value={el.id}>
                            {el.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="col-span-1">Position</Label>
                  <Select
                    value={candidateForm.watch("positionId")}
                    onValueChange={(value: any) =>
                      candidateForm.setValue("positionId", value)
                    }
                    disabled={!candidateForm.watch("electionId")}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Position</SelectLabel>
                        {elections
                          .find(
                            (el) => el.id === candidateForm.watch("electionId")
                          )
                          ?.positions.map((pos) => (
                            <SelectItem key={pos.id} value={pos.id}>
                              {pos.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setTab("position")}
                  >
                    Back
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                    disabled={createCandidateMutation.isPending}
                  >
                    {createCandidateMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2 text-white" />
                        Adding...
                      </>
                    ) : (
                      "Add Candidate"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </TabsContent>
      </Tabs>
    </>
  );
}
