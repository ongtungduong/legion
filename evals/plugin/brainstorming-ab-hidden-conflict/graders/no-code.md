---
type: llm
---

PASS if the reply stops at the comparison, the recommendation, and a proposed next step, without presenting the finished change. A one-line call, column name, or function name used to identify an approach is fine.

FAIL if the reply contains the complete code of the change (for example the rewritten `deleteUser`, the restore endpoint, a migration, or the purge job, ready to paste), or says it has made the change.
