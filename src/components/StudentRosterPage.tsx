"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { StudentTableRow } from "@/components/StudentTableRow";
import { DEFAULT_PAGE_SIZE, type PaginationMeta } from "@/lib/pagination";
import { useRosterRefresh } from "@/contexts/roster-refresh";
import type { StudentWithRequests } from "@/types";

const GRADE_OPTIONS = [9, 10, 11, 12] as const;

type RosterParamsUpdate = {
  search?: string | null;
  filter?: "all" | "needs_attention";
  grade?: string;
  page?: number;
  pageSize?: number;
};

function readRosterParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get("search") ?? "",
    filter:
      searchParams.get("filter") === "needs_attention"
        ? ("needs_attention" as const)
        : ("all" as const),
    grade: searchParams.get("grade") ?? "all",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    pageSize:
      parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) ||
      DEFAULT_PAGE_SIZE,
  };
}

export function StudentRosterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshKey } = useRosterRefresh();

  const { search, filter, grade, page, pageSize } = readRosterParams(searchParams);

  const [students, setStudents] = useState<StudentWithRequests[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(true);

  const replaceParams = useCallback(
    (updates: RosterParamsUpdate) => {
      const params = new URLSearchParams(searchParams.toString());

      if ("search" in updates) {
        if (updates.search) params.set("search", updates.search);
        else params.delete("search");
      }
      if ("filter" in updates) {
        if (updates.filter === "needs_attention") params.set("filter", "needs_attention");
        else params.delete("filter");
      }
      if ("grade" in updates) {
        if (updates.grade && updates.grade !== "all") params.set("grade", updates.grade);
        else params.delete("grade");
      }
      if ("page" in updates) {
        if (updates.page && updates.page > 1) params.set("page", String(updates.page));
        else params.delete("page");
      }
      if ("pageSize" in updates) {
        if (updates.pageSize && updates.pageSize !== DEFAULT_PAGE_SIZE) {
          params.set("pageSize", String(updates.pageSize));
        } else {
          params.delete("pageSize");
        }
      }

      const q = params.toString();
      router.replace(q ? `/students?${q}` : "/students", { scroll: false });
    },
    [router, searchParams]
  );

  // Keep the input in sync when the URL changes (nav link, back button, etc.).
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search → URL.
  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => {
      replaceParams({ search: searchInput || null, page: 1 });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search, replaceParams]);

  const fetchStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter === "needs_attention") params.set("filter", "needs_attention");
    if (grade !== "all") params.set("grade", grade);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students);
    setPagination(data.pagination);
    setLoading(false);
  }, [search, filter, grade, page, pageSize]);

  useEffect(() => {
    setLoading(true);
    fetchStudents();
  }, [fetchStudents, refreshKey]);

  return (
    <div className="page page-students">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Cohort roster</p>
          <h2 className="page-title">Students</h2>
          <p className="page-lead">
            Search and filter the upcoming-year cohort, then open a student to edit course
            requests.
          </p>
        </div>
      </header>

      <div className="filters-panel page-toolbar filters-bar">
        <input
          type="search"
          className="roster-search page-search"
          placeholder="Search by name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search students"
        />
        <select
          className="filter-select"
          value={grade}
          onChange={(e) => replaceParams({ grade: e.target.value, page: 1 })}
          aria-label="Filter by grade"
        >
          <option value="all">All grades</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={String(g)}>
              Grade {g}
            </option>
          ))}
        </select>
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${filter === "all" ? "active" : ""}`}
            onClick={() => replaceParams({ filter: "all", page: 1 })}
          >
            All students
          </button>
          <button
            type="button"
            className={`filter-chip ${filter === "needs_attention" ? "active" : ""}`}
            onClick={() => replaceParams({ filter: "needs_attention", page: 1 })}
          >
            Needs attention
          </button>
        </div>
      </div>

      <div className="table-wrap">
        {loading && students.length === 0 ? (
          <div className="empty-state">Loading roster…</div>
        ) : students.length === 0 ? (
          <div className="empty-state">No students match your filters.</div>
        ) : (
          <table className="data-table roster-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Grade</th>
                <th scope="col">Context</th>
                <th scope="col">Flags</th>
                <th scope="col">Requests</th>
                <th scope="col">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <StudentTableRow key={student.id} student={student} index={i} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        meta={pagination}
        onPageChange={(nextPage) => replaceParams({ page: nextPage })}
        onPageSizeChange={(size) => replaceParams({ pageSize: size, page: 1 })}
        disabled={loading}
      />
    </div>
  );
}
