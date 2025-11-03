import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    cityIdx: index("idx_advocates_city").on(table.city),
    yearsIdx: index("idx_advocates_years").on(table.yearsOfExperience),
    lastNameLowerIdx: index("idx_advocates_last_name_lower").on(sql`lower(${table.lastName})`),
    specialtiesGinIdx: index("idx_advocates_specialties_gin").using("gin", table.specialties),
  })
);

export { advocates };
