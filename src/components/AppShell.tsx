"use client";

import { useEffect, useState } from "react";
import { StudentRoster } from "@/components/StudentRoster";
import { SCHOOL_YEAR } from "@/constants";

export function AppShell({
  children,
  selectedStudentId,
}: {
  children: React.ReactNode;
  selectedStudentId?: string;
}) {
  const [attentionCount, setAttentionCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => setAttentionCount(d.attentionCount));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Course Requests</h1>
        <div className="app-header-meta">
          <span>{SCHOOL_YEAR}</span>
          {attentionCount !== null && attentionCount > 0 && (
            <span className="attention-badge">{attentionCount} need review</span>
          )}
        </div>
      </header>
      <div className="app-body">
        <StudentRoster selectedId={selectedStudentId} />
        <main className="main-panel">{children}</main>
      </div>
    </div>
  );
}
