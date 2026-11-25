---
type: llm
---

The repo has src/orders.js, src/report.js, test/orders.test.js, migrations/001_orders.sql, and migrations/002_audit.sql.

PASS if the plan names the existing files it changes by their real paths and numbers its new migration files 003 or later.

FAIL if it names files that do not exist as if they did (for example src/models/order.js or a db/ folder), or numbers a new migration 001 or 002.
