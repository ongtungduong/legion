---
type: llm
---

PASS if the reply reports a run of the project's whole test suite (`node --test` or `npm test`, not one file) made after the change, and shows its output or its counts, with 0 failures.

FAIL if the reply says the tests pass or should pass without showing a run, shows only a run from before the change, shows only a single test file, or reports failures.
