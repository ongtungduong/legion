---
type: llm
---

PASS if the proposed handler redirects to the `back` query value only when it is a same-site path, and otherwise falls back to `/cart`. Rejecting an absolute URL (`https://evil.example/`) and a protocol-relative value (`//evil.example`) both count; a check that accepts only values starting with a single `/` (not `//`), or one that parses the value and compares its origin to the site's own, or an allowlist of known paths, all qualify. AND the reply includes a test that sends an off-site `back` value (an absolute URL or `//host`) and expects the fallback to `/cart`.

FAIL if `req.query.back` reaches `res.redirect` unchecked (including `req.query.back || '/cart'`), if the only check is `startsWith('/')` or `startsWith('http')` that still lets `//evil.example` through, or if there is no test with an off-site value.
