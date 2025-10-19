import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAdvocates } from "./useAdvocates";

// Mock SWR
vi.mock("swr", () => ({
  default: vi.fn(),
}));

import useSWR from "swr";

const mockUseSWR = useSWR as unknown as ReturnType<typeof vi.fn>;

describe("useAdvocates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should build correct URL with no parameters", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() => useAdvocates({}));

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/advocates",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should build correct URL with search query", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() => useAdvocates({ q: "mental health" }));

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/advocates?q=mental+health",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should build correct URL with multiple filters", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() =>
      useAdvocates({
        q: "anxiety",
        city: "New York",
        degree: "MD",
        minYears: "10",
        sort: "years_desc",
      })
    );

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/advocates?q=anxiety&city=New+York&degree=MD&minYears=10&sort=years_desc",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should include cursor in URL when provided", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() => useAdvocates({ cursor: "abc123" }));

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/advocates?cursor=abc123",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should include limit in URL when provided", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() => useAdvocates({ limit: 50 }));

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/advocates?limit=50",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should return empty data array when SWR data is undefined", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useAdvocates({}));

    expect(result.current.data).toEqual([]);
    expect(result.current.pageInfo).toEqual({
      nextCursor: null,
      hasNext: false,
    });
  });

  it("should return advocates data when SWR succeeds", () => {
    const mockApiData = {
      data: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          city: "New York",
          degree: "MD",
          specialties: ["Mental Health"],
          yearsOfExperience: 10,
          phoneNumber: 5551234567,
        },
      ],
      pageInfo: {
        nextCursor: "cursor123",
        hasNext: true, // API returns hasNext
      },
    };

    mockUseSWR.mockReturnValue({
      data: mockApiData,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useAdvocates({}));

    expect(result.current.data).toEqual(mockApiData.data);
    expect(result.current.pageInfo).toEqual({
      nextCursor: "cursor123",
      hasNext: true,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("should return error when SWR fails", () => {
    const mockError = new Error("Failed to fetch");

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useAdvocates({}));

    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it("should pass correct SWR options", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() => useAdvocates({}));

    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 5000,
      }
    );
  });

  it("should expose mutate function", () => {
    const mockMutate = vi.fn();

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useAdvocates({}));

    expect(result.current.mutate).toBe(mockMutate);
  });

  it("should skip empty parameters in URL", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    renderHook(() =>
      useAdvocates({
        q: "",
        city: undefined,
        degree: "",
      })
    );

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/advocates",
      expect.any(Function),
      expect.any(Object)
    );
  });
});
