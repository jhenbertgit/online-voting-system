"use client";

import React, { useEffect, useState } from "react";
import { useElections, type ElectionType } from "@/contexts";
import { useAuth } from "@clerk/nextjs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Position } from "database/src/client";
import { User } from "lucide-react";

// Step order (can be changed, but keeps the sequence)
const VOTE_SEQUENCE = [
  "president",
  "vice president",
  "senator",
  "party list",
  "district representative",
];

function getOrderedPositions(positions: Position[]) {
  // Returns positions sorted by VOTE_SEQUENCE order
  const order = (name: string) => {
    const idx = VOTE_SEQUENCE.findIndex((v) => name.toLowerCase().includes(v));
    return idx === -1 ? 999 : idx;
  };
  return [...positions].sort((a, b) => order(a.name) - order(b.name));
}

interface BallotFormValues {
  [positionId: string]: string | string[];
}

// Zod schema for ballot validation
const ballotSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())])
);

export default function BallotPage() {
  const { elections, loading, error } = useElections();
  const { getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [review, setReview] = useState(false);
  const [orderedPositions, setOrderedPositions] = useState<Position[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [activeElectionId, setActiveElectionId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const currentElection =
    elections.find((el) => el.id === activeElectionId) || elections[0];

  useEffect(() => {
    if (!elections?.length) return;
    const election = currentElection;
    if (!activeElectionId && elections[0]) setActiveElectionId(elections[0].id);
    if (!election) return;
    const positions = getOrderedPositions(election.positions || []);
    setOrderedPositions(positions);
    setStep(0);
    setReview(false);
    setUserId("");
  }, [elections, activeElectionId]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
    watch,
  } = useForm<BallotFormValues>({
    resolver: zodResolver(ballotSchema),
    defaultValues: {},
  });

  // Fetch cached ballot
  const { data: ballotCacheData, isSuccess: isBallotCacheSuccess } = useQuery<
    { ballot: Record<string, unknown> },
    Error
  >({
    queryKey: ["ballot-cache", userId],
    enabled: !!userId,
    queryFn: async (): Promise<{ ballot: Record<string, unknown> }> => {
      const res = await fetch(`/api/ballot-cache?userId=${userId}`);
      return res.json();
    },
    placeholderData: { ballot: {} },
  });

  useEffect(() => {
    if (isBallotCacheSuccess && ballotCacheData?.ballot) {
      reset(ballotCacheData.ballot as BallotFormValues);
    }
  }, [isBallotCacheSuccess, ballotCacheData, reset]);

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
        body: JSON.stringify({ userId, ballot: getValues() }),
      });
    })();
  }, [getValues, userId, getToken]);

  // Submit ballot mutation
  let toastId: string | number;
  let txHash: string | undefined;
  const submitBallot = useMutation({
    mutationFn: async (ballot: BallotFormValues) => {
      const token = await getToken();
      // TODO: Next.js proxy API route for submit-ballot
      // Submit to blockchain
      // const res = await fetch("/api/submit-ballot", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
      //   },
      //   body: JSON.stringify({ userId, ballot }),
      // });
      // if (!res.ok) throw new Error("Failed to submit ballot");
      // return res.json();

      console.log("Submitted ballot:", ballot);
    },
    onSuccess: () => {
      toast.success("Vote submitted successfully", {
        id: toastId,
        description: `Transaction: ${txHash?.slice(0, 6)}...${txHash?.slice(-4)}`,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_POLYGONSCAN_URL}/${txHash}`,
              "_blank"
            ),
        },
      });
    },
    onError: () => {
      toast.error("Failed to submit vote", { id: toastId });
    },
    onMutate: () => {
      toastId = toast.loading("Submitting vote...");
    },
    onSettled: () => {
      toast.dismiss(toastId);
    },
  });

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
            {elections.map((election: ElectionType) => (
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
            {elections.map((election: ElectionType) => (
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
            const selected = getValues()[pos.id];
            let displayValue = null;
            if (isSenator && Array.isArray(selected)) {
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
              <Button
                className="flex-1"
                disabled={submitBallot.isPending}
                size="lg"
              >
                {submitBallot.isPending ? "Submitting..." : "Confirm & Submit"}
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
                  onClick={handleSubmit((data) => {
                    setOpen(false);
                    submitBallot.mutate(data);
                  })}
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
  const isSenatorPosition =
    position && position.name.toLowerCase().includes("senator");
  const SENATOR_MAX_SELECTION = 12;

  // For senator, store an array of selected candidate ids; for others, a single id
  const selectedSenatorIds = isSenatorPosition
    ? getValues()[position.id] || []
    : undefined;
  const selectedValue = watch(position.id);
  const canGoNext = isSenatorPosition
    ? selectedSenatorIds &&
      selectedSenatorIds.length > 0 &&
      selectedSenatorIds.length <= SENATOR_MAX_SELECTION
    : !!selectedValue;
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
          {elections.map((election: ElectionType) => (
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
          <Controller
            control={control}
            name={position.id}
            render={({ field }) =>
              isSenatorPosition ? (
                <div
                  className={
                    candidates.length === 2
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                      : candidates.length > 2
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        : "flex flex-col gap-6"
                  }
                >
                  {candidates.map((candidate) => {
                    const isSelected =
                      Array.isArray(field.value) &&
                      field.value.includes(candidate.id);
                    return (
                      <div
                        key={candidate.id}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          let newValue = Array.isArray(field.value)
                            ? [...field.value]
                            : [];
                          if (isSelected) {
                            newValue = newValue.filter(
                              (id) => id !== candidate.id
                            );
                          } else {
                            if (newValue.length < SENATOR_MAX_SELECTION) {
                              newValue.push(candidate.id);
                            }
                          }
                          field.onChange(newValue);
                        }}
                        className={`border-2 rounded-2xl p-6 flex flex-col items-center transition-shadow duration-150 bg-white shadow-sm relative cursor-pointer outline-none focus:ring-2 focus:ring-primary select-none ${
                          isSelected
                            ? "border-4 border-primary bg-primary/10 shadow-lg"
                            : "border-muted hover:border-primary/50 hover:shadow"
                        }`}
                      >
                        <div className="w-full flex flex-col items-center">
                          {candidate.avatar ? (
                            <img
                              src={candidate.avatar}
                              alt={candidate.name}
                              className="w-24 h-24 mb-4 object-cover rounded-xl bg-muted border"
                            />
                          ) : (
                            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-xl bg-muted border">
                              <User className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-semibold text-xl text-center mb-2">
                            {candidate.name}
                          </span>
                          {candidate.party && (
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20 mb-2">
                              {candidate.party}
                            </span>
                          )}
                          {candidate.bio && (
                            <span className="text-muted-foreground text-sm text-center">
                              {candidate.bio}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {errors[position.id] && (
                    <div className="text-red-500 text-sm mt-1 col-span-full">
                      {errors[position.id]?.message?.toString()}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={
                    candidates.length === 2
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                      : candidates.length > 2
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        : "flex flex-col gap-6"
                  }
                >
                  {candidates.map((candidate) => {
                    const isSelected = field.value === candidate.id;
                    return (
                      <div
                        key={candidate.id}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                        onClick={() => field.onChange(candidate.id)}
                        className={`border-2 rounded-2xl p-6 flex flex-col items-center transition-shadow duration-150 bg-white shadow-sm relative cursor-pointer outline-none focus:ring-2 focus:ring-primary select-none ${
                          isSelected
                            ? "border-4 border-primary bg-primary/10 shadow-lg"
                            : "border-muted hover:border-primary/50 hover:shadow"
                        }`}
                      >
                        <div className="w-full flex flex-col items-center">
                          {candidate.avatar ? (
                            <img
                              src={candidate.avatar}
                              alt={candidate.name}
                              className="w-24 h-24 mb-4 object-cover rounded-xl bg-muted border"
                            />
                          ) : (
                            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-xl bg-muted border">
                              <User className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-semibold text-xl text-center mb-2">
                            {candidate.name}
                          </span>
                          {candidate.party && (
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20 mb-2">
                              {candidate.party}
                            </span>
                          )}
                          {candidate.bio && (
                            <span className="text-muted-foreground text-sm text-center">
                              {candidate.bio}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {errors[position.id] && (
                    <div className="text-red-500 text-sm mt-1 col-span-full">
                      {errors[position.id]?.message?.toString()}
                    </div>
                  )}
                </div>
              )
            }
          />
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
