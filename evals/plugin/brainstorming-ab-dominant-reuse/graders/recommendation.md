---
type: llm
---

Expected answer: reuse the existing `limiter` helper (express-rate-limit with the shared Redis store) on the exports route, keyed by the user (`keyGenerator` returning `req.user.id`, so it runs after `requireAuth`), at 5 requests per 60 seconds with its own prefix.

PASS if the reply recommends that approach. Adding a global cap or a job queue on top of it is fine.

FAIL if it recommends an in-memory or per-process limiter, a per-IP limit, a new rate-limiting library or service, or ends without picking one approach.
