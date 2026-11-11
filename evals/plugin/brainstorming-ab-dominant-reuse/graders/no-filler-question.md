---
type: llm
---

The prompt already states: why (a scripted burst of exports overloaded the database), the limit (5 per minute), the key (per logged-in user, not per IP), the deployment (4 instances on one Redis), and the existing limiter code.

PASS if the reply asks no question, or only questions whose answer would change which approach it recommends.

FAIL if it asks about anything listed above, or asks a question whose answer would not change the choice (for example a gut reaction or a preference with no effect on the approach).
