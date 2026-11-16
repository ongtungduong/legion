---
type: llm
---

PASS if the review flags that the cache is keyed only by `reportId` while the query is per tenant, so one tenant can be served another tenant's report, and treats it as a reason not to merge yet: labelled Critical or Important, or the reviewer's equivalent (blocking, must fix before merge).

FAIL if the cross-tenant problem is missing, or is presented as minor, optional, or FYI.
