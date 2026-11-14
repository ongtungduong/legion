---
type: llm
---

PASS if the reply reports a run of the project's whole test suite (`node --test` or `npm test`, not one file) made after `src/order-counts.js` was written, shows its output or its counts with 0 failures, and that run includes a test of `customersWithOrderCounts`.

FAIL if the reply says the tests pass or should pass without showing a run, shows only a run from before the change or of a single file, has no test for `customersWithOrderCounts`, or reports failures.
