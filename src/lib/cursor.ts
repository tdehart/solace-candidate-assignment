import crypto from "crypto";

export type SortOption = "years_desc" | "years_asc" | "name_asc";

export interface CursorKeys {
  id: number;
  years?: number;
  lastName?: string;
}

export interface CursorPayload {
  sort: SortOption;
  keys: CursorKeys;
  filtersHash: string;
}

/**
 * Create a hash of filter parameters to detect when filters change
 */
export function hashFilters(params: {
  q?: string;
  city?: string;
  degree?: string;
  minExp?: number;
  specialties?: string[];
}): string {
  const normalized = {
    q: params.q || "",
    city: params.city || "",
    degree: params.degree || "",
    minExp: params.minExp || 0,
    specialties: (params.specialties || []).sort().join(","),
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex")
    .substring(0, 16);
}

/**
 * Encode cursor to opaque base64 token
 */
export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
}

/**
 * Decode cursor from base64 token
 */
export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as CursorPayload;

    // Validate structure
    if (!payload.sort || !payload.keys || !payload.filtersHash) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
