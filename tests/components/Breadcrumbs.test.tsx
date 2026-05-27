import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "@/components/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders links and current page", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Students", href: "/students" },
          { label: "Alex Rivera" },
        ]}
      />
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Students" })).toHaveAttribute("href", "/students");
    expect(screen.getByText("Alex Rivera")).toHaveAttribute("aria-current", "page");
  });
});
