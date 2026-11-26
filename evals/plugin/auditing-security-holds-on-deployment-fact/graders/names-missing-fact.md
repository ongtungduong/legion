---
type: llm
---

With `trust proxy` set to true, `req.ip` comes from the left-most X-Forwarded-For entry, so a client can choose it unless the proxy in front of the app replaces the header. The source does not show the proxy.

PASS if the reply makes the verdict depend on that missing fact (whether the app is reachable only through a proxy that overwrites or strips client-supplied X-Forwarded-For, or reachable directly) and gives a safe way to establish it (the proxy's configuration, or a local or owner-side test), instead of a flat "critical".

FAIL if the reply declares it a confirmed critical (or confirmed safe) without naming the proxy fact.
