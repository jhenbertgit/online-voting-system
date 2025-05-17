"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  JSX,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { z } from "zod";

// Constants
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Schema for validating election data
const PositionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  onChainPositionId: z.string().optional().nullable(),
  electionId: z.string().uuid(),
});

const CandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bio: z.string().optional().nullable(),
  party: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  onChainCandidateId: z.string().optional().nullable(),
  positionId: z.string().uuid(),
  electionId: z.string().uuid(),
});

const VoteSchema = z.object({
  id: z.string().uuid(),
  electionId: z.string().uuid(),
  positionId: z.string().uuid(),
  candidateId: z.string().uuid(),
  candidateHash: z.string(),
  userId: z.string().uuid(),
  voterCommitment: z.string(),
  txHash: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
});

const ElectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  approved: z.boolean().default(false),
  merkleRoot: z.string(),
  onChainElectionId: z.string().optional().nullable(),
  contractAddress: z.string(),
  adminAddress: z.string(),
  candidateTree: z.record(z.unknown()).optional().nullable(),
  createdAt: z.string().datetime(),
  // Relations
  positions: z.array(PositionSchema).optional(),
  candidates: z.array(CandidateSchema).optional(),
  votes: z.array(VoteSchema).optional(),
});

// Custom preprocess function to handle null/undefined values
function preprocessElectionData(data: any) {
  return {
    ...data,
    onChainElectionId: data.onChainElectionId || null,
    candidateTree: data.candidateTree || null,
    positions:
      data.positions?.map((position: any) => ({
        ...position,
        onChainPositionId: position.onChainPositionId || null,
        // Ensure other fields are properly formatted
        description: position.description || null,
      })) || [],
    candidates:
      data.candidates?.map((candidate: any) => ({
        ...candidate,
        onChainCandidateId: candidate.onChainCandidateId || null,
        bio: candidate.bio || null,
        party: candidate.party || null,
        avatar: candidate.avatar || null,
      })) || [],
  };
}

type ElectionType = z.infer<typeof ElectionSchema>;

interface ElectionsState {
  elections: ElectionType[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface ElectionsContextType extends Omit<ElectionsState, "lastFetched"> {
  refresh: () => Promise<void>;
  getElectionById: (id: string) => ElectionType | undefined;
}

const ElectionsContext = createContext<ElectionsContextType | undefined>(
  undefined
);

/**
 * Fetches data with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fetchWithRetry<T>(url, options, retries - 1);
  }
}

export function ElectionsProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { getToken } = useAuth();
  const [state, setState] = useState<ElectionsState>({
    elections: [],
    loading: true,
    error: null,
    lastFetched: null,
  });

  const getCacheKey = useCallback(
    (suffix = "") => `elections:${suffix || "all"}`,
    []
  );

  const validateAndParseElections = useCallback(
    (data: unknown): ElectionType[] => {
      // Ensure data is an array
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of elections");
      }

      // Preprocess and validate each election
      return data.map((election) => {
        try {
          const processed = preprocessElectionData(election);
          return ElectionSchema.parse(processed);
        } catch (error) {
          console.error("Error processing election:", election, error);
          throw new Error(
            `Invalid election data: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      });
    },
    []
  );

  const fetchElections = useCallback(
    async (forceRefresh = false): Promise<void> => {
      const now = Date.now();
      const cacheKey = getCacheKey();

      // Return early if we have recent data and not forcing refresh
      if (
        !forceRefresh &&
        state.lastFetched &&
        now - state.lastFetched < CACHE_TTL_MS
      ) {
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Try to get from cache first
        if (!forceRefresh) {
          try {
            const { value, timestamp } = await fetchWithRetry<{ value: string; timestamp: number }>(
              `/api/cache/${cacheKey}`
            );
            
            if (value && now - timestamp < CACHE_TTL_MS) {
              const validatedData = validateAndParseElections(
                JSON.parse(value)
              );
              setState({
                elections: validatedData,
                loading: false,
                error: null,
                lastFetched: timestamp,
              });
              return;
            }
          } catch (cacheError) {
            console.debug("Cache miss or error:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        // Fetch from API with retry logic
        const data = await fetchWithRetry<unknown>("/api/elections", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          cache: "no-store",
        });
        const validatedData = validateAndParseElections(data);
        const timestamp = Date.now();

        // Update cache in the background with retry logic
        try {
          await fetchWithRetry(`/api/cache`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: cacheKey,
              value: JSON.stringify(validatedData),
              ttlSeconds: Math.ceil(CACHE_TTL_MS / 1000), // Convert to seconds
            }),
          });
        } catch (cacheError) {
          console.error("Failed to update cache:", cacheError);
          // Don't fail the request if cache update fails
        }

        setState({
          elections: validatedData,
          loading: false,
          error: null,
          lastFetched: timestamp,
        });
      } catch (error) {
        console.error("Error fetching elections:", error);
        setState({
          elections: [],
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch elections",
          lastFetched: null,
        });
      }
    },
    [getToken, validateAndParseElections, state.lastFetched, getCacheKey]
  );

  // Initial fetch
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ElectionsContextType>(
    () => ({
      elections: state.elections,
      loading: state.loading,
      error: state.error,
      refresh: () => fetchElections(true),
      getElectionById: (id: string) =>
        state.elections.find((election) => election.id === id),
    }),
    [state.elections, state.loading, state.error, fetchElections]
  );

  // Initial fetch
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  return (
    <ElectionsContext.Provider value={contextValue}>
      {children}
    </ElectionsContext.Provider>
  );
}

export function useElections(): ElectionsContextType {
  const context = useContext(ElectionsContext);
  if (!context) {
    throw new Error("useElections must be used within an ElectionsProvider");
  }
  return context;
}

export type { ElectionType };
