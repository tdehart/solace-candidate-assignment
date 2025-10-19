export function AdvocateCardSkeleton() {
  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading advocate information"
    >
      {/* Header skeleton */}
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Location skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>

      {/* Specialties skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>

      {/* Button skeleton */}
      <div className="mt-6">
        <div className="h-12 bg-gray-200 rounded-md w-full"></div>
      </div>
    </div>
  );
}
