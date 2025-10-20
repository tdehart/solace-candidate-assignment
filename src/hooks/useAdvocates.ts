import useSWR from "swr";
import type { Advocate } from "@/types/advocate";

export interface AdvocatesParams {
  q?: string;
  city?: string;
  degree?: string;
  minExp?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
}

export interface AdvocatesResponse {
  data: Advocate[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
  };
}

/**
 * Fetcher function for SWR
 */
async function fetchAdvocates(
  url: string
): Promise<AdvocatesResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch advocates");
  }
  return response.json();
}

/**
 * Custom hook for fetching advocates with SWR
 * Provides automatic caching, deduplication, and revalidation
 */
export function useAdvocates(params: AdvocatesParams) {
  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.set("q", params.q);
  if (params.city) queryParams.set("city", params.city);
  if (params.degree) queryParams.set("degree", params.degree);
  if (params.minExp) queryParams.set("minExp", params.minExp);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.cursor) queryParams.set("cursor", params.cursor);
  if (params.limit) queryParams.set("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/api/advocates?${queryString}` : "/api/advocates";

  // Use SWR for data fetching with caching
  const { data, error, isLoading, mutate } = useSWR<AdvocatesResponse>(
    url,
    fetchAdvocates,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    data: data?.data || [],
    pageInfo: data?.pageInfo || { nextCursor: null, hasNext: false },
    isLoading,
    error,
    mutate, // Expose mutate for manual revalidation if needed
  };
}
