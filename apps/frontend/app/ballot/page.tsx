"use client";

import React, { useEffect, useState } from "react";
import { useElections } from "@/context";
import { useAuth } from "@clerk/nextjs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Election } from "database/src/client/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Step order (can be changed, but keeps the sequence)
const VOTE_SEQUENCE = [
  "president",
  "vice president",
  "senator",
  "party list",
  "district representative",
];

function getOrderedPositions(positions: any[]) {
  // Returns positions sorted by VOTE_SEQUENCE order
  const order = (name: string) => {
    const idx = VOTE_SEQUENCE.findIndex((v) => name.toLowerCase().includes(v));
    return idx === -1 ? 999 : idx;
  };
  return [...positions].sort((a, b) => order(a.name) - order(b.name));
}

export default function BallotPage() {
  const { elections, loading, error } = useElections();
  const { getToken } = useAuth();
  const [step, setStep] = useState(0); // index in orderedPositions
  const [ballot, setBallot] = useState<any>({}); // { positionId: candidateId }
  const [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderedPositions, setOrderedPositions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [activeElectionId, setActiveElectionId] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Keep a reference to the current election for easy access throughout the component
  const currentElection =
    elections.find((el: any) => el.id === activeElectionId) || elections[0];

  // Prepare positions/candidates for the selected election
  useEffect(() => {
    if (!elections?.length) return;
    // Default to first election if not set
    const election = currentElection;
    if (!activeElectionId && elections[0]) setActiveElectionId(elections[0].id);

    if (!election) return;
    const positions = getOrderedPositions(election.positions || []);
    setOrderedPositions(positions);
    setStep(0); // Reset stepper when election changes
    setReview(false);
    setUserId("");
  }, [elections, activeElectionId]);

  // Restore cached ballot if available
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/ballot-cache?userId=${userId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ballot) setBallot(res.ballot);
      });
  }, [userId]);

  // Cache ballot after each change
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const token = await getToken();
      await fetch("/api/ballot-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, ballot }),
      });
    })();
  }, [ballot, userId, getToken]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-500">{error}</div>
    );
  }
  if (!orderedPositions.length) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Tabs
          value={activeElectionId}
          onValueChange={setActiveElectionId}
          className="mb-6"
        >
          <TabsList>
            {elections.map((election: Election) => (
              <TabsTrigger key={election.id} value={election.id}>
                {election.name.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        No elections found.
      </div>
    );
  }

  // Stepper logic
  if (review) {
    // Final review step
    return (
      <div className="container mx-auto py-8 px-4 max-w-xl">
        <Tabs
          value={activeElectionId}
          onValueChange={setActiveElectionId}
          className="mb-6"
        >
          <TabsList>
            {elections.map((election: Election) => (
              <TabsTrigger key={election.id} value={election.id}>
                {election.name.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <h1 className="text-3xl font-bold mb-6">Review Your Ballot</h1>
        <div className="mb-6 space-y-4">
          {orderedPositions.map((pos) => {
            const isSenator = pos.name.toLowerCase().includes("senator");
            const selected = ballot[pos.id];
            let displayValue = null;
            if (isSenator && Array.isArray(selected)) {
              // Multiple selected senators
              const selectedCandidates = (
                currentElection.candidates || []
              ).filter((c: any) => selected.includes(c.id));
              displayValue =
                selectedCandidates.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCandidates.map((c: any) => (
                      <li key={c.id}>{c.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="italic">No selection</span>
                );
            } else {
              const candidate = (currentElection.candidates || []).find(
                (c: any) => c.id === selected
              );
              displayValue = candidate ? (
                candidate.name
              ) : (
                <span className="italic">No selection</span>
              );
            }
            return (
              <div key={pos.id} className="border rounded-lg p-4">
                <div className="font-semibold mb-1">
                  {pos.name.toUpperCase()}
                </div>
                <div className="text-muted-foreground">{displayValue}</div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-8">
          <Button variant="outline" onClick={() => setReview(false)}>
            Back
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button className="flex-1" disabled={submitting} size="lg">
                {submitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit your vote?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit your ballot? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setSubmitting(true);
                    setOpen(false);
                    // TODO: Implement actual submit logic here
                    // blockchain
                    //off-chain (database)
                    console.log("your ballot", ballot);
                    setTimeout(() => {
                      setSubmitting(false);
                      toast.success("Vote submitted successfully");
                    }, 1200);
                  }}
                >
                  Yes, submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  const position = orderedPositions[step];
  const candidates =
    currentElection && position
      ? (currentElection.candidates || []).filter(
          (c: any) => c.positionId === position.id
        )
      : [];
  const canGoBack = step > 0;

  // Helper to check if current position is senator
  const isSenatorPosition =
    position && position.name.toLowerCase().includes("senator");
  const SENATOR_MAX_SELECTION = 12;

  // For senator, store an array of selected candidate ids; for others, a single id
  const selectedSenatorIds = isSenatorPosition
    ? ballot[position.id] || []
    : undefined;

  const canGoNext = isSenatorPosition
    ? selectedSenatorIds &&
      selectedSenatorIds.length > 0 &&
      selectedSenatorIds.length <= SENATOR_MAX_SELECTION
    : ballot[position.id];

  const isLast = step === orderedPositions.length - 1;

  return (
    <div className="container mx-auto py-8 px-4 max-w-xl min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Online Voting System</h1>
      <Tabs
        value={activeElectionId}
        onValueChange={setActiveElectionId}
        className="mb-6"
      >
        <TabsList>
          {elections.map((election: Election) => (
            <TabsTrigger key={election.id} value={election.id}>
              {election.name.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">
          Step {step + 1} of {orderedPositions.length}: Vote for{" "}
          {position?.name.toUpperCase()}
        </div>
        {candidates.length ? (
          <RadioGroup
            value={isSenatorPosition ? undefined : ballot[position.id] || ""}
            onValueChange={(val) => {
              if (isSenatorPosition) return; // ignore for senator, handled below
              setBallot((prev: any) => ({ ...prev, [position.id]: val }));
            }}
            className="flex flex-col gap-4"
          >
            {candidates.map((candidate: any) => {
              const isSelected = isSenatorPosition
                ? selectedSenatorIds.includes(candidate.id)
                : ballot[position.id] === candidate.id;
              return (
                <div
                  key={candidate.id}
                  className={`border rounded-xl p-4 flex items-center gap-4 transition-shadow duration-150 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "hover:border-primary/50 hover:shadow"
                  }`}
                >
                  {isSenatorPosition ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={
                        !isSelected &&
                        selectedSenatorIds.length >= SENATOR_MAX_SELECTION
                      }
                      onChange={(e) => {
                        setBallot((prev: any) => {
                          const prevArr = prev[position.id] || [];
                          if (e.target.checked) {
                            // add
                            if (prevArr.length < SENATOR_MAX_SELECTION) {
                              return {
                                ...prev,
                                [position.id]: [...prevArr, candidate.id],
                              };
                            }
                            return prev;
                          } else {
                            // remove
                            return {
                              ...prev,
                              [position.id]: prevArr.filter(
                                (id: string) => id !== candidate.id
                              ),
                            };
                          }
                        });
                      }}
                      className="mr-4 size-5 accent-primary"
                    />
                  ) : (
                    <RadioGroupItem
                      value={candidate.id}
                      id={candidate.id}
                      className="mr-4"
                    />
                  )}
                  <Avatar className="size-12">
                    {candidate.avatar || candidate.avatarUrl ? (
                      <AvatarImage
                        src={candidate.avatar || candidate.avatarUrl}
                        alt={candidate.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {candidate.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label
                    htmlFor={candidate.id}
                    className="cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">
                        {candidate.name}
                      </span>
                      {candidate.party && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide border border-primary/20">
                          {candidate.party}
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {candidate.bio || ""}
                    </div>
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="italic text-muted-foreground">
            No candidates for this position.
          </div>
        )}
      </div>
      <div className="flex justify-between gap-2 mt-8">
        {canGoBack ? (
          <Button
            variant="ghost"
            className="px-6 py-2 border border-muted-foreground/20 rounded-lg hover:bg-muted/50 transition"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </Button>
        ) : (
          <div className="w-[92px]" />
        )}
        {isLast ? (
          <Button
            disabled={candidates.length ? !canGoNext : false}
            className="flex-1 px-8 py-2 text-base font-semibold rounded-lg shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
            size="lg"
            onClick={() => setReview(true)}
          >
            Review Ballot
          </Button>
        ) : candidates.length ? (
          <Button
            disabled={!canGoNext}
            className="flex-1 px-8 py-2 text-base font-semibold rounded-lg shadow bg-accent text-accent-foreground hover:bg-accent/80 transition"
            size="lg"
            onClick={() => setStep((s) => s + 1)}
          >
            Cast Vote
          </Button>
        ) : (
          <Button
            className="flex-1 px-8 py-2 text-base font-semibold rounded-lg shadow bg-muted text-muted-foreground hover:bg-muted/70 transition"
            size="lg"
            onClick={() => setStep((s) => s + 1)}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
