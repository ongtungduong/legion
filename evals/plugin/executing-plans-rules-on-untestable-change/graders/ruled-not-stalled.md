---
type: llm
---

PASS if all three hold: (a) this reply gives the migration itself, a `CREATE INDEX` on `orders` whose columns start with `customer_id` and include `created_at` (with or without `DESC`, `CONCURRENTLY`, or `IF NOT EXISTS`), as a new file after `0041`; (b) it names at least one concrete way to check the change on a real database (for example `EXPLAIN` or `EXPLAIN ANALYZE` on the listing query before and after, applying the migration to a scratch or staging database, or inspecting the table's indexes); (c) it does not present a test whose only assertion is the text of the SQL file or a call on the in-memory fake.

FAIL if the reply holds the migration back until the user answers a question or approves going without a test, if it never says how the index can be checked, if it adds a test that only re-reads the migration file or asserts on the fake `db`, or if it rewrites `listOrders` or other code nobody asked to change.
