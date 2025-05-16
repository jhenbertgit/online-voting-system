import { useMemo } from "react";
import type { Candidate, VoteTransmissionTimeData } from "./types";

/**
 * Returns the list of candidates for analytics chart.
 */
export function useCandidates(): Candidate[] {
  return ["Alice", "Bob", "Charlie"];
}

/**
 * Returns mock vote transmission data for the analytics chart.
 * Replace with real data fetching logic as needed.
 */
export function useVoteTransmissionTimeData(): VoteTransmissionTimeData[] {
  // This could be replaced with a TanStack Query call in the future
  return useMemo(
    () => [
      {
        timestamp: "2025-05-15T09:00:00+08:00",
        Alice_offChain: 10,
        Alice_onChain: 0,
        Bob_offChain: 8,
        Bob_onChain: 0,
        Charlie_offChain: 5,
        Charlie_onChain: 0,
      },
      {
        timestamp: "2025-05-15T09:30:00+08:00",
        Alice_offChain: 30,
        Alice_onChain: 20,
        Bob_offChain: 18,
        Bob_onChain: 12,
        Charlie_offChain: 15,
        Charlie_onChain: 10,
      },
      {
        timestamp: "2025-05-15T10:00:00+08:00",
        Alice_offChain: 60,
        Alice_onChain: 50,
        Bob_offChain: 40,
        Bob_onChain: 32,
        Charlie_offChain: 30,
        Charlie_onChain: 25,
      },
      {
        timestamp: "2025-05-15T10:30:00+08:00",
        Alice_offChain: 90,
        Alice_onChain: 80,
        Bob_offChain: 70,
        Bob_onChain: 65,
        Charlie_offChain: 55,
        Charlie_onChain: 50,
      },
      {
        timestamp: "2025-05-15T11:00:00+08:00",
        Alice_offChain: 120,
        Alice_onChain: 115,
        Bob_offChain: 100,
        Bob_onChain: 98,
        Charlie_offChain: 80,
        Charlie_onChain: 77,
      },
    ],
    []
  );
}
