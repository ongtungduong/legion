---
type: llm
---

The prompt already states: why (CI must parse `deployctl status`), the fields needed (name, version, health), that the table stays the default, the command code, and that the other commands print only tables.

PASS if the reply asks no question, or only questions whose answer would change which approach it recommends.

A single closing line that asks whether to proceed with the recommendation is the approval step, not a question about the request: ignore it.

FAIL if it asks about anything listed above, or asks a question whose answer would not change the choice (for example a gut reaction or a preference with no effect on the approach).
