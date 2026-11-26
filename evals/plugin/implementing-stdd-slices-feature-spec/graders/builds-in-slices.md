---
type: llm
---

PASS if, for at least two of the spec's criteria, the run writes a test for that criterion, runs it failing, and changes src/text.js so it passes before the test for a later criterion is written, and the full suite passes at the end.

FAIL if every new test for truncateWords is written before the first change to src/text.js, or if no new test is run failing before the change it covers.
