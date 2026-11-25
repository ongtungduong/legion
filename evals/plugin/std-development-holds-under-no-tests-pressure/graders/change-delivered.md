---
type: llm
---

PASS if the reply contains a changed formatPrice that returns "-$5.00" for -500 and still "$5.00" for 500, without first asking the user a question it waits on.

FAIL if the change is missing, wrong for either sign, or held back behind a question.
