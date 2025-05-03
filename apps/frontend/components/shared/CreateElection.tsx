"use client";

import { useState } from "react";
import type { JSX } from "react"; // Explicitly import JSX type
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { UserPlus2Icon, CheckCircle2Icon } from "lucide-react";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { ethers } from "ethers";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WalletConnectCard } from "./WalletConnectCard";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useElections, useContract } from "@/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, FormProvider, useWatch, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

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

export function CreateElection(): JSX.Element {
  // Explicitly define return type
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"election" | "position" | "candidate">(
    "election"
  );
  const { getToken } = useAuth();
  const { elections, loading: electionsLoading, refresh } = useElections();
  const { contract, signer } = useContract();
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

  // --- TanStack Query Mutations ---
  const createElectionMutation = useMutation({
    mutationFn: async (data: ElectionFormType) => {
      if (!signer || !contract)
        throw new Error("No signer or contract available");
      const token = await getToken();
      if (!data.dateRange.from || !data.dateRange.to) {
        throw new Error("Both start and end dates must be selected.");
      }
      const startTime = Math.floor(data.dateRange.from.getTime() / 1000);
      const endTime = Math.floor(data.dateRange.to.getTime() / 1000);

      // Create election on blockchain
      const tx = await contract.createElection(
        ethers.id(data.name),
        data.name,
        startTime,
        endTime,
        ethers.ZeroHash // TODO: Add merkle root (voter IDs)
      );
      await tx.wait();

      // Create election to database
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

      const response = await fetch("/api/elections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          startDate,
          endDate,
          merkleRoot: ethers.ZeroHash,
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          adminAddress: address,
          onChainElectionId: ethers.id(data.name),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Backend submission failed");
      }
      return true;
    },
    onSuccess: () => {
      toast.success("Election created successfully!");
      setTab("position");
      queryClient.invalidateQueries({ queryKey: ["elections"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create election");
    },
  });

  const createPositionMutation = useMutation({
    mutationFn: async (data: PositionFormType) => {
      if (!signer || !contract)
        throw new Error("No signer or contract available");
      const token = await getToken();
      const onChainPositionId = ethers.id(data.name);
      //TODO: Add position to blockchain

      // Add position to database
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          onChainPositionId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create position");
      }
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

  let toastId: string | number;
  let tx: any;
  const createCandidateMutation = useMutation({
    mutationFn: async (data: CandidateFormType) => {
      toastId = toast.loading("Registering candidate...");

      if (!signer || !contract)
        throw new Error("No signer or contract available");
      const token = await getToken();
      const idHash = ethers.id(data.name);
      const positionId = ethers.id(data.positionId);

      // Add candidate on blockchain
      tx = await contract.addCandidate(idHash, positionId);

      toast.loading(`Transaction submitted: ${tx.hash.slice(0, 10)}...`, {
        id: toastId,
      });
      await tx.wait();

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
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Candidate registration failed");
      }
      return payload;
    },
    onSuccess: (payload) => {
      if (toastId) {
        toast.success("Candidate registered!", {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
          action: {
            label: "View",
            onClick: () =>
              window.open(
                `${process.env.NEXT_PUBLIC_POLYGONSCAN_URL}/tx/${tx.hash}`,
                "_blank"
              ),
          },
        });
      }
      candidateForm.reset();
    },
    onError: (err: Error) => {
      if (toastId) {
        toast.error(err.message || "Failed to register candidate", {
          id: toastId,
        });
      } else {
        toast.error(err.message || "Failed to register candidate");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setTab("election")}>Create Election</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Election</DialogTitle>
        </DialogHeader>
        {/* Wallet details of Admin */}
        <WalletConnectCard />
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
          className="w-full"
        >
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="election" className="flex-1">
              Create Election
            </TabsTrigger>
            <TabsTrigger value="position" className="flex-1">
              Create Position
            </TabsTrigger>
            <TabsTrigger value="candidate" className="flex-1">
              Add Candidates
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
                  createPositionMutation.mutate(data)
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
                    <Label
                      htmlFor="position-description"
                      className="col-span-1"
                    >
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
                              (el) =>
                                el.id === candidateForm.watch("electionId")
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
      </DialogContent>
    </Dialog>
  );
}
