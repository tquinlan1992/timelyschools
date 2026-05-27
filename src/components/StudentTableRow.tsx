"use client";

import { useRouter } from "next/navigation";
import { StatusChip } from "@/components/StatusChip";
import type { StudentWithRequests } from "@/types";

export function StudentTableRow({
  student,
  index,
}: {
  student: StudentWithRequests;
  index: number;
}) {
  const router = useRouter();
  const href = `/students/${student.id}`;
  const { requestCounts } = student;
  const countsLabel =
    requestCounts.total === 0
      ? "No requests"
      : `${requestCounts.priority} priority · ${requestCounts.elective} elective`;

  const openStudent = () => router.push(href);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openStudent();
    }
  };

  return (
    <tr
      className={`roster-table-row ${student.needsAttention ? "needs-attention" : ""}`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={openStudent}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`View ${student.name}`}
    >
      <td>
        <span className="roster-table-name">{student.name}</span>
        <span className="roster-table-id">{student.id}</span>
      </td>
      <td>
        <span className="roster-table-grade">{student.grade}</span>
      </td>
      <td>
        <p className="roster-table-profile">{student.profile}</p>
      </td>
      <td>
        <div className="roster-table-chips">
          {student.flags.length === 0 ? (
            <span className="roster-table-muted">—</span>
          ) : (
            student.flags.map((flag) => <StatusChip key={flag} flag={flag} />)
          )}
        </div>
      </td>
      <td>
        <span className="request-counts">{countsLabel}</span>
      </td>
      <td>
        <span className="table-action-link" aria-hidden="true">
          Review →
        </span>
      </td>
    </tr>
  );
}
