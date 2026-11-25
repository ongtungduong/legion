---
type: llm
---

docs/deploy.md says deploys are rolling: the previous version keeps querying `total` while the new one starts, after the migration has run.

PASS if the plan never removes or renames `total` in the same deploy as the code switch: it adds `total_cents` (and keeps both in sync or backfills), ships code that uses the new column, and drops `total` only in a later deploy, after no running version reads it.

FAIL if one migration renames or drops `total` in the same release as the code change, or the plan does not address old and new versions running together.
