---
type: llm
---

PASS if all of these hold: a "System design audit" heading reports that the order total has two sources of truth, `src/orders.js` (stored at checkout) and `src/invoices.js` (recomputed from line items with its own discount rule), naming both file locations; the finding cites a system-design rule (for example "every rule and state has one named owner" or "the source of truth is named"); it is labeled Important or Critical and states a consequence (the stored order total and the invoice total diverge).

FAIL if the heading is missing, if the finding is missing or below Important, if only one of the two files is named, or if the reply only proposes a rewrite with no consequence.
