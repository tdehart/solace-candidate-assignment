"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Advocate } from "@/types/advocate";
import { AdvocateCard } from "@/components/AdvocateCard";
import { AdvocateCardSkeleton } from "@/components/AdvocateCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, MapPin, GraduationCap, Award } from "lucide-react";

interface PageInfo {
  nextCursor: string | null;
  hasNext: boolean;
}

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

  // Data state
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ nextCursor: null, hasNext: false });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build query string from filters
  const buildQueryString = useCallback((cursor?: string | null) => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("q", debouncedSearch);
    if (city) params.set("city", city);
    if (degree) params.set("degree", degree);
    if (minYears) params.set("minExp", minYears);
    if (sort) params.set("sort", sort);
    if (cursor) params.set("cursor", cursor);
    params.set("limit", "20");

    return params.toString();
  }, [debouncedSearch, city, degree, minYears, sort]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (city) params.set("city", city);
    if (degree) params.set("degree", degree);
    if (minYears) params.set("minExp", minYears);
    if (sort) params.set("sort", sort);

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/", { scroll: false });
  }, [debouncedSearch, city, degree, minYears, sort, router]);

  // Fetch advocates
  const fetchAdvocates = useCallback(async (cursor?: string | null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const queryString = buildQueryString(cursor);
      const response = await fetch(`/api/advocates?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch advocates: ${response.statusText}`);
      }

      const jsonResponse = await response.json();

      if (append) {
        setAdvocates((prev) => [...prev, ...jsonResponse.data]);
      } else {
        setAdvocates(jsonResponse.data);
      }

      setPageInfo(jsonResponse.pageInfo);
    } catch (err) {
      console.error("Error fetching advocates:", err);
      setError(err instanceof Error ? err.message : "Failed to load advocates");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryString]);

  // Fetch on filter change
  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  // Handle Load More
  const handleLoadMore = () => {
    if (pageInfo.nextCursor && !loadingMore) {
      fetchAdvocates(pageInfo.nextCursor, true);
    }
  };

  // Reset all filters
  const handleReset = () => {
    setSearchQuery("");
    setCity("");
    setDegree("");
    setMinYears("");
    setSort("years_desc");
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

        {/* Prominent Search */}
        <section
          className="bg-white rounded-lg shadow-md p-6 mb-4"
          role="search"
          aria-label="Search advocates"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, or specialty..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              aria-label="Search advocates by name, city, or specialty"
            />
          </div>
        </section>

        {/* Advanced Filters Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2"
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <section
            id="advanced-filters"
            className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., New York"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Degree */}
              <div>
                <label
                  htmlFor="degree"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  Degree
                </label>
                <select
                  id="degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">All Degrees</option>
                  <option value="MD">MD</option>
                  <option value="PhD">PhD</option>
                  <option value="MSW">MSW</option>
                </select>
              </div>

              {/* Experience Range */}
              <div>
                <label
                  htmlFor="minYears"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  Experience
                </label>
                <select
                  id="minYears"
                  value={minYears}
                  onChange={(e) => setMinYears(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Any experience</option>
                  <option value="5">5+ years</option>
                  <option value="10">10+ years</option>
                  <option value="15">15+ years</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="years_desc">Most Experienced</option>
                  <option value="years_asc">Least Experienced</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reset Filters
              </button>
            </div>
          </section>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-gray-600" role="status" aria-live="polite">
            {advocates.length} {advocates.length === 1 ? 'advocate' : 'advocates'} found
            {pageInfo.hasNext && ' (showing first results)'}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="status"
            aria-label="Loading advocates"
          >
            {[...Array(6)].map((_, i) => (
              <AdvocateCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
            role="alert"
          >
            <p className="text-red-800 font-medium mb-2">Error loading advocates</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAdvocates()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && advocates.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No advocates found matching your criteria
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Advocate Cards */}
        {!loading && !error && advocates.length > 0 && (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="Advocates"
            >
              {advocates.map((advocate) => (
                <AdvocateCard key={advocate.id} advocate={advocate} />
              ))}
            </div>

            {/* Load More Button */}
            {pageInfo.hasNext && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  aria-label="Load more advocates"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
