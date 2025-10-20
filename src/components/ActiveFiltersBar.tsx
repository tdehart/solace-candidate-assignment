import { SlidersHorizontal } from "lucide-react";

interface ActiveFiltersBarProps {
  summaryLabel: string;
  detailLabel: string;
  onAdjust: () => void;
  onClear: () => void;
}

export function ActiveFiltersBar({
  summaryLabel,
  detailLabel,
  onAdjust,
  onClear,
}: ActiveFiltersBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl bg-gray-900/90 px-5 py-3 text-white shadow-2xl ring-1 ring-black/10 backdrop-blur"
        role="status"
        aria-live="polite"
        aria-label={`Active filters: ${detailLabel}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Filters Applied
            </p>
            <p className="truncate text-sm font-medium">{summaryLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAdjust}
            className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Adjust
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
