-- Create indexes for efficient filtering and sorting

-- Index for city filter
CREATE INDEX IF NOT EXISTS idx_advocates_city ON advocates(city);

-- Index for years of experience sort and filter
CREATE INDEX IF NOT EXISTS idx_advocates_years ON advocates(years_of_experience);

-- Index for case-insensitive name sorting
CREATE INDEX IF NOT EXISTS idx_advocates_last_name_lower ON advocates(lower(last_name));

-- GIN index for specialties (jsonb) filtering
CREATE INDEX IF NOT EXISTS idx_advocates_specialties_gin ON advocates USING GIN(payload);
