import Link from "next/link";
import { StatusChip } from "@/components/StatusChip";
import type { StudentWithRequests } from "@/types";

export function StudentRow({
  student,
  selected,
  index,
}: {
  student: StudentWithRequests;
  selected: boolean;
  index: number;
}) {
  const { requestCounts } = student;
  const countsLabel =
    requestCounts.total === 0
      ? "No requests"
      : `${requestCounts.priority}P · ${requestCounts.elective}E`;

  return (
    <li style={{ animationDelay: `${index * 40}ms` }}>
      <Link
        href={`/students/${student.id}`}
        className={`student-row ${selected ? "selected" : ""} ${student.needsAttention ? "needs-attention" : ""}`}
      >
        <div className="student-row-header">
          <span className="student-row-name">{student.name}</span>
          <span className="student-row-grade">Grade {student.grade}</span>
        </div>
        <p className="student-row-profile">{student.profile}</p>
        <div className="student-row-meta">
          {student.flags.map((flag) => (
            <StatusChip key={flag} flag={flag} />
          ))}
          <span className="request-counts">{countsLabel}</span>
        </div>
      </Link>
    </li>
  );
}
