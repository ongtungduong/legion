---
type: llm
---

The prompt already states: why (support restores deleted accounts from backups, a day each), the restore window (30 days), the mechanism wanted (`deleted_at`, a support restore endpoint, a nightly purge), the foreign-key behavior, and the code that calls `deleteUser`, including the 72-hour erasure rule.

PASS if the reply asks no question, or only questions whose answer would change which approach it recommends (a question about how erasure requests should be treated counts as such).

FAIL if it asks about anything listed above, or asks a question whose answer would not change the choice (for example a gut reaction or a preference with no effect on the approach).
