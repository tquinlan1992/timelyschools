"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RosterRefreshContextValue = {
  refreshKey: number;
  notifyRosterChanged: () => void;
};

const RosterRefreshContext = createContext<RosterRefreshContextValue | null>(null);

export function RosterRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const notifyRosterChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(
    () => ({ refreshKey, notifyRosterChanged }),
    [refreshKey, notifyRosterChanged]
  );

  return (
    <RosterRefreshContext.Provider value={value}>{children}</RosterRefreshContext.Provider>
  );
}

export function useRosterRefresh(): RosterRefreshContextValue {
  const ctx = useContext(RosterRefreshContext);
  if (!ctx) {
    throw new Error("useRosterRefresh must be used within RosterRefreshProvider");
  }
  return ctx;
}
