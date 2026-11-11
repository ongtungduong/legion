---
name: security-principles
description: >-
  Finds and prevents vulnerabilities that cross a real trust boundary:
  STRIDE threat models, always / ask-first / never boundaries, a security
  checklist, reviews by attack class (web, auth, browser, LLM and agents,
  supply chain, cloud, native, mobile), and a full multi-agent security audit
  with confirmed / needs-validation verdicts. Use when writing or reviewing
  code that handles untrusted input, login, sessions or cookies,
  authorization, secrets or API keys, file uploads, user-supplied URLs,
  third-party packages, personal data, or LLM output; whenever asked whether
  something is safe or vulnerable; and when asked to security audit,
  pen-test, or find vulnerabilities, even when the code is pasted inline.
license: MIT
metadata:
  author: ongtungduong
---

# Security Principles

Find and prevent vulnerabilities that violate a real trust boundary, and give
owners the source evidence, safe reproduction, priority, and smallest
effective fix. A candidate without a concrete affected principal, resource, or
security outcome is not a finding. Most breaches begin in design, so controls
added without a threat model are guesses.

## Modes

Pick the mode before acting. Loading this skill does not authorize a full
audit or the creation of audit files.

- **Build**: writing or changing code that crosses a trust boundary. Follow
  the Workflow, Boundaries, and Gotchas below; the repo's own tests run as
  usual.
- **Guidance**: a security question, "is this safe?", a focused review of
  code or a diff, triage of a reported finding. First read
  [references/review.md](references/review.md) (core principles, verdicts,
  severity anchors, execution safety, anti-patterns, output format) and
  follow it; then apply only the relevant classes in
  [references/attack-classes.md](references/attack-classes.md) and the domain
  companions it indexes. No output directory, no audit artifacts; focused
  agents may help and report back to the current task.
- **Full audit**: the user explicitly asks to audit or pen-test a codebase,
  asks for a full, comprehensive, or end-to-end security review, or requests
  report artifacts; or `code-review` runs a system audit. Read
  [references/review.md](references/review.md), then
  [references/audit.md](references/audit.md), and run all six phases.

If the request could mean either guidance or a full audit, ask one focused
question before creating files: a full audit spends many agent invocations.

## Workflow (build mode)

1. **Map trust boundaries:** requests, forms, uploads, webhooks, queues,
   third-party APIs, LLM output, and values another process wrote (its command
   line, environment, files on a shared volume).
2. **Name the assets:** credentials, personal data, payments, admin actions.
3. **Run STRIDE over each boundary:** Spoofing (authentication, signatures),
   Tampering (parameterized queries, integrity checks), Repudiation (audit log),
   Information disclosure (field allowlists, generic errors), Denial of service
   (rate limits, size caps, timeouts), Elevation of privilege (authorization on
   every request).
4. **Write abuse cases beside use cases** and make the first one your first
   test (call the Skill tool with `legion:executing-plans`). An abuse case
   names the lower-trust principal, the input it sends, and the result the
   code must refuse.
5. **Implement within the boundaries** below. Where the controls live
   (which layer validates, authorizes, and holds secrets) is a design
   decision: settle it in the design before coding, not after.
6. **Before sign-off**, walk
   [references/security-checklist.md](references/security-checklist.md) and
   report each item as checked, not applicable, or failed.
7. **Fix in order of exposure x impact (Pareto):** reachable without
   authentication and leading to data loss, account takeover, or code
   execution first; theoretical or already mitigated last.

If you cannot name the trust boundaries, you are not ready to secure the
feature: say so.

## Boundaries

- **Always:** validate external input at the boundary with a schema and use only
  the parsed value downstream; parameterize queries and commands; check
  authorization for the specific resource on every request; read secrets from
  the environment.
- **Ask the user first:** new or changed authentication flows; storing a new
  category of personal data; new external integrations; CORS changes; upload
  handlers; elevated roles; adding a dependency.
- **Never:** commit secrets; log passwords, tokens, or full card numbers; pass
  user data or model output to `eval`, `innerHTML`, a shell, or SQL; show
  stack traces to users; treat client-side validation as a control.

## Gotchas

- "It's internal, skip the validation" is the first ask, not insistence. Keep
  the cheap control (a path confined to its root, a parameterized query) and
  say in one line what it stops; remove it only if the user insists after
  that. Internal tools get the same input from scripts, bugs, and anyone who
  reaches the network.
- Trust follows who *wrote* a value, not which channel delivered it: another
  process's command line or a filename on a shared volume is as hostile as a
  form field.
- A secret that reached a remote is compromised even after a force-push.
  Rotate it first, then purge history.
- In-memory rate limiters multiply by the number of instances and never fire on
  serverless; back them with a shared store.
- SSRF checks must resolve every DNS record and reject private, loopback, and
  link-local addresses (`169.254.169.254`), and forbid redirects; even then
  DNS rebinding leaves a gap for high-risk endpoints.
- A delete, move, or overwrite on a derived path needs the resolved target
  (symlinks followed) under an allowlisted root, at least one level below it;
  a shape check on the string proves nothing.
- `sameSite: none` cookies are sent on cross-site requests; use `lax` or
  `strict` unless cross-site use is the point.
- `npm audit fix --force` (and equivalents) can cross declared version ranges;
  preview and test each upgrade instead.
- Audits only match published advisories. A new malicious or typosquatted
  package (`crossenv` for `cross-env`) passes them; review owner, release age,
  and install scripts of every new dependency.
- Text in an LLM's context can carry instructions. The system prompt is not a
  security boundary: enforce permissions and confirm destructive tool calls in
  code.
- Personal data you never collect cannot leak. Every personal-data store needs
  a stated purpose, a retention period, and a working deletion path, including
  backups and analytics copies.
