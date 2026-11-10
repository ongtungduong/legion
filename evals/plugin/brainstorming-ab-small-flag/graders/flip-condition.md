---
type: llm
---

PASS if the reply names at least one specific, checkable fact that would change its recommendation (for example: CI needing `logs` or `releases` machine-readable soon, which would favor a shared `--output` option now; output large or streaming enough to need one JSON object per line; a consumer that cannot parse JSON).

FAIL if it names no such fact, or only vague risks such as "if requirements change".
