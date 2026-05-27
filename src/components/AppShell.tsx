"use client";

import { useEffect, useState } from "react";
import { StudentRoster } from "@/components/StudentRoster";
import { SCHOOL_YEAR } from "@/constants";
import { RosterRefreshProvider, useRosterRefresh } from "@/contexts/roster-refresh";

function AppShellHeader() {
  const [attentionCount, setAttentionCount] = useState<number | null>(null);
  const { refreshKey } = useRosterRefresh();

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => setAttentionCount(d.attentionCount));
  }, [refreshKey]);

  return (
    <header className="app-header">
      <h1>Course Requests</h1>
      <div className="app-header-meta">
        <span>{SCHOOL_YEAR}</span>
        {attentionCount !== null && attentionCount > 0 && (
          <span className="attention-badge">{attentionCount} need review</span>
        )}
      </div>
    </header>
  );
}

export function AppShell({
  children,
  selectedStudentId,
}: {
  children: React.ReactNode;
  selectedStudentId?: string;
}) {
  return (
    <RosterRefreshProvider>
      <div className="app-shell">
        <AppShellHeader />
        <div className="app-body">
          <StudentRoster selectedId={selectedStudentId} />
          <main className="main-panel">{children}</main>
        </div>
      </div>
    </RosterRefreshProvider>
  );
}
