import { useState, useRef, useEffect } from "react";
import type { Advocate } from "@/types/advocate";
import { MapPin, Award, Stethoscope, GraduationCap, X } from "lucide-react";

interface AdvocateCardProps {
  advocate: Advocate;
  maxSpecialties?: number;
}

export function AdvocateCard({ advocate, maxSpecialties = 3 }: AdvocateCardProps) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const visibleSpecialties = advocate.specialties?.slice(0, maxSpecialties) || [];
  const remainingSpecialties = advocate.specialties?.slice(maxSpecialties) || [];
  const remainingCount = remainingSpecialties.length;

  // Close popover when clicking outside
  useEffect(() => {
    if (!showPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  return (
    <article
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col"
      aria-label={`Advocate: ${advocate.firstName} ${advocate.lastName}`}
    >
      {/* Header: Name and Degree */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          {advocate.firstName} {advocate.lastName}
          <span className="inline-flex items-center gap-1 text-base text-gray-600 font-normal">
            <GraduationCap className="w-4 h-4" />
            {advocate.degree}
          </span>
        </h2>
        <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
          <Award className="w-4 h-4" />
          {advocate.yearsOfExperience} {advocate.yearsOfExperience === 1 ? 'year' : 'years'}
        </p>
      </div>

      {/* Location */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-500" />
          {advocate.city}
        </p>
      </div>

      {/* Specialties - Fixed min-height for consistent layout */}
      <div className="mb-4 min-h-[80px] flex flex-col">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-gray-500" />
          Specialties
        </p>
        {advocate.specialties && advocate.specialties.length > 0 ? (
          <div className="flex flex-wrap gap-2 relative" role="list">
            {visibleSpecialties.map((specialty, index) => (
              <span
                key={index}
                role="listitem"
                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
            {remainingCount > 0 && (
              <>
                <button
                  ref={buttonRef}
                  onClick={() => setShowPopover(!showPopover)}
                  className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
                  aria-label={`Show ${remainingCount} more ${remainingCount === 1 ? 'specialty' : 'specialties'}`}
                  aria-expanded={showPopover}
                >
                  +{remainingCount} more
                </button>

                {/* Popover */}
                {showPopover && (
                  <div
                    ref={popoverRef}
                    className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] max-w-[300px]"
                    style={{ top: '100%', left: 0 }}
                    role="dialog"
                    aria-label="Additional specialties"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">All Specialties</h3>
                      <button
                        onClick={() => setShowPopover(false)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {advocate.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No specialties listed</p>
        )}
      </div>

      {/* Get Matched Button - mt-auto pushes to bottom */}
      <div className="mt-auto">
        <a
          href={`tel:${advocate.phoneNumber}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
          onClick={() => {
            // Track funnel event (placeholder for analytics)
            console.log('Get Matched clicked:', advocate.id, advocate.phoneNumber);
          }}
          aria-label={`Call ${advocate.firstName} ${advocate.lastName} at ${advocate.phoneNumber}`}
        >
          Get Matched
        </a>
      </div>
    </article>
  );
}
