import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("should render search input", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByRole("textbox", {
      name: /search advocates by name, city, or specialty/i,
    });
    expect(input).toBeInTheDocument();
  });

  it("should display the current value", () => {
    render(<SearchBar value="test query" onChange={() => {}} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test query");
  });

  it("should call onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "a");

    // onChange should be called when user types
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("should have proper accessibility attributes", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const section = screen.getByRole("search", { name: /search advocates/i });
    expect(section).toBeInTheDocument();

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "search");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Search by name, city, or specialty...");
  });

  it("should display search icon", () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} />);

    // Search icon is an SVG element from lucide-react
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
