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

const DEFAULT_PAGE_INFO = { nextCursor: null, hasNext: false } as const;
const SWR_OPTIONS = { dedupingInterval: 5_000 };

function buildQueryString(params: AdvocatesParams): string {
  const query = new URLSearchParams();

  const setParam = (key: string, value?: string | number) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  };

  setParam("q", params.q);
  setParam("city", params.city);
  setParam("degree", params.degree);
  setParam("minExp", params.minExp);
  setParam("sort", params.sort);
  setParam("cursor", params.cursor);
  setParam("limit", params.limit);

  return query.toString();
}

async function fetchAdvocates(url: string): Promise<AdvocatesResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch advocates");
  }

  return response.json();
}

export function useAdvocates(params: AdvocatesParams) {
  const queryString = buildQueryString(params);
  const key = queryString ? `/api/advocates?${queryString}` : "/api/advocates";

  const { data, error, isLoading, mutate } = useSWR<AdvocatesResponse>(
    key,
    fetchAdvocates,
    SWR_OPTIONS
  );

  return {
    data: data?.data ?? [],
    pageInfo: data?.pageInfo ?? DEFAULT_PAGE_INFO,
    isLoading,
    error,
    mutate,
  };
}
