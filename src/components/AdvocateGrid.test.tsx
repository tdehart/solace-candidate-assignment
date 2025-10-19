import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AdvocateGrid } from "./AdvocateGrid";
import type { Advocate } from "@/types/advocate";

const mockAdvocates: Advocate[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    city: "New York",
    degree: "MD",
    specialties: ["Mental Health", "Trauma"],
    yearsOfExperience: 10,
    phoneNumber: 5551234567,
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    city: "Los Angeles",
    degree: "PhD",
    specialties: ["Anxiety", "Depression"],
    yearsOfExperience: 8,
    phoneNumber: 5559876543,
  },
];

describe("AdvocateGrid", () => {
  const defaultProps = {
    advocates: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasNextPage: false,
    advocatesCount: 0,
    onLoadMore: vi.fn(),
    onReset: vi.fn(),
    onRetry: vi.fn(),
  };

  describe("Loading State", () => {
    it("should show skeleton loaders when loading", () => {
      render(<AdvocateGrid {...defaultProps} loading={true} />);

      const loadingStatus = screen.getByRole("status", {
        name: /loading advocates/i,
      });
      expect(loadingStatus).toBeInTheDocument();
    });

    it("should show multiple skeleton cards", () => {
      render(<AdvocateGrid {...defaultProps} loading={true} />);

      // Should render 6 skeleton cards
      const skeletons = screen.getAllByLabelText(/loading advocate information/i);
      expect(skeletons).toHaveLength(6);
    });
  });

  describe("Error State", () => {
    it("should show error message when there is an error", () => {
      render(
        <AdvocateGrid {...defaultProps} error="Failed to load advocates" />
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(screen.getByText(/error loading advocates/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load advocates/i)).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <AdvocateGrid
          {...defaultProps}
          error="Failed to load advocates"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no advocates found", () => {
      render(<AdvocateGrid {...defaultProps} advocates={[]} />);

      expect(
        screen.getByText(/no advocates found matching your criteria/i)
      ).toBeInTheDocument();
    });

    it("should call onReset when clear filters button is clicked", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();

      render(<AdvocateGrid {...defaultProps} advocates={[]} onReset={onReset} />);

      const clearButton = screen.getByRole("button", { name: /clear filters/i });
      await user.click(clearButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Advocates Grid", () => {
    it("should render advocates in a grid", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
        />
      );

      const list = screen.getByRole("list", { name: /advocates/i });
      expect(list).toBeInTheDocument();
    });

    it("should display results count", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
        />
      );

      expect(screen.getByText(/2 advocates found/i)).toBeInTheDocument();
    });

    it("should show singular form for 1 advocate", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={[mockAdvocates[0]]}
          advocatesCount={1}
        />
      );

      expect(screen.getByText(/1 advocate found/i)).toBeInTheDocument();
    });

    it("should indicate when showing first results", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
          hasNextPage={true}
        />
      );

      expect(
        screen.getByText(/2 advocates found \(showing first results\)/i)
      ).toBeInTheDocument();
    });

    it("should render advocate cards for each advocate", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
        />
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  describe("Load More Button", () => {
    it("should show load more button when hasNextPage is true", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
          hasNextPage={true}
        />
      );

      const loadMoreButton = screen.getByRole("button", {
        name: /load more advocates/i,
      });
      expect(loadMoreButton).toBeInTheDocument();
    });

    it("should not show load more button when hasNextPage is false", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
          hasNextPage={false}
        />
      );

      const loadMoreButton = screen.queryByRole("button", {
        name: /load more advocates/i,
      });
      expect(loadMoreButton).not.toBeInTheDocument();
    });

    it("should call onLoadMore when load more button is clicked", async () => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();

      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
          hasNextPage={true}
          onLoadMore={onLoadMore}
        />
      );

      const loadMoreButton = screen.getByRole("button", {
        name: /load more advocates/i,
      });
      await user.click(loadMoreButton);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("should disable load more button when loadingMore is true", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
          hasNextPage={true}
          loadingMore={true}
        />
      );

      const loadMoreButton = screen.getByRole("button", {
        name: /load more advocates/i,
      });
      expect(loadMoreButton).toBeDisabled();
    });

    it("should show loading text when loadingMore is true", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
          hasNextPage={true}
          loadingMore={true}
        />
      );

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on results count", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
        />
      );

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper role on advocates list", () => {
      render(
        <AdvocateGrid
          {...defaultProps}
          advocates={mockAdvocates}
          advocatesCount={2}
        />
      );

      const list = screen.getByRole("list", { name: /advocates/i });
      expect(list).toHaveAttribute("aria-label", "Advocates");
    });
  });
});
