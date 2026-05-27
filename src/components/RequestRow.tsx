"use client";

import type { EnrichedCourseRequest, RequestType } from "@/types";

export function RequestRow({
  request,
  highlight,
  onToggleType,
  onRemove,
}: {
  request: EnrichedCourseRequest;
  highlight?: boolean;
  onToggleType: (id: string, type: RequestType) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className={`request-row ${highlight ? "highlight" : ""}`}>
      <div className="request-row-main">
        <h4>{request.courseName}</h4>
        <p className="request-row-meta">
          {request.courseCode} · {request.department}
        </p>
        {request.note && <p className="request-row-note">{request.note}</p>}
      </div>
      <div className="request-row-actions">
        <button
          type="button"
          className="btn btn-ghost request-move-type"
          onClick={() =>
            onToggleType(
              request.id,
              request.requestType === "priority" ? "elective" : "priority"
            )
          }
        >
          {request.requestType === "priority"
            ? "Move to electives"
            : "Move to priority"}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onRemove(request.id)}
          aria-label={`Remove ${request.courseName}`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
