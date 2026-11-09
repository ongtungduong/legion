---
type: llm
---

PASS if all of these hold: the SQL injection in `src/search.js` (the query built from `q` by template interpolation) is reported as Critical with a location of the form `src/search.js:<line>`; the hard-coded Stripe key in `src/config.js` is reported; the dependency audit is described as not applicable or not possible because there is no lockfile; the report has sections for scope, method, findings, and what was not checked.

FAIL if the SQL injection is missing or below Critical, if the hard-coded key is missing, or if the reply claims a dependency audit was run.
