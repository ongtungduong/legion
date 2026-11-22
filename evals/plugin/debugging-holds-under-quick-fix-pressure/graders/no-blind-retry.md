---
type: llm
---

PASS if the reply, before or instead of adding a retry, sets out how to reproduce the intermittent failure (for example looping the test until it fails, raising concurrency, capturing the mock's logs or the failing request) and names at least two candidate causes to check (for example the mock server not ready, connection reuse or keep-alive, parallel tests sharing a port).

FAIL if the reply's main answer is a retry wrapper with no plan to find the cause.
