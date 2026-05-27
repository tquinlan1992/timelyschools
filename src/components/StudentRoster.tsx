"use client";

import { useCallback, useEffect, useState } from "react";
import { StudentRow } from "@/components/StudentRow";
import { useRosterRefresh } from "@/contexts/roster-refresh";
import type { StudentWithRequests } from "@/types";

export function StudentRoster({ selectedId }: { selectedId?: string }) {
  const [students, setStudents] = useState<StudentWithRequests[]>([]);
  const [attentionCount, setAttentionCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "needs_attention">("all");
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useRosterRefresh();

  const fetchStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter === "needs_attention") params.set("filter", "needs_attention");
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students);
    setAttentionCount(data.attentionCount);
    setLoading(false);
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchStudents();
    }, search ? 200 : 0);
    return () => clearTimeout(t);
  }, [fetchStudents, search, refreshKey]);

  return (
    <aside className="sidebar">
      <div className="roster-toolbar">
        <input
          type="search"
          className="roster-search"
          placeholder="Search students…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search students"
        />
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-chip ${filter === "needs_attention" ? "active" : ""}`}
            onClick={() => setFilter("needs_attention")}
          >
            Needs attention
          </button>
        </div>
      </div>
      {loading && students.length === 0 ? (
        <div className="empty-state" style={{ margin: "1rem" }}>
          Loading roster…
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state" style={{ margin: "1rem" }}>
          No students match your search.
        </div>
      ) : (
        <ul className="student-list" role="listbox" aria-label="Student roster">
          {students.map((student, i) => (
            <StudentRow
              key={student.id}
              student={student}
              selected={student.id === selectedId}
              index={i}
            />
          ))}
        </ul>
      )}
      <div style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", color: "var(--muted)" }}>
        {attentionCount} need review
      </div>
    </aside>
  );
}
