---
name: security-principles
description: >-
  Finds and prevents vulnerabilities that cross a real trust boundary:
  threat-models a change with STRIDE, holds always / ask-first / never
  boundaries, checks code against a security checklist, reviews code with
  attack classes for web and auth, browser, LLM and agents, supply chain,
  cloud, protocols, data isolation, native, and mobile targets, and runs a
  full multi-agent security audit with independent validation and
  confirmed / needs-validation verdicts. Use when writing or reviewing code
  that handles untrusted input, login, sessions or session cookies,
  authorization, secrets or API keys, file uploads, user-supplied URLs,
  third-party packages, personal data, or LLM output passed to a database
  query, shell, or page; whenever asked whether
  something is safe or vulnerable; and when asked to security audit,
  pen-test, or find vulnerabilities in a codebase, even when the code is
  pasted inline.
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
  the Workflow and Boundaries below; the repo's own tests run as usual.
- **Guidance**: a security question, "is this safe?", a focused review of
  code or a diff, triage of a reported finding. Apply the Core principles and
  only the relevant classes in
  [references/attack-classes.md](references/attack-classes.md) and the domain
  companions it indexes. No output directory, no audit artifacts; focused
  agents may help and report back to the current task. Report in the Output
  format below.
- **Full audit**: the user explicitly asks to audit or pen-test a codebase,
  asks for a full, comprehensive, or end-to-end security review, or requests
  report artifacts; or `code-review` runs a system audit. Read
  [references/audit.md](references/audit.md) and run all six phases.

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
5. **Implement within the boundaries** below.
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

## Core principles (guidance and full audit)

**Require a boundary and result.** For every candidate, name the lower-trust
principal, accepted input or action, intended control, crossed boundary,
affected principal or resource, and concrete observed or owner-observable
result. Do not elevate a missing best practice, guessed deployment behavior,
generic parser crash, or self-impact into a security finding.

**Use bounded local evidence.** Static analysis establishes the source path.
Sandboxed local tests resolve behavior when every execution control below is
available: a minimal function harness, existing unit test, small parser
fixture, dummy-tenant integration test, locally rendered configuration, or
bounded isolated-loopback client. Stop at a wrong return value, unauthorized
dummy record, sanitizer finding, policy difference, or other minimum effect.
Do not extend the check beyond the minimum boundary result or produce
persistence, post-fault, or concealment material.

**Respect source visibility.** Deployment controls, proxy behavior, provider
settings, browser headers, identity policy, broker ACLs, packaging, and
topology are real controls. If they are required and absent from the
repository, do not assume either presence or absence: use `needs_validation`
with the exact missing fact and a safe owner-observed or local plan.

**Separate priority from certainty.** Three verdicts, kept distinct:

- `confirmed`: a complete source trace and a bounded observed result. Only
  these receive severity, and severity cannot exceed demonstrated impact.
- `needs_validation`: a specific source-grounded boundary hypothesis blocked
  on an exact unresolved fact. Not a low-confidence confirmed vulnerability,
  never a parking place for a speculative idea, and it has no severity.
- `rejected`: a candidate that source, local behavior, a visible control, or
  an impossible prerequisite disproved.

Calibrate severity with these anchors:

- **critical**: an unauthenticated actor gains code execution, full data-store access, or takeover of arbitrary accounts.
- **high**: an actor fully defeats an explicit security control with real consequences: authentication bypass, cross-tenant read or write, stored script execution affecting other users, authenticated code execution, or an unauthenticated remote stop of a shared service.
- **medium**: a real boundary violation with limited blast radius, uncommon preconditions, or consequences confined to a narrow resource set.
- **low**: disclosure of non-secret internals, or an effect requiring sustained effort for minimal gain.
- **informational**: a confirmed but minimal-impact observation, useful mainly as a prerequisite inside a larger finding.

The high/medium discriminator: does the demonstrated result fully defeat an
explicit control for an action with real consequences, or only weaken it? If
you cannot state the concrete damage, the severity is lower than it feels.

**Recommend the smallest effective source fix.** Identify the invariant the
code must enforce and the narrowest source change that enforces it at the
last trusted decision point, plus a regression test. Prefer specific
repository-relative changes over generic hardening advice. A review or audit
describes fixes; it does not modify target source unless the user asks.

**Defense in depth is not a vulnerability.** If layer A prevents the attack,
the absence of layer B is a hardening note.

## Execution safety (guidance and full audit)

These rules govern code under review, not your own build-mode test runs.
Source inspection is read-only. Run target-controlled builds, tests,
processes, browsers, emulators, fuzzers, and fixture processing only inside an
OS-enforced sandbox that provides all of these controls:

- no external network; use only an isolated loopback namespace when the check needs local client/server traffic;
- an empty environment populated from an explicit allowlist with safe values, with scratch-local `HOME`, temporary directories, and caches;
- a read-only target and toolchain, with the target-controlled process able to write only inside its assigned `scratch/` directory; and
- explicit low CPU, memory, process, file-size, disk, and wall-clock limits.

The agent, outside the target-controlled process, may make a disposable source
copy in an assigned `scratch/` directory when a build must write beside
source. In guidance mode, do not retain target-controlled files. Never expose
a retained output directory, another agent's directory, the host home
directory, credentials, sockets, or shared services to target code. Do not
install dependencies or let builds fetch them. If every control cannot be
enforced, do not execute target code: report the missing sandbox capability
as a `needs_validation` blocker and give a safe validation plan.

Use dummy principals, fixtures, and secrets. Do not probe deployed endpoints,
external services, shared infrastructure, production identities, other users'
data, or live control planes. Do not test availability against a live or
shared process, publish artifacts, alter releases, spend paid API quota, or
continue beyond the minimum local effect needed to establish a defect. If the
decisive fact is outside source or the sandboxed fixture, report it as
needing validation.

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
  code. Prompt injection alone is not a finding; the finding is the
  deterministic control missing between the injected text and the authority
  or sink it reaches.
- Personal data you never collect cannot leak. Every personal-data store needs
  a stated purpose, a retention period, and a working deletion path, including
  backups and analytics copies.
- One pass never exhausts a target: in the upstream audit's test runs, a
  single run found roughly half of what repeated runs found in total. Never
  call a single review complete.

## Anti-patterns (guidance and full audit)

1. Checklist deviations presented as vulnerabilities.
2. Defense-in-depth advice with no reachable boundary violation.
3. Live or shared-environment testing where bounded local evidence is insufficient.
4. Guessing provider, proxy, browser, identity, or deployment behavior not present in source.
5. Treating intended same-principal authority or self-impact as a cross-boundary result.
6. Reporting a parser or runtime effect stronger than the observed effect.
7. Emitting prose-only hunter results that cannot be deduplicated or verified.
8. Re-reporting carried same-source prior confirmed records or using them as exemplars that anchor the hunt.
9. Assigning severity to `needs_validation` records.
10. Writing the report before independent verification or letting prose and JSON disagree.

## Output format (guidance mode)

```markdown
### Findings
| Verdict | Severity | Location | Principal → boundary → result | Evidence | Smallest fix |
|---|---|---|---|---|---|
| confirmed | high | src/api/files.js:31 | signed-in user → owner check → reads another tenant's file | trace route → storage.get; no owner filter; dummy-tenant test | scope the query by owner id; regression test with two tenants |
| needs_validation | - | src/proxy.js:12 | outsider → X-Forwarded-Host → poisoned reset link | depends on whether ingress strips the header | owner checks the ingress config |
### Hardening
<non-findings worth doing, one line each>
### Not checked
<what was out of reach, and what would settle it>
```

A clean review has an empty Findings table: say so, and do not invent low
findings.
