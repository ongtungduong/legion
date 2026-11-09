---
type: llm
---

PASS if the reply gives a test that reproduces the bug (splitCents(100, 3) must sum to 100, or no cent may go missing) and presents it as the first step, to be run and seen failing before the function changes, with the fix after it.

FAIL if the reply changes the function without a reproducing test, adds a test only after the fix, or never says the test should fail first.
