import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AdvancedFilters } from "./AdvancedFilters";

describe("AdvancedFilters", () => {
  const defaultProps = {
    showFilters: false,
    onToggleFilters: vi.fn(),
    city: "",
    onCityChange: vi.fn(),
    degree: "",
    onDegreeChange: vi.fn(),
    minYears: "",
    onMinYearsChange: vi.fn(),
    sort: "years_desc",
    onSortChange: vi.fn(),
    onReset: vi.fn(),
  };

  it("should render toggle button", () => {
    render(<AdvancedFilters {...defaultProps} />);

    const button = screen.getByRole("button", { name: /advanced filters/i });
    expect(button).toBeInTheDocument();
  });

  it("should toggle filters when button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFilters = vi.fn();

    render(<AdvancedFilters {...defaultProps} onToggleFilters={onToggleFilters} />);

    const button = screen.getByRole("button", { name: /advanced filters/i });
    await user.click(button);

    expect(onToggleFilters).toHaveBeenCalledTimes(1);
  });

  it("should not show filters when showFilters is false", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={false} />);

    expect(screen.queryByLabelText(/city/i)).not.toBeInTheDocument();
  });

  it("should show filters when showFilters is true", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={true} />);

    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/degree/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experience/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  it("should display current filter values", () => {
    render(
      <AdvancedFilters
        {...defaultProps}
        showFilters={true}
        city="New York"
        degree="MD"
        minYears="10"
        sort="name_asc"
      />
    );

    expect(screen.getByLabelText(/city/i)).toHaveValue("New York");
    expect(screen.getByLabelText(/degree/i)).toHaveValue("MD");
    expect(screen.getByLabelText(/experience/i)).toHaveValue("10");
    expect(screen.getByLabelText(/sort by/i)).toHaveValue("name_asc");
  });

  it("should call onCityChange when city input changes", async () => {
    const user = userEvent.setup();
    const onCityChange = vi.fn();

    render(
      <AdvancedFilters {...defaultProps} showFilters={true} onCityChange={onCityChange} />
    );

    const cityInput = screen.getByLabelText(/city/i);
    await user.type(cityInput, "San Francisco");

    expect(onCityChange).toHaveBeenCalled();
  });

  it("should call onDegreeChange when degree select changes", async () => {
    const user = userEvent.setup();
    const onDegreeChange = vi.fn();

    render(
      <AdvancedFilters {...defaultProps} showFilters={true} onDegreeChange={onDegreeChange} />
    );

    const degreeSelect = screen.getByLabelText(/degree/i);
    await user.selectOptions(degreeSelect, "PhD");

    expect(onDegreeChange).toHaveBeenCalledWith("PhD");
  });

  it("should call onMinYearsChange when experience select changes", async () => {
    const user = userEvent.setup();
    const onMinYearsChange = vi.fn();

    render(
      <AdvancedFilters
        {...defaultProps}
        showFilters={true}
        onMinYearsChange={onMinYearsChange}
      />
    );

    const experienceSelect = screen.getByLabelText(/experience/i);
    await user.selectOptions(experienceSelect, "5");

    expect(onMinYearsChange).toHaveBeenCalledWith("5");
  });

  it("should call onSortChange when sort select changes", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <AdvancedFilters {...defaultProps} showFilters={true} onSortChange={onSortChange} />
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, "years_asc");

    expect(onSortChange).toHaveBeenCalledWith("years_asc");
  });

  it("should call onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<AdvancedFilters {...defaultProps} showFilters={true} onReset={onReset} />);

    const resetButton = screen.getByRole("button", { name: /reset filters/i });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("should have proper ARIA attributes on toggle button", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={false} />);

    const button = screen.getByRole("button", { name: /advanced filters/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "advanced-filters");
  });

  it("should update aria-expanded when filters are shown", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={true} />);

    const button = screen.getByRole("button", { name: /advanced filters/i });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should render degree options correctly", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={true} />);

    const degreeSelect = screen.getByLabelText(/degree/i);
    const options = Array.from(degreeSelect.querySelectorAll("option")).map(
      (opt) => opt.textContent
    );

    expect(options).toContain("All Degrees");
    expect(options).toContain("MD");
    expect(options).toContain("PhD");
    expect(options).toContain("MSW");
  });

  it("should render experience options correctly", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={true} />);

    const experienceSelect = screen.getByLabelText(/experience/i);
    const options = Array.from(experienceSelect.querySelectorAll("option")).map(
      (opt) => opt.textContent
    );

    expect(options).toContain("Any experience");
    expect(options).toContain("5+ years");
    expect(options).toContain("10+ years");
    expect(options).toContain("15+ years");
  });

  it("should render sort options correctly", () => {
    render(<AdvancedFilters {...defaultProps} showFilters={true} />);

    const sortSelect = screen.getByLabelText(/sort by/i);
    const options = Array.from(sortSelect.querySelectorAll("option")).map(
      (opt) => opt.textContent
    );

    expect(options).toContain("Most Experienced");
    expect(options).toContain("Least Experienced");
    expect(options).toContain("Name (A-Z)");
  });
});
