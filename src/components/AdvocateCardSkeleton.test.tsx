import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdvocateCardSkeleton } from "./AdvocateCardSkeleton";

describe("AdvocateCardSkeleton", () => {
  it("should render loading skeleton", () => {
    render(<AdvocateCardSkeleton />);

    const skeleton = screen.getByLabelText(/loading advocate information/i);
    expect(skeleton).toBeInTheDocument();
  });

  it("should have aria-busy attribute", () => {
    render(<AdvocateCardSkeleton />);

    const skeleton = screen.getByLabelText(/loading advocate information/i);
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("should have animate-pulse class for animation", () => {
    render(<AdvocateCardSkeleton />);

    const skeleton = screen.getByLabelText(/loading advocate information/i);
    expect(skeleton).toHaveClass("animate-pulse");
  });
});
