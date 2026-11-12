# Security

Read this when the change crosses a trust boundary: untrusted input, auth,
sessions, secrets, uploads, user-supplied URLs, third-party packages,
personal data, or LLM output, whatever the size. Prevent vulnerabilities that
violate a real trust boundary while the code is designed and built. A
candidate without a concrete affected principal, resource, or security
outcome is not a finding. Most breaches begin in design, so controls added
without a threat model are guesses.

## Workflow

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
6. **Before sign-off**, walk the Final checklist below and report each item
   as checked, not applicable, or failed.
7. **Fix in order of exposure x impact:** reachable without
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

## Final checklist

Mark each item checked, not applicable, or failed, with evidence. In your own
change, fix a failed item. In a review, a failed item becomes a finding only
with a lower-trust principal, a crossed boundary, and a concrete result;
otherwise it is a hardening note.

### Input and output
- [ ] All external input validated at the boundary (shape, length, enum, format)
- [ ] No string-built SQL, NoSQL, shell, or file paths from input
- [ ] Output encoded; no raw HTML from user data without an allowlist sanitizer
- [ ] Uploads: MIME allowlist, size cap, content check where it matters

### Authentication and authorization
- [ ] Every protected endpoint checks authorization for the specific resource
- [ ] Passwords hashed with argon2, scrypt, or bcrypt
- [ ] Session cookies are httpOnly, secure, sameSite; bounded lifetime
- [ ] Auth endpoints rate limited, with a shared store when more than one instance runs

### Secrets and data
- [ ] No secrets in source or git history; `.env*` gitignored; `.env.example` has placeholders
- [ ] Staged changes scanned without printing values: `git diff --cached -i -G'password|secret|api_key|token' --name-only`
- [ ] No secrets, tokens, or personal data in logs or telemetry
- [ ] Personal data classified, collected for a stated purpose, with retention and a deletion path
- [ ] Responses strip sensitive fields; errors are generic to users

### Network and configuration
- [ ] Security headers set (CSP from `default-src 'self'`, HSTS, nosniff, frame options)
- [ ] CORS limited to an explicit origin list; never `*` with credentials
- [ ] Server-side fetches of user URLs: scheme/host allowlist, all resolved IPs public, no redirects

### Dependencies
- [ ] Native audit run against the committed lockfile; critical/high triaged by reachability
- [ ] Registry signatures verified where supported (`npm audit signatures`); a missing signature is a lead to investigate, not proof of compromise
- [ ] New dependencies reviewed (owner, release age, install scripts, typosquats)
- [ ] One lockfile per install boundary; installs reproducible

### LLM features (if any)
- [ ] Model output validated against a schema before use; never executed or rendered raw
- [ ] Secrets, other tenants' data, and the full system prompt kept out of the context
- [ ] Tool permissions scoped; tool arguments validated; destructive actions confirmed in code
- [ ] Token, rate, and recursion limits set
