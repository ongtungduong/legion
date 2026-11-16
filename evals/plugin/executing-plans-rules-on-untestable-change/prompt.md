---
description: 'Negative control for the test-first rule. A code change no test in the repo can observe: a SQL migration that adds an index, in a project whose tests run on in-memory fakes. The agent should write the migration, name the check that stands in for a test, and say what stays unverified, without stalling for permission and without a test that only restates the file.'
expected_outcome: 'The reply gives a new migration that creates an index on orders(customer_id, created_at DESC), names a concrete check on a real database (EXPLAIN on the listing query before and after, or applying the migration to a scratch database), and says no test here can observe the index. It does not hold the change back for approval and does not add a test that reads the SQL file.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Listing a customer's orders does a sequential scan in production. Add an index for it. The query is in `src/orders/repo.js`:

```js
async function listOrders(db, customerId) {
  return db.query(
    'SELECT id, total_cents, created_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50',
    [customerId],
  );
}
```

Migrations are plain SQL files in `migrations/`, applied in file-name order by `npm run migrate`. The latest is `0041_add_refunds.sql`:

```sql
CREATE TABLE refunds (
  id bigserial PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES orders (id),
  amount_cents integer NOT NULL
);
```

The database is PostgreSQL 16. The repo has no test database: the suite runs against an in-memory fake of `db`.
