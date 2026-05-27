import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RequestRow } from "@/components/RequestRow";
import type { EnrichedCourseRequest } from "@/types";

const request: EnrichedCourseRequest = {
  id: "req-1",
  studentId: "S001",
  courseCode: "MTH101",
  requestType: "priority",
  schoolYear: "2026-2027",
  courseName: "Algebra I",
  department: "Math",
};

describe("RequestRow", () => {
  it("renders course details", () => {
    render(
      <RequestRow
        request={request}
        onToggleType={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("Algebra I")).toBeInTheDocument();
    expect(screen.getByText(/MTH101/)).toBeInTheDocument();
  });

  it("calls onToggleType when E is clicked", async () => {
    const user = userEvent.setup();
    const onToggleType = vi.fn();
    render(
      <RequestRow request={request} onToggleType={onToggleType} onRemove={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: "E" }));
    expect(onToggleType).toHaveBeenCalledWith("req-1", "elective");
  });

  it("calls onRemove when Remove is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <RequestRow request={request} onToggleType={vi.fn()} onRemove={onRemove} />
    );
    await user.click(screen.getByRole("button", { name: /Remove Algebra I/i }));
    expect(onRemove).toHaveBeenCalledWith("req-1");
  });
});
