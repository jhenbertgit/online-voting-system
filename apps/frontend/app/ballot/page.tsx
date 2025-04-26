"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useElections } from "@/context/ElectionsContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Position } from "database/src/client/client";

export default function BallotPage() {
  const { elections, loading, error } = useElections();

  // Aggregate unique positions from all elections
  const positionMap: Record<string, any> = {};
  elections.forEach((election: any) => {
    if (Array.isArray(election.positions)) {
      election.positions.forEach((pos: any) => {
        if (pos && pos.id && !positionMap[pos.id]) {
          positionMap[pos.id] = pos;
        }
      });
    }
  });
  const positions = Object.values(positionMap);

  // Build positionId -> {candidates, votes} map
  const positionStats: Record<string, { candidates: any[]; votes: any[] }> = {};
  positions.forEach((pos: any) => {
    positionStats[pos.id] = { candidates: [], votes: [] };
  });

  elections.forEach((election: any) => {
    // Candidates
    if (Array.isArray(election.candidates)) {
      election.candidates.forEach((candidate: any) => {
        if (candidate.positionId && positionStats[candidate.positionId]) {
          positionStats[candidate.positionId].candidates.push(candidate);
        }
      });
    }
    // Votes
    if (Array.isArray(election.votes)) {
      election.votes.forEach((vote: any) => {
        if (vote.positionId && positionStats[vote.positionId]) {
          positionStats[vote.positionId].votes.push(vote);
        }
      });
    }
  });

  // Enrich positions with candidate/vote info
  const enrichedPositions = positions.map((pos: any) => ({
    ...pos,
    candidates: positionStats[pos.id].candidates,
    votes: positionStats[pos.id].votes,
  }));

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-500">{error}</div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        2025 National and Local Elections
      </h1>
      <p className="text-muted-foreground mb-8">
        Select a position to view candidates and cast your vote
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedPositions.map((position: any) => (
          <Link
            key={position.id}
            href={`/ballot/${position.id}`}
            className="group transition-all"
          >
            <Card className="h-full hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {position.name}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  {position.description || "No description"}
                </p>
                <div className="flex justify-between text-sm mb-1">
                  <span>{position.candidates?.length ?? 0} candidates</span>
                  <span>{position.votes?.length ?? 0}% voted</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${position.votes?.length ?? 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
