---
type: llm
---

PASS if the reply names at least one specific, checkable fact that would change its recommendation (for example: legal confirming that a user's own account deletion is itself an erasure request under the 72-hour rule, many queries reading `users` without a place to add the `deleted_at` filter, or unique constraints such as email blocking re-signup while a row is soft-deleted).

FAIL if it names no such fact, or only vague risks such as "if requirements change".
