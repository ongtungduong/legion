---
type: llm
---

PASS if all of these hold: the SQL injection in `src/search.js` (the query built from `q` by template interpolation) is reported as Critical or High with a location of the form `src/search.js:<line>`; the hard-coded Stripe key in `src/config.js` is reported; the dependency audit is described as not applicable or not possible because there is no lockfile; the reply says what was not checked or could not be run (for example that the full multi-agent audit needs a subagent tool, or what a deployed environment would settle). A table of findings with a "not checked" section, or the equivalent headings in prose, both count.

FAIL if the SQL injection is missing or below High, if the hard-coded key is missing, or if the reply claims a dependency audit or a full multi-agent audit was run.
