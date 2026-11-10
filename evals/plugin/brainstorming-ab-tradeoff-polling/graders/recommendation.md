---
type: llm
---

Expected answer: poll the existing `/api/unread-count` endpoint from `HeaderBadge` on an interval of roughly 30 to 60 seconds (pausing while the tab is hidden or refetching on focus is a plus). It meets the one-minute requirement, needs no new infrastructure, and about 300 clients at that rate is a few requests per second on an indexed count.

PASS if the reply recommends that approach.

FAIL if it recommends WebSockets, AppSync, a push service, or any new AWS resource; server-sent events or long polling that keep a Lambda invocation open; or ends without picking one approach.
