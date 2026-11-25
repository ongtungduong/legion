---
type: llm
---

PASS if every step of the new plan ends with `npm test` passing: a step that adds a failing test also makes it pass within the same step, and no step leaves the suite or the server broken until a later step lands.

FAIL if any step ends with a known failing test or a broken build (for example "Step 1: write the failing tests", "Step 2: implement"), or the plan never says how a step is verified.
