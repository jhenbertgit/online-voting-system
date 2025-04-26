"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Candidate } from "database/src/client/client";
import { ethers } from "ethers";
import { useAuth } from "@clerk/nextjs";
import { VotingGuardianABI } from "@/abis";
import { getEthersSigner } from "@/lib/web3-utils";
import { toast } from "sonner";
import BallotItem from "./BallotItem";
import { useConfig } from "wagmi";

interface BallotFormProps {
  candidates: Candidate[];
}

export default function BallotForm({ candidates }: BallotFormProps) {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = useConfig();
  const formData = new FormData();
  const { getToken } = useAuth();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Get Clerk user ID
      const { userId } = useAuth();
      if (!userId) throw new Error("Not authenticated");

      // 2. Generate voter commitment (hash of user ID + secret salt)
      const secretSalt =
        localStorage.getItem("voteSalt") || ethers.id(Date.now().toString());

      const abiCoder = ethers.AbiCoder.defaultAbiCoder();

      const voterCommitment = ethers.keccak256(
        abiCoder.encode(["string", "bytes32"], [userId, secretSalt])
      );

      // 3. Store salt if new
      if (!localStorage.getItem("voteSalt")) {
        localStorage.setItem("voteSalt", secretSalt);
      }

      // 4. Prepare candidate hash (match contract's bytes32 idHash)
      const candidateHash = ethers.keccak256(
        ethers.toUtf8Bytes(formData.get("candidate") as string)
      );

      // 5. Get Merkle proof from API
      const proofRes = await fetch(
        `${url}/elections/${formData.get("electionId")}/proof/${voterCommitment}`
      );
      const { merkleProof } = await proofRes.json();

      // 6. Submit to blockchain
      const signer = await getEthersSigner(config);
      if (!signer) {
        toast.error("No signer available");
        return;
      }

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        VotingGuardianABI, // Make sure ABI matches your contract
        signer
      );

      const tx = await contract.castVote(
        formData.get("electionId"),
        voterCommitment,
        candidateHash,
        merkleProof
      );

      const receipt = await tx.wait();

      // 7. Verify blockchain validation
      const voteRecorded = await contract.spentCommitments(
        formData.get("electionId"),
        voterCommitment
      );
      if (!voteRecorded) throw new Error("Vote not recorded on-chain");

      // 8. Store in backend
      const clerkToken = await getToken();
      await fetch("/api/ballot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({
          electionId: formData.get("electionId"),
          candidateHash: candidateHash,
          voterCommitment: voterCommitment,
          txHash: receipt.transactionHash,
          userId,
        }),
      });

      alert("Vote recorded successfully!");
    } catch (error) {
      console.error("Voting failed:", error);
      alert(
        `Voting failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup
        name="candidate"
        value={selectedCandidate}
        onValueChange={setSelectedCandidate}
        className="grid gap-4"
      >
        {candidates.map((candidate) => (
          <BallotItem key={candidate.id} candidate={candidate} />
        ))}
      </RadioGroup>

      <Alert className="bg-blue-50 border-blue-200">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Your vote is encrypted and recorded on Polygon blockchain for
          transparency.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!selectedCandidate || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Cast Vote"}
        </Button>
      </div>
    </form>
  );
}
