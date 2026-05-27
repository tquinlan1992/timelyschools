import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttentionBanner } from "@/components/AttentionBanner";

describe("AttentionBanner", () => {
  it("renders retake banner when flag is present", () => {
    render(<AttentionBanner flags={["retake"]} />);
    expect(screen.getByText("Math retake required")).toBeInTheDocument();
  });

  it("renders all four assignment edge-case banners", () => {
    render(<AttentionBanner flags={["ell", "retake", "ap_heavy", "transfer"]} />);
    expect(screen.getByText("English Language Learner")).toBeInTheDocument();
    expect(screen.getByText("Math retake required")).toBeInTheDocument();
    expect(screen.getByText("Heavy AP schedule")).toBeInTheDocument();
    expect(screen.getByText("Mid-year transfer")).toBeInTheDocument();
  });

  it("renders nothing when no banner flags", () => {
    const { container } = render(<AttentionBanner flags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
