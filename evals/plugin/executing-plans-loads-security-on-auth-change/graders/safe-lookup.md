---
type: llm
---

PASS if the proposed `findUserByEmail` passes the email as a query parameter (a placeholder such as `$1` with a params array), never by string concatenation or template interpolation into the SQL, AND validates or normalizes the email before querying (for example: type and length checks, a format check, trimming or lower-casing), AND the reply includes a test for it.

FAIL if the email is interpolated into the SQL string, or if there is no validation of the email at all.
