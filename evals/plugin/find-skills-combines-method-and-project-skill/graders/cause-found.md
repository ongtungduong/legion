---
type: llm
---

Pass if the reply names the cause as the database URL variable renamed in the
deploy (PAYMENTS_DATABASE_URL to PAYMENTS_DB_URL), so the service runs without
a database URL, and cites the log evidence ("db pool: no url configured").
Fail if it proposes a fix without naming that cause, or names another cause.
