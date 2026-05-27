import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestColumn } from "@/components/RequestColumn";
import type { EnrichedCourseRequest } from "@/types";

const requests: EnrichedCourseRequest[] = [
  {
    id: "req-1",
    studentId: "S001",
    courseCode: "MTH101",
    requestType: "priority",
    schoolYear: "2026-2027",
    courseName: "Algebra I",
    department: "Math",
  },
];

describe("RequestColumn", () => {
  it("shows empty state when no requests", () => {
    render(
      <RequestColumn
        title="Priority requests"
        variant="priority"
        requests={[]}
        onToggleType={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("No priority requests yet.")).toBeInTheDocument();
  });

  it("renders request list", () => {
    render(
      <RequestColumn
        title="Priority requests"
        variant="priority"
        requests={requests}
        onToggleType={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("Algebra I")).toBeInTheDocument();
  });
});
