import { z } from "zod";
import db from "../../../db";
import { advocates } from "../../../db/schema";

// Validation schema for query parameters
const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  degree: z.enum(["MD", "PhD", "MSW"]).optional(),
  minExp: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["years_asc", "years_desc"]).optional().default("years_desc"),
});

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

    // For now, just return all data (pagination/filtering will be added in PR2)
    const data = await db.select().from(advocates);

    return Response.json({ data });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
