"use client";

import React from "react";
import { notFound } from "next/navigation";
import BallotForm from "../BallotForm";
import { useElections } from "@/context/ElectionsContext";
import { Candidate, Position } from "database/src/client/client";

export default function PositionBallotPage({
  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  // In this route, params.positionId is the position.id (string)
  const { positionId } = React.use(params);
  const { elections, loading, error } = useElections();

  // Aggregate all positions and candidates from elections
  const allPositions: Position[] = [];
  const allCandidates: Candidate[] = [];
  elections.forEach((election: any) => {
    if (Array.isArray(election.positions)) {
      allPositions.push(...election.positions);
    }
    if (Array.isArray(election.candidates)) {
      allCandidates.push(...election.candidates);
    }
  });

  // Find the position by id
  const foundPosition = allPositions.find((p: Position) => p.id === positionId);
  // Find candidates for the found position
  const candidates = foundPosition
    ? allCandidates.filter((c: Candidate) => c.positionId === foundPosition.id)
    : [];

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-500">{error}</div>
    );
  }
  if (!foundPosition) return notFound();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">{foundPosition.name}</h1>
      <p className="text-muted-foreground mb-6">
        Review candidates and cast your vote
      </p>
      {candidates.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-center font-medium">
          No candidates registered for this position.
        </div>
      ) : (
        <BallotForm candidates={candidates} />
      )}
    </div>
  );
}
