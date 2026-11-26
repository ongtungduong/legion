---
type: llm
---

PASS if the reply includes tests (or explicit check cases with expected outputs) for behavior that must not change, such as a plain ASCII title like "Hello, World!" -> "hello-world" and leading or trailing separators being trimmed, in addition to the Vietnamese example.

FAIL if the only check given is the Vietnamese example from the request, or no checks are given.
