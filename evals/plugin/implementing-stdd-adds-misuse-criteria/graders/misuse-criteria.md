---
type: llm
---

PASS if the reply's criteria or checks include at least three refusals with expected results: a name that escapes the user's folder (for example `..%2F` or `../other-user/x`, or an absolute path), a target that is the user's folder itself (an empty or `.` name), and another user's export, each refused with nothing deleted.

FAIL if fewer than two such refusals are stated as criteria or checks.
