"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Advocate } from "@/types/advocate";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdvocates } from "@/hooks/useAdvocates";
import { SearchBar } from "@/components/SearchBar";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { AdvocateGrid } from "@/components/AdvocateGrid";
import { ActiveFiltersBar } from "@/components/ActiveFiltersBar";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [degree, setDegree] = useState(searchParams.get("degree") || "");
  const [minExp, setMinExp] = useState(searchParams.get("minExp") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "years_desc");

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Pagination state - track accumulated advocates for "Load More"
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);

  // Fetch initial page with SWR (caching, deduplication)
  const { data, pageInfo, isLoading, isValidating, error } = useAdvocates({
    q: debouncedSearch,
    city,
    degree,
    minExp,
    sort,
    cursor: currentCursor,
    limit: 20,
  });

  // Update URL when filters change and reset pagination
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (city) params.set("city", city);
    if (degree) params.set("degree", degree);
    if (minExp) params.set("minExp", minExp);
    if (sort) params.set("sort", sort);

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/", { scroll: false });

    // Reset pagination when filters change
    setCurrentCursor(undefined);
  }, [debouncedSearch, city, degree, minExp, sort, router]);

  // Update advocates when data changes
  useEffect(() => {
    if (isLoading && !currentCursor) return;

    if (currentCursor && data.length > 0) {
      // We're loading more - append new data only if we got results
      setAllAdvocates((prev) => {
        // Prevent duplicates by checking if first item already exists
        const firstNewId = data[0]?.id;
        if (firstNewId && prev.some(a => a.id === firstNewId)) {
          return prev;
        }
        return [...prev, ...data];
      });
    } else if (!currentCursor) {
      // Initial load or filter change - replace data
      setAllAdvocates(data);
    }
  }, [data, isLoading, currentCursor]);

  const isLoadingMore = Boolean(currentCursor) && isValidating;

  // Handle Load More - smoothly append without full page refresh
  const handleLoadMore = () => {
    if (!pageInfo.nextCursor || isLoadingMore) return;

    // Just update the cursor - SWR will handle the fetch
    // and the effect will append the new data
    setCurrentCursor(pageInfo.nextCursor);
  };

  // Reset all filters
  const handleReset = () => {
    setSearchQuery("");
    setCity("");
    setDegree("");
    setMinExp("");
    setSort("years_desc");
    // Don't clear allAdvocates or currentCursor here - let the effects handle it
  };

  // Retry on error
  const handleRetry = () => {
    setCurrentCursor(undefined);
    setAllAdvocates([]);
  };

  const hasActiveFilters =
    Boolean(searchQuery || city || degree || minExp) || sort !== "years_desc";

  const { summaryLabel, detailLabel } = useMemo(() => {
    if (!hasActiveFilters) {
      return { summaryLabel: "", detailLabel: "" };
    }

    const parts: string[] = [];

    if (searchQuery) parts.push(`Search: “${searchQuery}”`);
    if (city) parts.push(`City: ${city}`);
    if (degree) parts.push(`Degree: ${degree}`);
    if (minExp) parts.push(`${minExp}+ years experience`);

    if (sort !== "years_desc") {
      const sortMap: Record<string, string> = {
        years_desc: "Most experienced",
        years_asc: "Least experienced",
        name_asc: "Name A→Z",
      };
      parts.push(`Sort: ${sortMap[sort] ?? sort}`);
    }

    const visibleSummary = parts.slice(0, 2).join(" • ");
    const remainingCount = Math.max(parts.length - 2, 0);
    const summaryLabel =
      parts.length <= 2
        ? visibleSummary
        : `${visibleSummary} • +${remainingCount} more`;

    return {
      summaryLabel,
      detailLabel: parts.join(" • "),
    };
  }, [hasActiveFilters, searchQuery, city, degree, minExp, sort]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Health Advocate
          </h1>
          <p className="text-lg text-gray-600">
            Connect with experienced advocates who can help navigate your healthcare journey
          </p>
        </header>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Advanced Filters */}
        <AdvancedFilters
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          city={city}
          onCityChange={setCity}
          degree={degree}
          onDegreeChange={setDegree}
          minExp={minExp}
          onMinExpChange={setMinExp}
          sort={sort}
          onSortChange={setSort}
          onReset={handleReset}
        />

        {/* Advocate Grid */}
        <AdvocateGrid
          advocates={allAdvocates}
          loading={isLoading}
          loadingMore={isLoadingMore}
          error={error?.message || null}
          hasNextPage={pageInfo.hasNext || isLoadingMore}
          advocatesCount={allAdvocates.length}
          onLoadMore={handleLoadMore}
          onReset={handleReset}
          onRetry={handleRetry}
        />
      </div>

      {hasActiveFilters && (
        <ActiveFiltersBar
          summaryLabel={summaryLabel}
          detailLabel={detailLabel}
          onAdjust={() => setShowFilters(true)}
          onClear={handleReset}
        />
      )}
    </main>
  );
}
