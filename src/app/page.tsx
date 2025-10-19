"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Advocate } from "@/types/advocate";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdvocates } from "@/hooks/useAdvocates";
import { SearchBar } from "@/components/SearchBar";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { AdvocateGrid } from "@/components/AdvocateGrid";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [degree, setDegree] = useState(searchParams.get("degree") || "");
  const [minYears, setMinYears] = useState(searchParams.get("minExp") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "years_desc");

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Pagination state - track accumulated advocates for "Load More"
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch initial page with SWR (caching, deduplication)
  const { data, pageInfo, isLoading, error } = useAdvocates({
    q: debouncedSearch,
    city,
    degree,
    minYears,
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
    if (minYears) params.set("minExp", minYears);
    if (sort) params.set("sort", sort);

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/", { scroll: false });

    // Reset pagination when filters change
    setCurrentCursor(undefined);
  }, [debouncedSearch, city, degree, minYears, sort, router]);

  // Update advocates when data changes
  useEffect(() => {
    if (isLoading) return;

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
      setLoadingMore(false);
    } else if (!currentCursor) {
      // Initial load or filter change - replace data
      setAllAdvocates(data);
    }

    // Update hasNextPage whenever we get new pageInfo
    setHasNextPage(pageInfo.hasNext);
  }, [data, isLoading, currentCursor, pageInfo.hasNext]);

  // Handle Load More - smoothly append without full page refresh
  const handleLoadMore = () => {
    if (!pageInfo.nextCursor || loadingMore) return;

    // Just update the cursor - SWR will handle the fetch
    // and the effect will append the new data
    setLoadingMore(true);
    setCurrentCursor(pageInfo.nextCursor);
  };

  // Reset all filters
  const handleReset = () => {
    setSearchQuery("");
    setCity("");
    setDegree("");
    setMinYears("");
    setSort("years_desc");
    // Don't clear allAdvocates or currentCursor here - let the effects handle it
  };

  // Retry on error
  const handleRetry = () => {
    setCurrentCursor(undefined);
    setAllAdvocates([]);
  };

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
          minYears={minYears}
          onMinYearsChange={setMinYears}
          sort={sort}
          onSortChange={setSort}
          onReset={handleReset}
        />

        {/* Advocate Grid */}
        <AdvocateGrid
          advocates={allAdvocates}
          loading={isLoading}
          loadingMore={loadingMore}
          error={error?.message || null}
          hasNextPage={hasNextPage}
          advocatesCount={allAdvocates.length}
          onLoadMore={handleLoadMore}
          onReset={handleReset}
          onRetry={handleRetry}
        />
      </div>
    </main>
  );
}
