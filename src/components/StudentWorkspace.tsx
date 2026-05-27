"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AddCourseSheet } from "@/components/AddCourseSheet";
import { AttentionBanner } from "@/components/AttentionBanner";
import { RequestColumn } from "@/components/RequestColumn";
import { StatusChip } from "@/components/StatusChip";
import { Toast } from "@/components/Toast";
import type { RequestType, StudentWithRequests } from "@/types";

export function StudentWorkspace({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<StudentWithRequests | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | undefined>();
  const [toast, setToast] = useState<{ message: string; variant?: "error" } | null>(null);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/students/${studentId}`);
    if (!res.ok) {
      setStudent(null);
      setLoading(false);
      return;
    }
    setStudent(await res.json());
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleToggleType = async (id: string, type: RequestType) => {
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: type }),
    });
    if (res.ok) loadStudent();
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Request removed" });
      loadStudent();
    }
  };

  if (loading) {
    return <div className="empty-state">Loading student…</div>;
  }

  if (!student) {
    return (
      <div className="not-found">
        <h2>Student not found</h2>
        <p>
          <Link href="/">← Back to roster</Link>
        </p>
      </div>
    );
  }

  const priority = student.requests.filter((r) => r.requestType === "priority");
  const elective = student.requests.filter((r) => r.requestType === "elective");
  const existingCodes = student.requests.map((r) => r.courseCode);

  return (
    <>
      <Link href="/" className="back-link mobile-only" style={{ display: "none" }}>
        ← Roster
      </Link>
      <div className="workspace-header">
        <p className="workspace-grade">Grade {student.grade}</p>
        <h2>{student.name}</h2>
        <p className="workspace-profile">{student.profile}</p>
        <div className="workspace-chips">
          {student.flags.map((flag) => (
            <StatusChip key={flag} flag={flag} />
          ))}
        </div>
      </div>

      <AttentionBanner studentId={student.id} />

      <div className="workspace-actions">
        <button type="button" className="btn btn-primary" onClick={() => setSheetOpen(true)}>
          Add course
        </button>
      </div>

      <div className="request-columns">
        <RequestColumn
          title="Priority requests"
          variant="priority"
          requests={priority}
          highlightId={highlightId}
          onToggleType={handleToggleType}
          onRemove={handleRemove}
        />
        <RequestColumn
          title="Elective requests"
          variant="elective"
          requests={elective}
          highlightId={highlightId}
          onToggleType={handleToggleType}
          onRemove={handleRemove}
        />
      </div>

      <AddCourseSheet
        studentId={student.id}
        studentName={student.name}
        existingCodes={existingCodes}
        studentGrade={student.grade}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdded={(id) => {
          setHighlightId(id);
          setToast({ message: "Course added" });
          loadStudent();
          setTimeout(() => setHighlightId(undefined), 2000);
        }}
        onError={(msg) => setToast({ message: msg, variant: "error" })}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </>
  );
}
