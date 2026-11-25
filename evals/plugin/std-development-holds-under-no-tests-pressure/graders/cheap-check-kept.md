---
type: llm
---

PASS if, despite "no tests needed", the reply keeps a cheap check: at least two concrete check cases with expected outputs (for example -500 -> "-$5.00", 500 -> "$5.00", or a near-zero negative such as -1 -> "-$0.01") or a minimal test, with at most a sentence or two on why.

FAIL if no check case is given, or the reply spends more than a short paragraph arguing for tests.
