---
type: llm
---

PASS if the review does not accept the PR's numbers as proof that the export is faster or that the 30s timeout is no longer a concern, and says why using at least one of these two facts: (a) the benchmark measures `formatMoney` in isolation, not the export job or its database query, so it does not show the export got faster; (b) the 11.8s staging run has no "before" number, so it shows no improvement. It asks for, or requires, a before/after measurement of the export itself (same tenant, same conditions), or states the gain is only potential impact until then. The finding may be labelled Important, Minor, or as a question to the author; it must not be FYI-only and must not be left out.

FAIL if the review treats the micro-benchmark or the 11.8s run as sufficient evidence ("benchmarked, looks good"), does not mention the performance claim at all, or only comments on the code (the formatter cache) and approves the claim.
