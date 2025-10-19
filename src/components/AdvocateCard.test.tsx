import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AdvocateCard } from "./AdvocateCard";
import type { Advocate } from "@/types/advocate";

describe("AdvocateCard", () => {
  const mockAdvocate: Advocate = {
    id: 1,
    firstName: "Jane",
    lastName: "Doe",
    city: "New York",
    degree: "MD",
    specialties: ["Mental Health", "Trauma"],
    yearsOfExperience: 10,
    phoneNumber: 5551234567,
  };

  it("should render advocate name and degree", () => {
    render(<AdvocateCard advocate={mockAdvocate} />);

    expect(screen.getByRole("heading", { name: /Jane Doe/i })).toBeInTheDocument();
    expect(screen.getByText("MD")).toBeInTheDocument();
  });

  it("should render years", () => {
    render(<AdvocateCard advocate={mockAdvocate} />);

    expect(screen.getByText(/10 years/i)).toBeInTheDocument();
  });

  it("should render singular year for 1 year", () => {
    const newAdvocate = { ...mockAdvocate, yearsOfExperience: 1 };
    render(<AdvocateCard advocate={newAdvocate} />);

    expect(screen.getByText(/1 year/i)).toBeInTheDocument();
  });

  it("should render city", () => {
    render(<AdvocateCard advocate={mockAdvocate} />);

    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  it("should render specialties as pills", () => {
    render(<AdvocateCard advocate={mockAdvocate} />);

    expect(screen.getByText("Mental Health")).toBeInTheDocument();
    expect(screen.getByText("Trauma")).toBeInTheDocument();
  });

  it("should limit specialties to maxSpecialties prop", () => {
    const manySpecialties = {
      ...mockAdvocate,
      specialties: ["Mental Health", "Trauma", "ADHD", "Anxiety", "Depression"],
    };
    render(<AdvocateCard advocate={manySpecialties} maxSpecialties={3} />);

    expect(screen.getByText("Mental Health")).toBeInTheDocument();
    expect(screen.getByText("Trauma")).toBeInTheDocument();
    expect(screen.getByText("ADHD")).toBeInTheDocument();
    expect(screen.queryByText("Anxiety")).not.toBeInTheDocument();
    expect(screen.queryByText("Depression")).not.toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("should show +X more indicator when specialties exceed limit", () => {
    const manySpecialties = {
      ...mockAdvocate,
      specialties: ["Mental Health", "Trauma", "ADHD", "Anxiety"],
    };
    render(<AdvocateCard advocate={manySpecialties} maxSpecialties={2} />);

    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("should not show +X more when specialties are within limit", () => {
    const fewSpecialties = {
      ...mockAdvocate,
      specialties: ["Mental Health", "Trauma"],
    };
    render(<AdvocateCard advocate={fewSpecialties} maxSpecialties={3} />);

    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it("should render Get Matched link with tel href", () => {
    render(<AdvocateCard advocate={mockAdvocate} />);

    const link = screen.getByRole("link", { name: /call jane doe/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "tel:5551234567");
  });

  it("should log when Get Matched link is clicked", () => {
    const consoleSpy = vi.spyOn(console, "log");
    render(<AdvocateCard advocate={mockAdvocate} />);

    const link = screen.getByRole("link", { name: /call jane doe/i });
    link.click();

    expect(consoleSpy).toHaveBeenCalledWith("Get Matched clicked:", 1, 5551234567);
    consoleSpy.mockRestore();
  });

  it("should not render specialties section if empty", () => {
    const noSpecialties = { ...mockAdvocate, specialties: [] };
    render(<AdvocateCard advocate={noSpecialties} />);

    expect(screen.queryByText("Specialties:")).not.toBeInTheDocument();
  });

  it("should have proper ARIA label", () => {
    render(<AdvocateCard advocate={mockAdvocate} />);

    const article = screen.getByLabelText(/advocate: jane doe/i);
    expect(article).toBeInTheDocument();
  });

  it("should show popover when +X more button is clicked", async () => {
    const user = userEvent.setup();
    const manySpecialties = {
      ...mockAdvocate,
      specialties: ["Mental Health", "Trauma", "ADHD", "Anxiety"],
    };
    render(<AdvocateCard advocate={manySpecialties} maxSpecialties={2} />);

    const moreButton = screen.getByRole("button", { name: /show 2 more/i });
    await user.click(moreButton);

    expect(screen.getByRole("dialog", { name: /additional specialties/i })).toBeInTheDocument();
    expect(screen.getByText("All Specialties")).toBeInTheDocument();
    expect(screen.getByText("ADHD")).toBeInTheDocument();
    expect(screen.getByText("Anxiety")).toBeInTheDocument();
  });

  it("should close popover when X button is clicked", async () => {
    const user = userEvent.setup();
    const manySpecialties = {
      ...mockAdvocate,
      specialties: ["Mental Health", "Trauma", "ADHD", "Anxiety"],
    };
    render(<AdvocateCard advocate={manySpecialties} maxSpecialties={2} />);

    // Open popover
    const moreButton = screen.getByRole("button", { name: /show 2 more/i });
    await user.click(moreButton);

    // Close popover
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close popover when clicking outside", async () => {
    const user = userEvent.setup();
    const manySpecialties = {
      ...mockAdvocate,
      specialties: ["Mental Health", "Trauma", "ADHD", "Anxiety"],
    };
    render(<AdvocateCard advocate={manySpecialties} maxSpecialties={2} />);

    // Open popover
    const moreButton = screen.getByRole("button", { name: /show 2 more/i });
    await user.click(moreButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Click outside (on the document body)
    await user.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
