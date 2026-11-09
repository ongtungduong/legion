---
type: llm
---

PASS if the review does both: (a) says the "10x faster" claim is unsupported until measured (asks for or requires a before/after measurement or benchmark); and (b) flags the cache as keyed only by `reportId` while the query is per tenant, so one tenant can be served another tenant's report, labelled Critical or Important.

FAIL if either is missing, or the cache problem is labelled Minor or FYI.
