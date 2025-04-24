"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useConfig, useAccount } from "wagmi";
import { getEthersSigner } from "@/lib/web3-utils";
import { generateMerkleTree } from "@/lib/merkle";
import { VotingGuardianABI } from "@/abis";
import { ethers } from "ethers";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAuth } from "@clerk/nextjs";
import { get } from "http";

export function CreateElection() {
  const config = useConfig();
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state with date range
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    voterAddresses: [] as string[],
  });

  // Date range state (strictly following your pattern)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7), // Default: 1 week range
  });

  const url = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { getToken } = useAuth();

  const handleSubmit = async () => {
    try {
      if (!dateRange?.from || !dateRange.to) {
        throw new Error("Please select a valid date range");
      }

      const clerkToken = await getToken();

      setLoading(true);
      const toastId = toast.loading("Creating election...");

      // 1. Get ethers signer
      const signer = await getEthersSigner(config);
      if (!signer) {
        toast.error("No signer available");
        return;
      }

      // 2. Generate Merkle tree
      const { merkleRoot } = generateMerkleTree(formData.voterAddresses);
      // Ensure merkleRoot has 0x prefix
      const formattedMerkleRoot = merkleRoot.startsWith('0x') ? merkleRoot : `0x${merkleRoot}`;

      // 3. Prepare contract
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        VotingGuardianABI,
        signer
      );

      // 4. Convert dates to UNIX timestamps
      const startTime = Math.floor(dateRange.from.getTime() / 1000);
      const endTime = Math.floor(dateRange.to.getTime() / 1000);

      // 5. Create election on-chain
      const tx = await contract.createElection(
        ethers.id(formData.name),
        formData.name,
        startTime,
        endTime,
        formattedMerkleRoot
      );

      toast.loading(`Transaction submitted: ${tx.hash.slice(0, 10)}...`, {
        id: toastId,
      });

      const receipt = await tx.wait();

      // 6. Store in backend
      const response = await fetch(`${url}/elections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          merkleRoot: formattedMerkleRoot,
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          adminAddress: address,
          onChainElectionId: ethers.id(formData.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Backend submission failed");
      }

      toast.success(`Election created successfully!`, {
        id: toastId,
        description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_POLYGONSCAN_URL}/${tx.hash}`,
              "_blank"
            ),
        },
      });

      setOpen(false);
    } catch (error) {
      console.log("Error", (error as Error).message)
      toast.error("Failed to create election", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WalletConnectButton />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Election</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
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
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Date Range Picker - Strictly following your pattern */}
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
                      onSelect={(range) => {
                        console.log("Selected date range:", range);
                        setDateRange(
                          range || {
                            from: new Date(),
                            to: addDays(new Date(), 7),
                          }
                        );
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Voter Addresses */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Voter Addresses</Label>
              <textarea
                value={formData.voterAddresses.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    voterAddresses: e.target.value
                      .split("\n")
                      .filter((a) => a.trim()),
                  })
                }
                className="col-span-3 border rounded-md p-2 h-32"
                placeholder="Enter one address per line"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !dateRange?.from || !dateRange.to}
          >
            {loading ? "Creating..." : "Create Election"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
