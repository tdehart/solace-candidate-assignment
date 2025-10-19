import { z } from "zod";
import { and, or, ilike, gte, sql, SQL, desc, asc } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import {
  encodeCursor,
  decodeCursor,
  hashFilters,
  type SortOption,
  type CursorKeys,
} from "../../../lib/cursor";

// Validation schema for query parameters
const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  q: z.string().optional(),
  city: z.string().optional(),
  degree: z.enum(["MD", "PhD", "MSW"]).optional(),
  minExp: z.coerce.number().int().min(0).optional(),
  specialties: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").filter(Boolean) : undefined)),
  sort: z.enum(["years_asc", "years_desc", "name_asc"]).optional().default("years_desc"),
});

type QueryParams = z.infer<typeof querySchema>;

/**
 * Build WHERE clause for cursor-based pagination
 */
function buildCursorCondition(cursorKeys: CursorKeys, sortOption: SortOption): SQL | undefined {
  const { id, years, lastName } = cursorKeys;

  switch (sortOption) {
    case "years_desc":
      // WHERE (years_of_experience, id) < (cursorYears, cursorId)
      if (years === undefined) return undefined;
      return or(
        sql`${advocates.yearsOfExperience} < ${years}`,
        and(
          sql`${advocates.yearsOfExperience} = ${years}`,
          sql`${advocates.id} > ${id}`
        )
      );

    case "years_asc":
      // WHERE (years_of_experience, id) > (cursorYears, cursorId)
      if (years === undefined) return undefined;
      return or(
        sql`${advocates.yearsOfExperience} > ${years}`,
        and(
          sql`${advocates.yearsOfExperience} = ${years}`,
          sql`${advocates.id} > ${id}`
        )
      );

    case "name_asc":
      // WHERE (lower(last_name), id) > (lower(cursorLast), cursorId)
      if (!lastName) return undefined;
      return or(
        sql`lower(${advocates.lastName}) > lower(${lastName})`,
        and(
          sql`lower(${advocates.lastName}) = lower(${lastName})`,
          sql`${advocates.id} > ${id}`
        )
      );

    default:
      return undefined;
  }
}

/**
 * Build ORDER BY clause for the sort option
 */
function buildOrderBy(sortOption: SortOption): SQL[] {
  switch (sortOption) {
    case "years_desc":
      return [
        sql`${advocates.yearsOfExperience} DESC NULLS LAST`,
        sql`${advocates.id} ASC`,
      ];

    case "years_asc":
      return [
        sql`${advocates.yearsOfExperience} ASC NULLS LAST`,
        sql`${advocates.id} ASC`,
      ];

    case "name_asc":
      return [
        sql`lower(${advocates.lastName}) ASC NULLS LAST`,
        sql`${advocates.id} ASC`,
      ];

    default:
      return [sql`${advocates.id} ASC`];
  }
}

/**
 * Build filter conditions
 */
function buildFilters(params: QueryParams): SQL[] {
  const conditions: SQL[] = [];

  // Search query (ILIKE on first name, last name, city, and specialties)
  // Tokenize on whitespace and AND the terms for better matching
  if (params.q) {
    const terms = params.q.trim().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      const termConditions = terms.map((term) => {
        const searchPattern = `%${term}%`;
        return or(
          ilike(advocates.firstName, searchPattern),
          ilike(advocates.lastName, searchPattern),
          ilike(advocates.city, searchPattern),
          // Search within specialties jsonb array by casting to text
          sql`${advocates.specialties}::text ILIKE ${searchPattern}`
        )!;
      });
      conditions.push(and(...termConditions)!);
    }
  }

  // City filter (case-insensitive pattern match)
  if (params.city) {
    conditions.push(ilike(advocates.city, `%${params.city}%`));
  }

  // Degree filter
  if (params.degree) {
    conditions.push(sql`${advocates.degree} = ${params.degree}`);
  }

  // Minimum years of experience
  if (params.minExp !== undefined) {
    conditions.push(gte(advocates.yearsOfExperience, params.minExp));
  }

  // Specialties filter (all-of semantics with @>)
  if (params.specialties && params.specialties.length > 0) {
    const specialtiesJson = JSON.stringify(params.specialties);
    conditions.push(sql`${advocates.specialties} @> ${specialtiesJson}::jsonb`);
  }

  return conditions;
}

export async function GET(request: Request) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = querySchema.safeParse(rawParams);

    if (!validationResult.success) {
      return Response.json(
        { error: "Invalid query parameters", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const params = validationResult.data;
    const { cursor: cursorToken, limit, sort } = params;

    // Decode and validate cursor
    let cursorKeys: CursorKeys | null = null;
    if (cursorToken) {
      const cursorPayload = decodeCursor(cursorToken);

      if (!cursorPayload) {
        return Response.json(
          { error: "Invalid cursor token" },
          { status: 400 }
        );
      }

      // Validate sort hasn't changed
      if (cursorPayload.sort !== sort) {
        return Response.json(
          { error: "Sort option changed, cursor is invalid. Please start from the beginning." },
          { status: 400 }
        );
      }

      // Validate filters haven't changed
      const currentFiltersHash = hashFilters({
        q: params.q,
        city: params.city,
        degree: params.degree,
        minExp: params.minExp,
        specialties: params.specialties,
      });

      if (cursorPayload.filtersHash !== currentFiltersHash) {
        return Response.json(
          { error: "Filters changed, cursor is invalid. Please start from the beginning." },
          { status: 400 }
        );
      }

      // Validate cursor payload shape matches sort option
      if (sort === "years_desc" || sort === "years_asc") {
        if (cursorPayload.keys.years === undefined) {
          return Response.json(
            { error: "Invalid cursor: missing years for years-based sort" },
            { status: 400 }
          );
        }
      } else if (sort === "name_asc") {
        if (!cursorPayload.keys.lastName) {
          return Response.json(
            { error: "Invalid cursor: missing lastName for name-based sort" },
            { status: 400 }
          );
        }
      }

      cursorKeys = cursorPayload.keys;
    }

    // Build query conditions
    const filterConditions = buildFilters(params);
    const cursorCondition = cursorKeys ? buildCursorCondition(cursorKeys, sort) : undefined;

    const whereConditions = cursorCondition
      ? [...filterConditions, cursorCondition]
      : filterConditions;

    // Fetch limit+1 to detect if there's a next page
    // Project only needed columns for performance
    const baseQuery = db
      .select({
        id: advocates.id,
        firstName: advocates.firstName,
        lastName: advocates.lastName,
        city: advocates.city,
        degree: advocates.degree,
        specialties: advocates.specialties,
        yearsOfExperience: advocates.yearsOfExperience,
        phoneNumber: advocates.phoneNumber,
      })
      .from(advocates);

    // Add WHERE clause only if conditions exist (avoid passing undefined)
    const results = await (whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery
    )
      .orderBy(...buildOrderBy(sort))
      .limit(limit + 1);

    // Check if there are more results
    const hasNext = results.length > limit;
    const data = hasNext ? results.slice(0, limit) : results;

    // Generate next cursor if there are more results
    let nextCursor: string | null = null;
    if (hasNext && data.length > 0) {
      const lastItem = data[data.length - 1];
      const keys: CursorKeys = {
        id: lastItem.id,
        years: lastItem.yearsOfExperience,
        lastName: lastItem.lastName,
      };

      const filtersHash = hashFilters({
        q: params.q,
        city: params.city,
        degree: params.degree,
        minExp: params.minExp,
        specialties: params.specialties,
      });

      nextCursor = encodeCursor({
        sort,
        keys,
        filtersHash,
      });
    }

    return Response.json({
      data,
      pageInfo: {
        nextCursor,
        hasNext,
      },
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
