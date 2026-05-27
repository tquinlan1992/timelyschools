import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttentionBanner } from "@/components/AttentionBanner";

describe("AttentionBanner", () => {
  it("renders banner for S003", () => {
    render(<AttentionBanner studentId="S003" />);
    expect(screen.getByText("Math retake required")).toBeInTheDocument();
  });

  it("renders nothing for S001", () => {
    const { container } = render(<AttentionBanner studentId="S001" />);
    expect(container).toBeEmptyDOMElement();
  });
});
