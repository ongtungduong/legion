# Security review rules (focused review and full audit)

Read this before a focused security review or a full audit; the build-time
workflow of `security-principles` does not need it. These are Cloudflare `security-audit`'s core principles, universal
execution safety, and anti-patterns, and they bind every review, triage, and
audit agent.

## Core principles

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

## Execution safety

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
source. In a focused review, do not retain target-controlled files. In full audit
mode, only trusted parent-side code may promote the minimum non-secret result
to retained `artifacts/` using the procedure under Write isolation in
`references/security-audit.md`. Never expose a retained output directory (other than
the agent's own assigned `scratch/`), another agent's directory, the host home
directory, credentials, sockets, or shared services to target code. Do not
install dependencies or let builds fetch them. Use only tools and dependencies
already available locally. If every control cannot be enforced, do not
execute target code: report the missing sandbox capability as a
`needs_validation` blocker and give a safe validation plan.

Use dummy principals, fixtures, and secrets. Do not probe deployed endpoints,
external services, shared infrastructure, production identities, other users'
data, or live control planes. Do not test availability against a live or
shared process, publish artifacts, alter releases, spend paid API quota, or
continue beyond the minimum local effect needed to establish a defect. If the
decisive fact is outside source or the sandboxed fixture, report it as
needing validation.

## Gotchas

- Prompt injection alone is not a finding; the finding is the deterministic
  control missing between the injected text and the authority or sink it
  reaches.
- One pass never exhausts a target: in the upstream audit's test runs, a
  single run found roughly half of what repeated runs found in total. Never
  call a single review complete.

## Anti-patterns

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
findings. A full audit reports in the format at the end of
`references/security-audit.md` instead.
