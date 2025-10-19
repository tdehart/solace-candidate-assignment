import { SlidersHorizontal, ChevronDown, ChevronUp, MapPin, GraduationCap, Award } from "lucide-react";

interface AdvancedFiltersProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  city: string;
  onCityChange: (city: string) => void;
  degree: string;
  onDegreeChange: (degree: string) => void;
  minYears: string;
  onMinYearsChange: (minYears: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export function AdvancedFilters({
  showFilters,
  onToggleFilters,
  city,
  onCityChange,
  degree,
  onDegreeChange,
  minYears,
  onMinYearsChange,
  sort,
  onSortChange,
  onReset,
}: AdvancedFiltersProps) {
  return (
    <>
      {/* Advanced Filters Toggle */}
      <div className="mb-4">
        <button
          onClick={onToggleFilters}
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
                onChange={(e) => onCityChange(e.target.value)}
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
                onChange={(e) => onDegreeChange(e.target.value)}
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
                onChange={(e) => onMinYearsChange(e.target.value)}
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
                onChange={(e) => onSortChange(e.target.value)}
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
              onClick={onReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset Filters
            </button>
          </div>
        </section>
      )}
    </>
  );
}
