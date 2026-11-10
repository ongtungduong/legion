---
type: llm
---

The prompt already states: why (users miss new comments until they refresh), the freshness requirement (within a minute), the platform (Lambda behind an API Gateway REST API, 29-second timeout), the freeze on new services and AWS resources, the peak load (about 300 open dashboards), and the existing handler and component code.

PASS if the reply asks no question, or only questions whose answer would change which approach it recommends.

FAIL if it asks about anything listed above, or asks a question whose answer would not change the choice (for example a gut reaction or a preference with no effect on the approach).
