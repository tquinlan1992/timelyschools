"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Course, RequestType } from "@/types";

export function AddCourseSheet({
  studentId,
  studentName,
  existingCodes,
  studentGrade,
  open,
  onClose,
  onAdded,
  onError,
}: {
  studentId: string;
  studentName: string;
  existingCodes: string[];
  studentGrade: number;
  open: boolean;
  onClose: () => void;
  onAdded: (requestId: string) => void;
  onError: (message: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("priority");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/courses${params}`);
    setCourses(await res.json());
  }, [search]);

  // Reset form only when sheet opens — must NOT depend on fetchCourses (it changes with search).
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setNote("");
    setShowNote(false);
    setRequestType("priority");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(fetchCourses, 200);
    return () => clearTimeout(t);
  }, [search, open, fetchCourses]);

  const byDepartment = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const c of courses) {
      const list = map.get(c.department) ?? [];
      list.push(c);
      map.set(c.department, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  const handleAdd = async (course: Course) => {
    if (existingCodes.includes(course.code)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${studentId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: course.code,
          requestType,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to add course");
        return;
      }
      onAdded(data.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="sheet-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
      />
      <div className="sheet-panel" role="dialog" aria-labelledby="add-course-title">
        <div className="sheet-header">
          <h2 id="add-course-title">Add course</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="sheet-body">
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Adding to <strong>{studentName}</strong>
          </p>
          <fieldset className="request-type-field">
            <legend className="request-type-legend">Add as</legend>
            <div className="segmented-control" role="group" aria-label="Request type">
              <button
                type="button"
                className={requestType === "priority" ? "active priority" : ""}
                onClick={() => setRequestType("priority")}
                aria-pressed={requestType === "priority"}
              >
                Priority
              </button>
              <button
                type="button"
                className={requestType === "elective" ? "active elective" : ""}
                onClick={() => setRequestType("elective")}
                aria-pressed={requestType === "elective"}
              >
                Elective
              </button>
            </div>
            <p className="request-type-hint">
              {requestType === "priority"
                ? "Core courses the student needs for graduation or their plan."
                : "Additional courses beyond core requirements."}
            </p>
          </fieldset>
          <input
            type="search"
            className="catalog-search"
            placeholder="Search catalog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {!showNote ? (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginBottom: "1rem", fontSize: "0.8rem" }}
              onClick={() => setShowNote(true)}
            >
              + Add note
            </button>
          ) : (
            <textarea
              className="note-field"
              placeholder="e.g. retake, accelerated"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          )}
          {byDepartment.map(([dept, deptCourses]) => (
            <div key={dept} className="catalog-dept">
              <h4>{dept}</h4>
              {deptCourses.map((course) => {
                const alreadyAdded = existingCodes.includes(course.code);
                const gradeWarning =
                  course.grades.length > 0 && !course.grades.includes(studentGrade);
                return (
                  <button
                    key={course.code}
                    type="button"
                    className="catalog-item"
                    disabled={alreadyAdded || submitting}
                    onClick={() => handleAdd(course)}
                  >
                    <div>
                      <div className="catalog-item-name">{course.name}</div>
                      <div className="catalog-item-meta">
                        {course.code}
                        {course.grades.length > 0 &&
                          ` · Grades ${course.grades.join(", ")}`}
                        {gradeWarning && " · Outside typical grade"}
                        {alreadyAdded && " · Already added"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
