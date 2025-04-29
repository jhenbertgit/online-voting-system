"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";

interface ElectionsContextType {
  elections: any[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const ElectionsContext = createContext<ElectionsContextType | undefined>(
  undefined
);

// Utility for cache key
const ELECTIONS_CACHE_KEY = "elections:all";

export function ElectionsProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to get elections from backend cache first, then fallback to API
  const fetchElections = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Next.js API proxy endpoints
      // 1. Try to get from cache API (proxy)
      let cached: any[] | null = null;
      if (!ELECTIONS_CACHE_KEY) {
        setLoading(false);
        // Optionally, you could fallback to the API here immediately
        return; // Uncomment to stop here
      } else {
        try {
          const cacheRes = await fetch(`/api/cache/${ELECTIONS_CACHE_KEY}`);
          if (cacheRes.ok) {
            const cacheData = await cacheRes.json();
            if (cacheData.value) {
              cached = JSON.parse(cacheData.value);
              setElections(cached || []);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          // ignore cache errors, fallback to API
        }
      }

      // 2. Fallback: Fetch live from elections API (via Next.js proxy)
      const res = await fetch("/api/elections");
      if (!res.ok) throw new Error("Failed to fetch elections");
      const data = await res.json();
      setElections(data);

      // 3. Store in backend cache for next time (proxy)
      try {
        await fetch(`/api/cache`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: ELECTIONS_CACHE_KEY,
            value: JSON.stringify(data),
            ttlSeconds: 900,
          }), // cache for 15 min
        });
      } catch (e) {
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

export function useElections() {
  const context = useContext(ElectionsContext);
  if (!context) {
    throw new Error("useElections must be used within an ElectionsProvider");
  }
  return context;
}
