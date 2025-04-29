"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { addDays, format } from "date-fns";
import { CalendarIcon, UserPlus2Icon, CheckCircle2Icon } from "lucide-react";
import { DateRange } from "react-day-picker";
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
import { useElections } from "@/context/ElectionsContext";
import { useContract } from "@/context/ContractContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- UI Stepper ---
const steps = [
  { label: "Election Details", icon: <CheckCircle2Icon className="w-5 h-5" /> },
  { label: "Candidates", icon: <UserPlus2Icon className="w-5 h-5" /> },
];

export function CreateElection() {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"election" | "position" | "candidate">(
    "election"
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  // Candidates state
  const [candidates, setCandidates] = useState<
    {
      name: string;
      bio: string;
      party: string;
      image?: string;
      positionId: string;
      electionId: string;
    }[]
  >([]);
  const [candidateInput, setCandidateInput] = useState({
    name: "",
    bio: "",
    party: "",
    image: "",
    positionId: "",
    electionId: "",
  });

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const { getToken } = useAuth();

  // --- Position Creation State ---
  const [positionForm, setPositionForm] = useState({
    name: "",
    description: "",
    electionId: "",
  });
  const [positionLoading, setPositionLoading] = useState(false);

  // Elections context for dropdown
  const { elections, loading: electionsLoading, refresh } = useElections();

  // Helper to get positions for selected election
  const selectedElection = elections.find(
    (el: any) => el.id === candidateInput.electionId
  );
  const availablePositions = selectedElection?.positions || [];

  // --- Candidate Handlers ---
  const addCandidate = () => {
    if (!candidateInput.name.trim()) {
      toast.error("Candidate name required");
      return;
    }
    if (!candidateInput.positionId) {
      toast.error("Position is required");
      return;
    }
    if (!candidateInput.electionId) {
      toast.error("Election is required");
      return;
    }
    setCandidates([...candidates, candidateInput]);
    setCandidateInput({
      name: "",
      bio: "",
      party: "",
      image: "",
      positionId: "",
      electionId: "",
    });
    toast.success("Candidate added");
  };

  // --- Election Submission ---
  const { contract, signer } = useContract();
  const handleSubmit = async () => {
    try {
      if (!dateRange?.from || !dateRange.to) {
        throw new Error("Please select a valid date range");
      }
      if (!formData.name.trim()) {
        throw new Error("Election name required");
      }
      const clerkToken = await getToken();
      setLoading(true);
      const toastId = toast.loading("Creating election...");
      // 1. Use contract and signer from context
      if (!signer || !contract) {
        toast.error("No signer or contract available");
        return;
      }
      // 2. Convert dates to UNIX timestamps
      const startTime = Math.floor(dateRange.from.getTime() / 1000);
      const endTime = Math.floor(dateRange.to.getTime() / 1000);
      // 3. Create election on-chain
      const tx = await contract.createElection(
        ethers.id(formData.name),
        formData.name,
        startTime,
        endTime,
        // Pass a dummy merkleRoot (since voters are not needed now)
        ethers.ZeroHash
      );
      toast.loading(`Transaction submitted: ${tx.hash.slice(0, 10)}...`, {
        id: toastId,
      });
      await tx.wait();
      // 4. Store in backend (via Next.js proxy)
      const response = await fetch("/api/elections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startTime,
          endTime,
          merkleRoot: ethers.ZeroHash,
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          adminAddress: address,
          onChainElectionId: ethers.id(formData.name),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Backend submission failed");
      }
      toast.success(`Election created successfully!`, { id: toastId });
      setTab("position"); // Move to position creation tab
    } catch (err: any) {
      toast.error(err.message || "Failed to create election");
    } finally {
      setLoading(false);
    }
  };

  // --- Candidate Submission ---
  const handleCandidateSubmit = async () => {
    try {
      // Validate single candidate input
      if (
        !candidateInput.name.trim() ||
        !candidateInput.positionId ||
        !candidateInput.electionId
      ) {
        toast.error("Candidate name, position, and election are required");
        return;
      }
      const clerkToken = await getToken();
      setLoading(true);
      const toastId = toast.loading("Registering candidate...");
      if (!signer || !contract) {
        toast.error("No signer or contract available");
        return;
      }
      // Send candidate to blockchain
      const idHash = ethers.id(candidateInput.name);
      // Use the onChainPositionId from the selected position (should be stored in candidateInput.positionId)
      const positionId = ethers.id(candidateInput.positionId); // converted positionId to be store in blockchain
      const tx = await contract.addCandidate(idHash, positionId);

      toast.loading(`Transaction submitted: ${tx.hash.slice(0, 10)}...`, {
        id: toastId,
      });
      await tx.wait();

      // Build payload for backend
      const payload = {
        name: candidateInput.name,
        bio: candidateInput.bio,
        party: candidateInput.party,
        avatar: candidateInput.image, // align with backend DTO
        idHash: idHash,
        positionId: candidateInput.positionId, // UUID from DB
        electionId: candidateInput.electionId, // UUID from DB
      };
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Candidate registration failed");
      }
      toast.success("Candidate registered!", { id: toastId });
      // Add to local list for display only (optional)
      setCandidates((prev) => [...prev, payload]);
      // Reset candidate form
      setCandidateInput({
        name: "",
        bio: "",
        party: "",
        image: "",
        positionId: "",
        electionId: "",
      });
    } catch (err) {
      toast.error((err as Error).message || "Failed to register candidate");
      console.log("Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // --- Position Creation Handler ---
  const handleCreatePosition = async () => {
    if (!positionForm.name.trim()) {
      toast.error("Position name is required");
      return;
    }
    setPositionLoading(true);
    try {
      const token = await getToken?.();
      // 1. Use contract and signer from context
      if (!signer || !contract) {
        toast.error("No signer or contract available");
        return;
      }
      // 2. Create position on-chain
      // Use ethers.id(positionForm.name) as deterministic on-chain position ID
      const onChainPositionId = ethers.id(positionForm.name);
      //TODO: Update the VotingGuardian contract
      // const tx = await contract.createPosition(
      //   onChainPositionId,
      //   positionForm.name,
      //   positionForm.description || ""
      // );
      // toast.loading(`Transaction submitted: ${tx.hash.slice(0, 10)}...`);
      // await tx.wait();
      // 3. Store in backend (via Next.js proxy)
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...positionForm,
          onChainPositionId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create position");
      }
      toast.success("Position created!");
      setPositionForm({ name: "", description: "", electionId: "" });
      refresh();
      setTab("candidate");
    } catch (err: any) {
      toast.error(err.message || "Failed to create position");
    } finally {
      setPositionLoading(false);
    }
  };

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
            <div className="space-y-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Election description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Election Period</Label>
                <div className={cn("grid gap-2")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from || new Date()}
                        selected={dateRange}
                        onSelect={(range) =>
                          setDateRange(
                            range || {
                              from: new Date(),
                              to: addDays(new Date(), 7),
                            }
                          )
                        }
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={!formData.name.trim()}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
          {/* Position Tab */}
          <TabsContent value="position">
            <div className="space-y-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position-name" className="col-span-1">
                  Position Name
                </Label>
                <Input
                  id="position-name"
                  className="col-span-3"
                  placeholder="e.g. President"
                  value={positionForm.name}
                  onChange={(e) =>
                    setPositionForm({ ...positionForm, name: e.target.value })
                  }
                  disabled={positionLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position-description" className="col-span-1">
                  Description
                </Label>
                <Input
                  id="position-description"
                  className="col-span-3"
                  placeholder="e.g. The highest office in the election."
                  value={positionForm.description}
                  onChange={(e) =>
                    setPositionForm({
                      ...positionForm,
                      description: e.target.value,
                    })
                  }
                  disabled={positionLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position-election" className="col-span-1">
                  Election
                </Label>
                <Select
                  value={positionForm.electionId}
                  onValueChange={(v) =>
                    setPositionForm({ ...positionForm, electionId: v })
                  }
                  disabled={electionsLoading || positionLoading}
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
                  disabled={positionLoading}
                >
                  Back
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreatePosition}
                  disabled={positionLoading}
                >
                  {positionLoading ? "Adding..." : "Add Position"}
                </Button>
              </div>
            </div>
          </TabsContent>
          {/* Candidate Tab */}
          <TabsContent value="candidate">
            <div className="space-y-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="candidate-name" className="col-span-1">
                  Name
                </Label>
                <Input
                  id="candidate-name"
                  className="col-span-3"
                  placeholder="e.g. Jane Doe"
                  value={candidateInput.name}
                  onChange={(e) =>
                    setCandidateInput({
                      ...candidateInput,
                      name: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="candidate-bio" className="col-span-1">
                  Bio
                </Label>
                <Input
                  id="candidate-bio"
                  className="col-span-3"
                  placeholder="Short bio"
                  value={candidateInput.bio}
                  onChange={(e) =>
                    setCandidateInput({
                      ...candidateInput,
                      bio: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="candidate-party" className="col-span-1">
                  Party
                </Label>
                <Input
                  id="candidate-party"
                  className="col-span-3"
                  placeholder="e.g. Independent"
                  value={candidateInput.party}
                  onChange={(e) =>
                    setCandidateInput({
                      ...candidateInput,
                      party: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="candidate-image" className="col-span-1">
                  Avatar URL
                </Label>
                <Input
                  id="candidate-image"
                  className="col-span-3"
                  placeholder="Avatar URL"
                  value={candidateInput.image}
                  onChange={(e) =>
                    setCandidateInput({
                      ...candidateInput,
                      image: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1">Election</Label>
                <Select
                  value={candidateInput.electionId}
                  onValueChange={(value) => {
                    setCandidateInput({
                      ...candidateInput,
                      electionId: value,
                      positionId: "",
                    });
                  }}
                  disabled={loading}
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
                  value={candidateInput.positionId}
                  onValueChange={(value) =>
                    setCandidateInput({ ...candidateInput, positionId: value })
                  }
                  disabled={loading || !candidateInput.electionId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePositions.map((pos: any) => (
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
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="default"
                  onClick={handleCandidateSubmit}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Candidate"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
