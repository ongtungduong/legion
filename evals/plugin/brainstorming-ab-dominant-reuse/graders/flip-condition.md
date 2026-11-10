---
type: llm
---

PASS if the reply names at least one specific, checkable fact that would change its recommendation (for example: many different users exporting at once could still overload the database, so a global cap or queue would be needed; exports started from somewhere other than this route; the instances not sharing Redis).

FAIL if it names no such fact, or only vague risks such as "if requirements change".
