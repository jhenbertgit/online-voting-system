"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import BallotItem from "./BallotItem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { getCandidates } from "@/lib/candidates";
import { PositionSlug } from "./types";

export default function BallotForm({ position }: { position: string }) {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Blockchain submission logic
  };

  const candidates = getCandidates(position as PositionSlug);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup
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
