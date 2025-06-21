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

/**
 * Preprocesses election data to ensure it conforms to the expected schema
 * @param data Raw election data that needs preprocessing
 * @returns Parsed and validated data that conforms to ElectionType
 * @throws {z.ZodError} If the data doesn't match the expected schema
 */
function preprocessElectionData(data: unknown): ElectionType {
  try {
    // Parse the data using the Zod schema
    const parsedData = ElectionSchema.parse(data);

    // Process positions with type safety
    const positions = Array.isArray(parsedData.positions)
      ? parsedData.positions.map((position) => ({
          id: position.id,
          name: position.name,
          electionId: position.electionId,
          description: position.description ?? null,
          onChainPositionId: position.onChainPositionId ?? null,
        }))
      : [];

    // Process candidates with type safety
    const candidates = Array.isArray(parsedData.candidates)
      ? parsedData.candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          positionId: candidate.positionId,
          electionId: candidate.electionId,
          onChainCandidateId: candidate.onChainCandidateId ?? null,
          bio: candidate.bio ?? null,
          party: candidate.party ?? null,
          avatar: candidate.avatar ?? null,
        }))
      : [];

    // Return the fully typed and validated data
    return {
      ...parsedData,
      positions,
      candidates,
      votes: parsedData.votes ?? [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Election data validation failed:", error.errors);
      throw new Error(
        `Invalid election data: ${error.errors.map((e) => `${e.path.join(".")} - ${e.message}`).join("; ")}`
      );
    }
    throw error;
  }
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
 * Fetches data with retry logic and supports cancellation
 * @param url URL to fetch from
 * @param options Fetch options
 * @param retries Number of retries left
 * @param signal Optional AbortSignal for cancellation
 * @returns Promise resolving to the fetched data
 * @throws {DOMException} When the operation is aborted
 * @throws {Error} When max retries are exceeded or other fetch errors occur
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  signal?: AbortSignal
): Promise<T> {
  try {
    // Create a new AbortController to combine with the provided signal
    const controller = new AbortController();
    const abortHandler = () => controller.abort();

    // Combine the signals if an external signal is provided
    if (signal) {
      if (signal.aborted) {
        throw new DOMException("The operation was aborted", "AbortError");
      }
      signal.addEventListener("abort", abortHandler, { once: true });
    }

    try {
      // Merge the signal with existing options
      const fetchOptions: RequestInit = {
        ...options,
        signal: controller.signal,
      };

      const response = await fetch(url, fetchOptions);

      // Clean up the abort listener if the fetch succeeds
      signal?.removeEventListener("abort", abortHandler);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Clean up the abort listener on error
      signal?.removeEventListener("abort", abortHandler);

      // Re-throw if aborted or no more retries
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      if (retries <= 0) {
        throw new Error(
          `Max retries (${MAX_RETRIES}) exceeded: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // Check if aborted during the delay
      if (signal?.aborted) {
        throw new DOMException("The operation was aborted", "AbortError");
      }

      // Wait for the delay or abort, whichever comes first
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, RETRY_DELAY_MS);

        const cleanup = () => {
          clearTimeout(timeout);
          signal?.removeEventListener("abort", onAbort);
        };

        const onAbort = () => {
          cleanup();
          reject(new DOMException("The operation was aborted", "AbortError"));
        };

        if (signal) {
          if (signal.aborted) {
            cleanup();
            reject(new DOMException("The operation was aborted", "AbortError"));
            return;
          }
          signal.addEventListener("abort", onAbort, { once: true });
        }

        // Clean up the listener when the timeout completes
        setTimeout(() => {
          signal?.removeEventListener("abort", onAbort);
        }, RETRY_DELAY_MS);
      });

      // Recursively retry with decremented retry count
      return fetchWithRetry<T>(url, options, retries - 1, signal);
    }
  } catch (error) {
    // Ensure we don't leak the AbortError details to the caller
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new DOMException("The operation was aborted", "AbortError");
    }
    throw error;
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
    loading: false, // Start with false to prevent initial flicker
    error: null,
    lastFetched: null,
  });

  const getCacheKey = useCallback(
    (suffix = "") => `elections:${suffix || "all"}`,
    []
  );

  interface ValidationResult {
    validElections: ElectionType[];
    errors: Array<{
      index: number;
      error: string;
      election?: unknown;
    }>;
  }

  const validateAndParseElections = useCallback(
    (data: unknown): ValidationResult => {
      // Ensure data is an array
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of elections");
      }

      const result: ValidationResult = {
        validElections: [],
        errors: [],
      };

      data.forEach((election, index) => {
        try {
          const processed = preprocessElectionData(election);
          const validated = ElectionSchema.parse(processed);
          result.validElections.push(validated);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`Error processing election at index ${index}:`, error);

          result.errors.push({
            index,
            error: errorMessage,
            election, // Include the raw election data for debugging
          });
        }
      });

      // If we have any valid elections, return them even if there were some errors
      if (result.validElections.length > 0) {
        console.warn(
          `Successfully processed ${result.validElections.length} out of ${data.length} elections. ` +
            `Failed to process ${result.errors.length} elections.`
        );

        // Log detailed error information
        if (result.errors.length > 0) {
          console.group("Election Validation Errors");
          result.errors.forEach((err) => {
            console.error(
              `Index ${err.index}: ${err.error}`,
              "\nElection data:",
              err.election
            );
          });
          console.groupEnd();
        }

        return result;
      }

      // If we couldn't process any elections, throw an error with all validation errors
      throw new Error(
        `Failed to process all elections. Errors:\n` +
          result.errors.map((err) => `[${err.index}]: ${err.error}`).join("\n")
      );
    },
    []
  );

  // Reference to the current abort controller for cleanup on unmount or refresh
  const abortControllerRef = React.useRef<AbortController | null>(null);

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
        // Only update loading state if we're actually going to fetch
        if (state.loading) {
          setState((prev) => ({ ...prev, loading: false }));
        }
        return;
      }

      // Cancel any ongoing requests before starting new ones
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller for this fetch operation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const signal = abortController.signal;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Try to get from cache first
        if (!forceRefresh) {
          try {
            const { value, timestamp } = await fetchWithRetry<{
              value: string;
              timestamp: number;
            }>(`/api/cache/${cacheKey}`, {}, MAX_RETRIES, signal);

            if (value && now - timestamp < CACHE_TTL_MS) {
              const result = validateAndParseElections(JSON.parse(value));

              if (
                result.validElections.length === 0 &&
                result.errors.length > 0
              ) {
                // If we have errors but no valid elections, log and continue to fetch fresh data
                console.warn(
                  "Cached data contained no valid elections, fetching fresh data"
                );
              } else {
                setState({
                  elections: result.validElections,
                  loading: false,
                  error:
                    result.errors.length > 0
                      ? `Warning: ${result.errors.length} elections failed validation`
                      : null,
                  lastFetched: timestamp,
                });
                return;
              }
            }
          } catch (cacheError) {
            // If aborted, propagate the abort and don't continue
            if (
              cacheError instanceof DOMException &&
              cacheError.name === "AbortError"
            ) {
              throw cacheError;
            }
            console.debug("Cache miss or error:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        // Fetch from API with retry logic
        const data = await fetchWithRetry<unknown>(
          "/api/elections",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await getToken()}`,
            },
            cache: "no-store",
          },
          MAX_RETRIES,
          signal
        );

        const result = validateAndParseElections(data);
        const timestamp = Date.now();

        if (result.validElections.length === 0) {
          throw new Error(
            "No valid elections found. " +
              (result.errors.length > 0
                ? `Validation errors: ${result.errors.length} errors encountered`
                : "No validation errors, but no valid elections returned.")
          );
        }

        // Update state with the valid elections
        setState({
          elections: result.validElections,
          loading: false,
          error:
            result.errors.length > 0
              ? `Warning: ${result.errors.length} elections failed validation`
              : null,
          lastFetched: timestamp,
        });

        // Update cache in the background with retry logic
        // We use a separate abort controller for the cache update
        // so it can be independent of the main fetch operation
        try {
          // Only update cache if the main request wasn't aborted
          if (!signal.aborted) {
            const cacheAbortController = new AbortController();
            await fetchWithRetry(
              `/api/cache`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  key: cacheKey,
                  value: JSON.stringify(result.validElections),
                  ttlSeconds: Math.ceil(CACHE_TTL_MS / 1000), // Convert to seconds
                }),
              },
              MAX_RETRIES,
              cacheAbortController.signal
            );
          }
        } catch (cacheError) {
          console.error("Failed to update cache:", cacheError);
          // Don't fail the request if cache update fails
        }

        // State is already updated above with the valid elections
        // This block is no longer needed as we update state right after validation
      } catch (error) {
        // Don't update state if the request was aborted
        if (error instanceof DOMException && error.name === "AbortError") {
          console.debug("Fetch operation was aborted");
          return;
        }

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

  // Initial fetch and cleanup on unmount
  useEffect(() => {
    fetchElections();

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
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
