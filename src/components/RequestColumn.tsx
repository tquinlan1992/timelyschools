"use client";

import { EmptyState } from "@/components/EmptyState";
import { RequestRow } from "@/components/RequestRow";
import type { EnrichedCourseRequest, RequestType } from "@/types";

export function RequestColumn({
  title,
  variant,
  requests,
  highlightId,
  onToggleType,
  onRemove,
}: {
  title: string;
  variant: "priority" | "elective";
  requests: EnrichedCourseRequest[];
  highlightId?: string;
  onToggleType: (id: string, type: RequestType) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className={`request-column ${variant}`}>
      <h3>{title}</h3>
      {requests.length === 0 ? (
        <EmptyState
          message={
            variant === "priority"
              ? "No priority requests yet."
              : "No elective requests yet."
          }
        />
      ) : (
        <ul className="request-list">
          {requests.map((r) => (
            <RequestRow
              key={r.id}
              request={r}
              highlight={r.id === highlightId}
              onToggleType={onToggleType}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
