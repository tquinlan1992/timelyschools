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
        <div className="type-toggle" role="group" aria-label="Request type">
          <button
            type="button"
            className={request.requestType === "priority" ? "active priority" : ""}
            onClick={() => onToggleType(request.id, "priority")}
            aria-pressed={request.requestType === "priority"}
          >
            P
          </button>
          <button
            type="button"
            className={request.requestType === "elective" ? "active elective" : ""}
            onClick={() => onToggleType(request.id, "elective")}
            aria-pressed={request.requestType === "elective"}
          >
            E
          </button>
        </div>
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
