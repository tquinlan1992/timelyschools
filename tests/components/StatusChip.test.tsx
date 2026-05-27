import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusChip } from "@/components/StatusChip";

describe("StatusChip", () => {
  it("renders flag label from constants", () => {
    render(<StatusChip flag="ell" />);
    expect(screen.getByText("ELL")).toBeInTheDocument();
  });

  it("renders retake label", () => {
    render(<StatusChip flag="retake" />);
    expect(screen.getByText("Retake")).toBeInTheDocument();
  });
});
