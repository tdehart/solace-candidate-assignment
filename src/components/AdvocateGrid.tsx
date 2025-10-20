import type { Advocate } from "@/types/advocate";
import { AdvocateCard } from "./AdvocateCard";
import { AdvocateCardSkeleton } from "./AdvocateCardSkeleton";

interface AdvocateGridProps {
  advocates: Advocate[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasNextPage: boolean;
  advocatesCount: number;
  onLoadMore: () => void;
  onReset: () => void;
  onRetry: () => void;
}

export function AdvocateGrid({
  advocates,
  loading,
  loadingMore,
  error,
  hasNextPage,
  advocatesCount,
  onLoadMore,
  onReset,
  onRetry,
}: AdvocateGridProps) {
  // Loading State - only show skeletons on initial load (no advocates yet)
  if (loading && advocates.length === 0) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
        aria-label="Loading advocates"
      >
        {[...Array(6)].map((_, i) => (
          <AdvocateCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
        role="alert"
      >
        <p className="text-red-800 font-medium mb-2">Error loading advocates</p>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty State
  if (advocates.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg mb-4">
          No advocates found matching your criteria
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // Advocates Grid
  return (
    <>
      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600" role="status" aria-live="polite">
        {advocatesCount} {advocatesCount === 1 ? 'advocate' : 'advocates'} found
        {hasNextPage && ' (showing first results)'}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label="Advocates"
      >
        {advocates.map((advocate) => (
          <AdvocateCard key={advocate.id} advocate={advocate} />
        ))}
      </div>

      {/* Load More Button - fixed height to prevent layout shift */}
      <div className="mt-8 text-center" style={{ minHeight: '60px' }}>
        {hasNextPage && (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Load more advocates"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </>
  );
}
