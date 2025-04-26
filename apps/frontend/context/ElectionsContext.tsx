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

export function ElectionsProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchElections = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const token = await getToken?.();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${url}/elections`, { headers });
      if (!res.ok) throw new Error("Failed to fetch elections");
      const data = await res.json();

      setElections(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
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
