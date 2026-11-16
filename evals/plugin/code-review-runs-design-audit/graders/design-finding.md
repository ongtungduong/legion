---
type: llm
---

PASS if the reply reports that the order total has two sources of truth, `src/orders.js` (stored at checkout) and `src/invoices.js` (recomputed from line items with its own discount rule), naming both file locations; presents it as a serious problem to fix (labelled Important or Critical, or plainly described that way); and states a consequence (the stored order total and the invoice total diverge).

FAIL if the finding is missing or presented as minor or optional, if only one of the two files is named, or if the reply only proposes a rewrite with no consequence.
