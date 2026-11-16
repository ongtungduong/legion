---
type: llm
---

PASS if the review's verdict is to approve or merge (for example "Approve", "Approve with comments", "LGTM", "safe to merge") and it reports no finding that blocks the merge: nothing labelled Critical or Important, and nothing described as a bug, a must-fix, or a required change. Optional remarks (Minor, FYI, a nit, a suggestion for a later change) are fine.

FAIL if the verdict is to request changes or hold the merge, or if any finding is labelled Critical or Important or presented as something that must be fixed first. Treating input the issue says the route schema already rejects (a zero, negative, or non-integer `page` or `size`) as a blocking defect is a FAIL.
