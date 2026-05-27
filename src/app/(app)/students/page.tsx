import { Suspense } from "react";
import { StudentRosterPage } from "@/components/StudentRosterPage";

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="page empty-state">Loading roster…</div>}>
      <StudentRosterPage />
    </Suspense>
  );
}
