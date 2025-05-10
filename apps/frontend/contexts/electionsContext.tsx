"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  JSX,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { Candidate, Election, Position, Vote } from "database/src/client";

/**
 * ElectionType extends Election with related data.
 */
export interface ElectionType extends Election {
  /**
   * Array of positions.
   */
  positions: Position[];
  /**
   * Array of candidates.
   */
  candidates: Candidate[];
  /**
   * Array of votes.
   */
  votes: Vote[];
}

/**
 * ElectionsContextType defines the context shape for election data and actions.
 */
interface ElectionsContextType {
  /**
   * Array of elections.
   */
  elections: ElectionType[];
  /**
   * Loading state.
   */
  loading: boolean;
  /**
   * Error message.
   */
  error: string | null;
  /**
   * Refresh function.
   */
  refresh: () => void;
}

/**
 * ElectionsContext is the context for election data and actions.
 */
const ElectionsContext = createContext<ElectionsContextType | undefined>(
  undefined
);

/**
 * Cache key for elections data.
 * @constant
 */
const ELECTIONS_CACHE_KEY = "elections:all";

/**
 * ElectionsProvider supplies election data and refresh logic to descendants.
 * @param props - Children React nodes.
 * @returns {JSX.Element}
 */
export function ElectionsProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { getToken } = useAuth();
  const [elections, setElections] = useState<ElectionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches elections from cache or API and updates state.
   */
  const fetchElections = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      let cached: unknown[] | null = null;
      if (!ELECTIONS_CACHE_KEY) {
        setLoading(false);
        return;
      } else {
        try {
          const cacheRes = await fetch(`/api/cache/${ELECTIONS_CACHE_KEY}`);
          if (cacheRes.ok) {
            const cacheData = await cacheRes.json();
            if (cacheData.value) {
              cached = JSON.parse(cacheData.value);
              setElections(cached as ElectionType[]);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore cache errors, fallback to API
        }
      }
      const res = await fetch("/api/elections");
      if (!res.ok) throw new Error("Failed to fetch elections");
      const data = await res.json();
      setElections(data as ElectionType[]);
      try {
        await fetch(`/api/cache`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: ELECTIONS_CACHE_KEY,
            value: JSON.stringify(data),
            ttlSeconds: 900,
          }),
        });
      } catch {
        // ignore cache set errors
      }
    } catch (err) {
      setError((err as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  return (
    <ElectionsContext.Provider
      value={{ elections, loading, error, refresh: fetchElections }}
    >
      {children}
    </ElectionsContext.Provider>
  );
}

/**
 * useElections provides access to the ElectionsContext.
 * @returns {ElectionsContextType}
 * @throws Error if used outside ElectionsProvider.
 */
export function useElections(): ElectionsContextType {
  const context = useContext(ElectionsContext);
  if (!context) {
    throw new Error("useElections must be used within an ElectionsProvider");
  }
  return context;
}
