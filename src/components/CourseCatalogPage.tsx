"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/Pagination";
import { DEFAULT_PAGE_SIZE, paginate, type PaginationMeta } from "@/lib/pagination";
import type { Course } from "@/types";

export function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : data.courses ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    fetchCourses();
  }, [fetchCourses]);

  const departments = useMemo(() => {
    const set = new Set(courses.map((c) => c.department));
    return Array.from(set).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    let list = courses;
    if (department !== "all") {
      list = list.filter((c) => c.department === department);
    }
    return list.sort(
      (a, b) =>
        a.department.localeCompare(b.department) ||
        a.code.localeCompare(b.code)
    );
  }, [courses, department]);

  const paged = useMemo(() => {
    const result = paginate(filtered, page, pageSize);
    return result;
  }, [filtered, page, pageSize]);

  const pagination: PaginationMeta = {
    page: paged.page,
    pageSize: paged.pageSize,
    total: paged.total,
    totalPages: paged.totalPages,
  };

  return (
    <div className="page page-courses">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Appendix A · 2026–27</p>
          <h2 className="page-title">Course catalog</h2>
          <p className="page-lead">
            Review district course codes, titles, and typical grade levels before assigning
            requests on a student workspace.
          </p>
        </div>
      </header>

      <div className="filters-panel page-toolbar filters-bar">
        <input
          type="search"
          className="roster-search page-search"
          placeholder="Search by name, code, or department…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search courses"
        />
        <select
          className="filter-select"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by department"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        {loading && courses.length === 0 ? (
          <div className="empty-state">Loading catalog…</div>
        ) : paged.items.length === 0 ? (
          <div className="empty-state">No courses match your filters.</div>
        ) : (
          <table className="data-table catalog-table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Course name</th>
                <th scope="col">Department</th>
                <th scope="col">Typical grades</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((course) => (
                <tr key={course.code}>
                  <td>
                    <code className="course-code">{course.code}</code>
                  </td>
                  <td className="catalog-course-name">{course.name}</td>
                  <td>{course.department}</td>
                  <td>
                    <span className="grade-pills">
                      {course.grades.map((g) => (
                        <span key={g} className="grade-pill">
                          {g}
                        </span>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        meta={pagination}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        disabled={loading}
      />
    </div>
  );
}
