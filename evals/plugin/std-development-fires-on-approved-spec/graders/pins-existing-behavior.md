---
type: llm
---

src/duration.js rejects an empty string and units out of order ("30m1h") with a RangeError, but the existing tests cover neither, and changing the regex for decimal hours can silently break both.

PASS if the run adds tests (or runs explicit checks) that "" and "30m1h" still throw RangeError, at the latest together with the change to parseDuration, and they pass at the end.

FAIL if either behavior is left unchecked.
