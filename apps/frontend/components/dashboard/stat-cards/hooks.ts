import { useEffect, useState, useMemo } from "react";
import { ElectionType } from "./types";

export function useVoterCount() {
  const [voterCount, setVoterCount] = useState<number | null>(null);
  const [voterLoading, setVoterLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVoterCount = async () => {
      setVoterLoading(true);
      try {
        const res = await fetch("/api/voters-count");
        const data = await res.json();
        setVoterCount(data.count);
      } catch {
        setVoterCount(null);
      } finally {
        setVoterLoading(false);
      }
    };
    fetchVoterCount();
  }, []);

  return { voterCount, voterLoading };
}

export function useStatCalculations(elections: ElectionType[]) {
  const { totalCandidates, totalPositions, totalPartyLists } = useMemo(() => {
    const candidates = elections.reduce(
      (sum, election) => sum + election.candidates.length,
      0
    );
    const positions = elections.reduce(
      (sum, election) => sum + election.positions.length,
      0
    );
    const partyLists = elections.reduce(
      (sum, election) =>
        sum +
        election.positions
          .filter((pos) => pos.name.toLowerCase() === "party list")
          .reduce(
            (posSum, pos) =>
              posSum +
              election.candidates.filter(
                (candidate) => candidate.positionId === pos.id
              ).length,
            0
          ),
      0
    );

    return {
      totalCandidates: candidates,
      totalPositions: positions,
      totalPartyLists: partyLists,
    };
  }, [elections]);

  return { totalCandidates, totalPositions, totalPartyLists };
}
