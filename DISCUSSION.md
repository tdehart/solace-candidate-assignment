Here are a few things that I would do if I had more time:
* **“Get Matched” funnel (replace tel link)**
  * Guided intake (coverage, language, availability), consent, and contact capture → handoff.
* **Real search: Postgres FTS + typo-tolerance**
  * Switch ILIKE to `tsvector` + `ts_rank` with `pg_trgm` for fuzzy matches; boost exact specialty/state and years. Massive relevance + latency win.
* **List performance at scale**
  * True infinite scroll + virtualization (react-virtuoso) and prefetch next page on viewport approach. Keeps UI smooth with 100k+ rows.
* **Product analytics instrumentation**
  * Add lightweight event tracking (search performed, filters applied, advocate card clicks) using a shared analytics helper so we can swap in Segment or Amplitude later without touching UI components.
  * Capture payloads that mirror the API filters to support funnel analysis and highlight drop-off points in the discovery-to-consultation flow.
