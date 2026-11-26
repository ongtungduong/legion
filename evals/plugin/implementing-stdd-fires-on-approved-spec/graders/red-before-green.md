---
type: llm
---

PASS if the run shows a test for decimal hours (for example "1.5h" -> 5400) being executed and failing before parseDuration is changed in src/duration.js, and the same test passing after the change.

FAIL if parseDuration is changed before any test for decimal hours has been run, or no such test is run at all.
