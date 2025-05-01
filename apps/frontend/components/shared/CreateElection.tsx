"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { format } from "date-fns";
import { CalendarIcon, UserPlus2Icon, CheckCircle2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ethers } from "ethers";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

// --- Zod Schemas ---
const electionSchema = z.object({
  name: z.string().min(1, "Election name required"),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
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

export function CreateElection() {
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
      startDate: undefined,
      endDate: undefined,
    },
  });

  const startDate = useWatch({
    control: electionForm.control,
    name: "startDate",
  });

  const endDate = useWatch({
    control: electionForm.control,
    name: "endDate",
  });

  useEffect(() => {
    console.log("[DEBUG] Current startDate:", startDate);
    console.log("[DEBUG] Current endDate:", endDate);
  }, [startDate, endDate]);

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
      if (!data.startDate || !data.endDate) {
        throw new Error("Both start and end dates must be selected.");
      }
      const startDate =
        data.startDate instanceof Date
          ? data.startDate.toISOString()
          : undefined;
      const endDate =
        data.endDate instanceof Date ? data.endDate.toISOString() : undefined;
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

  const createCandidateMutation = useMutation({
    mutationFn: async (data: CandidateFormType) => {
      if (!signer || !contract)
        throw new Error("No signer or contract available");
      const token = await getToken();
      const idHash = ethers.id(data.name);
      const positionId = ethers.id(data.positionId);
      const tx = await contract.addCandidate(idHash, positionId);
      await tx.wait();
      const payload = {
        name: data.name,
        bio: data.bio,
        party: data.party,
        avatar: data.image,
        idHash: idHash,
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
      toast.success("Candidate registered!");
      candidateForm.reset();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to register candidate");
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
                    <Label className="col-span-1">Election Dates</Label>
                    <div className="flex gap-4 col-span-3">
                      {/* Start Date Picker */}
                      <div className="flex-1">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !electionForm.watch("startDate") &&
                                  "text-muted-foreground"
                              )}
                              type="button"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {electionForm.watch("startDate") ? (
                                format(electionForm.watch("startDate"), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={electionForm.watch("startDate")}
                              onSelect={(date) => {
                                if (date)
                                  electionForm.setValue("startDate", date);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* End Date Picker */}
                      <div className="flex-1">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !electionForm.watch("endDate") &&
                                  "text-muted-foreground"
                              )}
                              type="button"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {electionForm.watch("endDate") ? (
                                format(electionForm.watch("endDate"), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={electionForm.watch("endDate")}
                              onSelect={(date) => {
                                if (date)
                                  electionForm.setValue("endDate", date);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
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
                        {elections.map((el) => (
                          <SelectItem key={el.id} value={el.id}>
                            {el.name}
                          </SelectItem>
                        ))}
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
                        {elections
                          .find(
                            (el: any) =>
                              el.id === candidateForm.watch("electionId")
                          )
                          ?.positions.map((pos: any) => (
                            <SelectItem key={pos.id} value={pos.id}>
                              {pos.name}
                            </SelectItem>
                          ))}
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
