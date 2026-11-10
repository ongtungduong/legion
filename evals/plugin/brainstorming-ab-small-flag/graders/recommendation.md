---
type: llm
---

Expected answer: add a flag to `status` (`--json`, or `--output json` / `--format json`) that prints the same `services` array as JSON to stdout, with the table unchanged as the default. Naming the flag so `logs` and `releases` can adopt it later is fine.

PASS if the reply recommends that approach for `status` now.

FAIL if it recommends a separate command, a new output library or framework, changing the default output, converting every command in this change, or ends without picking one approach.
