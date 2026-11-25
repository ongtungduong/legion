---
name: security-audit
description: >-
  Hunts security vulnerabilities that cross a real trust boundary in code and
  systems: maps the attack surface and trust boundaries, hunts by a
  deterministic coverage ledger with isolated subagents, gives every candidate
  to a fresh verifier that tries to disprove it, and writes validated
  findings.json plus REPORT.md with severity, source trace, safe local
  reproduction, and the smallest fix. Gives focused guidance on specific code
  or a reported flaw without writing files. Use when asked to security audit
  or pen-test a codebase, find vulnerabilities, review a service, API, CLI, library, daemon,
  auth flow, or LLM agent for security, check whether something is exploitable
  (injection, XSS, SSRF, IDOR, auth bypass, path traversal, deserialization,
  prompt injection, supply chain, tenant isolation), triage a reported
  vulnerability or scanner finding, rate its severity, or re-run an audit to
  cover gaps, even when the code is pasted inline and the flaw looks obvious.
license: MIT
metadata:
  author: ongtungduong
---

# Security Audit

Find vulnerabilities that violate a real trust boundary, then give owners the source evidence, safe reproduction, priority, and smallest effective fix. This is a defensive, source-first workflow. A candidate without a concrete affected principal, resource, or security outcome is not a confirmed finding.

## Operating modes

This skill is guidance by default. Loading it does not authorize the complete audit workflow or file creation.

- **Guidance mode**: For security questions, focused reviews, methodology, triage, or investigation of specific findings, use only the relevant parts of this skill and its references. A scanner alert or package-audit report is a list of candidates: triage it with "Advisory and scanner triage" in `references/supply-chain-and-release.md`. Do not automatically run all six phases, create an output directory, or write audit artifacts. You may launch focused subagents when useful; they return results to the current task.
- **Full audit mode**: Use the complete workflow when the user explicitly asks to audit or pen-test a codebase, asks for a full, comprehensive, or end-to-end security review, or requests report artifacts. Run all six phases and write the files defined below.

If the request could mean either mode, ask one focused question before creating files or starting the complete workflow: a full audit spends many agent invocations and writes files the user did not ask for.

## Delegation

- **Parent** is this session's agent. It coordinates the run and is the only writer of shared state.
- Every delegated agent is a fresh `general-purpose` subagent started with the Agent tool, never a fork, and receives only the prompt its phase defines. Independence is the point: the agent that checks a finding is never the one that found it.
- **`research` role**: focused source exploration and factual verification; it never runs target code.
- **`general` role**: broad investigation plus bounded local execution inside the sandbox below.
- **`(role: ...)`** on a heading or attack class in a reference names which role runs that work.

Set each subagent's tier from the tier table in `legion:find-skills`:

| Work | Role | Tier |
|---|---|---|
| Reconnaissance agents (Phase 1), coverage critics (Phase 2) | `research` | `standard` |
| Hunters (Phase 2) | `general` | `session` |
| Candidate verifiers (Phase 3), record verifiers (Phase 5) | `general`, `research` | `top` |

Verifiers decide what the user is told is confirmed, so they never run below the session's model. If this session cannot start subagents, full audit mode cannot keep its independence guarantee: say so and offer guidance mode instead.

## Universal execution safety

These rules apply in both operating modes. Source inspection is read-only. Run target-controlled builds, tests, processes, browsers, emulators, fuzzers, and fixture processing only inside an OS-enforced sandbox that provides all of these controls:

- no external network; use only an isolated loopback namespace when the check needs local client/server traffic;
- an empty environment populated from an explicit allowlist with safe values, with scratch-local `HOME`, temporary directories, and caches;
- a read-only target and toolchain, with the target-controlled process able to write only inside its assigned `scratch/` directory; and
- explicit low CPU, memory, process, file-size, disk, and wall-clock limits.

The agent, outside the target-controlled process, may make a disposable source copy in an assigned `scratch/` directory when a build must write beside source. In guidance mode, do not retain target-controlled files. In full audit mode, only trusted parent-side code may promote the minimum non-secret result to retained `artifacts/` using the procedure under Write isolation. Never expose a retained output directory (other than the agent's own assigned `scratch/`), another agent's directory, the host home directory, credentials, sockets, or shared services to target code. Do not install dependencies or let builds fetch them. Use only tools and dependencies already available locally. If every control cannot be enforced, do not execute target code: report the missing sandbox capability as a needs-validation blocker and give a safe validation plan.

Use dummy principals, fixtures, and secrets. Do not probe deployed endpoints, external services, shared infrastructure, production identities, other users' data, or live control planes. Do not test availability against a live or shared process, publish artifacts, alter releases, spend paid API quota, or continue beyond the minimum local effect needed to establish a defect. If the decisive fact is outside source or the sandboxed fixture, report it as needing validation.

## Full audit setup

In full audit mode, resolve these values before reconnaissance:

- **Skill directory** (`<skill-dir>` in the references): the absolute directory containing this `SKILL.md`.
- **Target**: the absolute repository root under review.
- **Repo name**: a stable repository identifier from the directory or local Git remote.
- **Output directory** (`<output-dir>`): a new writable directory outside the target, defaulting to `~/.legion/security-audit/<repo-name>/run-<N>`, where `<N>` is the next unused integer. Findings describe exploitable flaws, so they stay out of version control and out of reach of target code. Use a directory inside the target (such as `.legion/runs/security-audit/run-<N>`) only when the user explicitly selects it and the parent verifies that version control ignores the whole directory. Otherwise stop and request an external path.
- **Source ref**: the reviewed commit and whether the worktree is dirty. Do not treat unreviewed generated or modified files as another revision.

### Write isolation

The parent creates and is the only writer of shared run files: `run-metadata.json`, `architecture.md`, `coverage-ledger.json`, `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, and `NEEDS-VALIDATION.md`.

Each hunter or verifier receives a unique root under `<output-dir>/agents/<agent-id>/`, with separate `scratch/` and `artifacts/` directories. Canonical agent IDs match `^[a-z0-9][a-z0-9_-]{0,63}$` and must not equal a Windows device name such as `con`, `prn`, `aux`, `nul`, `com1` through `com9`, or `lpt1` through `lpt9`. Lowercase IDs prevent case-fold collisions. The agent and every target-controlled process may write only to `scratch/`; retained `artifacts/` is parent-owned, is never exposed to the sandbox, and is writable only by trusted parent-side promotion code. Agents may not change shared files, target source, retained artifacts, or another agent's directory. Do not use `/tmp` or the host home directory as a writable fallback.

The parent promotes a scratch file to `artifacts/` only by the artifact promotion procedure: the fenced block under "Promotion procedure" in `references/hunting.md`, which `references/validation-and-reporting.md` repeats verbatim for verifier prompts. Read it before the first promotion; never recursively copy, glob, or extract scratch, and never promote a symlink or special file. If any check is unavailable, cannot be enforced, or fails, discard the scratch entry; if it is decisive evidence, retain `needs_validation` with the exact promotion blocker.

For a reproduced check, record the command, exact test input, sandbox limits, and only the allowlisted environment variable names plus safe non-secret values needed to reproduce it. Never capture or copy the ambient environment, inherited variables, credential values, authentication state, or unrelated host paths. Launch from an empty environment rather than trying to redact one after execution.

Before delegation, the parent writes `run-metadata.json` with at least `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget` (null if unset), `execution_policy: "sandboxed-source-and-local-only"`, selected companion files, prior-run paths, shared-file owners, and `run_status: "in_progress"`. Update metadata only when those facts change; candidate state belongs in the coverage ledger and `findings.json`.

## Full audit planning

### Coverage and prior runs

No one pass is complete. Build a deterministic coverage plan before hunting and update it after every agent result. `references/reconnaissance.md` defines the stable coverage units and `references/hunting.md` defines coverage-critic waves. The parent alone updates the ledger.

If prior runs exist, read every compatible `coverage-ledger.json` and `findings.json` (under the output directory's parent by default) before planning the current run, and carry, revalidate, or reopen each prior record and unit as "Prior-run input" in `references/reconnaissance.md` defines. The invariants:

1. Compare the relevant current source with each prior record and unit. A prior source ref alone is not evidence that a path is unchanged.
2. A prior `confirmed` record is carried only when its relevant source and conditions are unchanged, and it still goes through current final verification; changed source makes it a revalidation unit, not a hunter exclusion.
3. Prior `needs_validation`, `deferred`, `blocked`, `out_of_scope`, and changed-source units become current work and never suppress a current unit. A prior `rejected` record suppresses only the unchanged failed claim, not coverage of its unit.
4. Read the prior profile and scope. A prior `quick` or scoped ledger contributes only its recorded evidence and gaps, never an implied "rest is fine."

If no prior ledger exists, say so in the final coverage statement. Never imply that one run exhausts the target.

### Run profiles and scope

During full audit setup, pick a profile from the user's request or propose one from the target's size and stakes. Record it in `run-metadata.json` (`profile`, `scope_paths`) and state it in the report. The default is `standard`.

- **`quick`**: a bounded pass for small targets, re-runs, or a fast first look. Coarsen ledger units to surface × boundary × attack class (subsystem uses the fixed canonical `profile/quick/all-in-scope-subsystems` identifier), run exactly one hunter wave followed by exactly one final coverage-critic pass, and use one fresh verifier per candidate for both candidate validation and final record verification. Do not launch a follow-up hunter wave: record the critic's accepted discoveries and reassignments as `deferred`.
- **`standard`**: the workflow as written.
- **`deep`**: for high-stakes or large targets. Split ledger units per subsystem and lifecycle mode, run critic waves to a clean pass, keep candidate validation and final record verification as separate fresh agents, and give `prior_covered_same_source` units an independent second pass.

A **scoped run** audits a subset: named paths, one subsystem, one companion domain, or the diff between two source refs. Seed ledger units only for in-scope surfaces and record everything else as `out_of_scope`, never as `covered`. A scoped or `quick` run must present itself as partial coverage.

Profiles change breadth and redundancy, never the evidence bar. Do not scale away the candidate gate, the source/local execution boundary, `needs_validation` discipline, schema validation, or independent verification of `confirmed` records.

### Cost budget

When the user sets a budget, or the parent proposes one for a large target, record `budget` in `run-metadata.json` as a maximum number of agent invocations across all phases. With a budget set, read `references/budget.md` before launching the first reconnaissance agent: it holds the strict budget gate, the order of reserves, and the incomplete-run reasons. Never exceed a user-set strict budget silently.

## Core principles

### Require a boundary and result

For every candidate, name the lower-trust principal, accepted input or action, intended control, crossed boundary, affected principal or resource, and concrete observed or owner-observable result. Do not elevate a missing best practice, guessed deployment behavior, generic parser crash, or self-impact into a security finding.

### Use bounded local evidence

Static analysis establishes the source path. Sandboxed local tests resolve behavior when all execution controls are available: a minimal function harness, existing unit test, small parser fixture, dummy-tenant integration test, locally rendered configuration, or bounded isolated-loopback client. Stop at a wrong return value, unauthorized dummy record, sanitizer finding, policy difference, or other minimum effect. Do not extend the local check beyond the minimum boundary result or produce persistence, post-fault, or concealment material.

### Respect source visibility

Deployment controls, proxy behavior, provider settings, browser headers, identity policy, broker ACLs, packaging, and topology are real controls. If they are required and absent from the repository, do not assume either presence or absence. Use `needs_validation` with the exact missing fact and a safe owner-observed or local plan.

### Separate priority from certainty

Only `confirmed` records receive severity. Likelihood and impact must reflect the demonstrated conditions and result; overall severity cannot exceed demonstrated impact. `needs_validation` means a specific source-grounded boundary hypothesis is blocked, not a low-confidence confirmed vulnerability, and it has no severity.

Calibrate overall severity with these anchors:

- **critical**: an unauthenticated actor gains code execution, full data-store access, or takeover of arbitrary accounts.
- **high**: an actor fully defeats an explicit security control with real consequences: authentication bypass, cross-tenant read or write, stored script execution affecting other users, authenticated code execution, or an unauthenticated remote stop of a shared service.
- **medium**: a real boundary violation with limited blast radius, uncommon preconditions, or consequences confined to a narrow resource set.
- **low**: disclosure of non-secret internals, or an effect requiring sustained effort for minimal gain.
- **informational**: a confirmed but minimal-impact observation, useful mainly as a prerequisite inside a larger finding.

The high/medium discriminator: does the demonstrated result fully defeat an explicit control for an action with real consequences, or only weaken it? If you cannot state the concrete damage, the severity is lower than it feels.

### Recommend the smallest effective source fix

For each confirmed finding, identify the invariant the code must enforce and the narrowest source change that enforces it at the last trusted decision point. Prefer specific repository-relative changes and regression tests over generic hardening advice. The audit describes fixes; it does not modify target source.

## Full audit workflow

In full audit mode, follow all six phases in order:

1. **Reconnaissance**: map the source, trust boundaries, local build paths, companion selections, prior evidence, and initial deterministic coverage ledger. Read `references/reconnaissance.md` before launching any agent.
2. **Coverage-led hunting waves**: assign isolated hunters from the ledger and collect structured candidate results. Read `references/hunting.md` and `references/attack-classes.md` before the first wave; `references/attack-classes.md` names the domain companion files that reconnaissance selects (memory safety, AI and LLM, web protocol and auth, client side, supply chain, cloud, protocols and messaging, resource exhaustion, data isolation, desktop and mobile). Read only the selected companions.
3. **Candidate validation**: consolidate fingerprints and give every candidate to a fresh source verifier. Read `references/validation-and-reporting.md` here; it covers Phases 3 to 6.
4. **Structured output**: write all final `confirmed`, `needs_validation`, and `rejected` records to `findings.json`; it must conform to `assets/report-schema.json`. Run `node <skill-dir>/scripts/validate-findings.cjs <output-dir>/findings.json` and `node <skill-dir>/scripts/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json`, and fix every error.
5. **Independent record verification**: use fresh agents to verify final source claims and reconcile corrections or state changes; re-run both validators after every replacement.
6. **Target-neutral report**: derive `REPORT.md`, `FINDINGS-DETAIL.md`, and `NEEDS-VALIDATION.md` from the final records, with no live-probe instructions.

Do not end the run before one of exactly two terminal states: (a) all Phase 6 artifacts are written and both validators pass, or (b) `run_status: "incomplete"` is recorded with its exact reason and the gap is disclosed in the report. Never stop mid-phase: a half-finished run reads as coverage it does not have.

## Gotchas

1. Checklist deviations presented as vulnerabilities.
2. Defense-in-depth advice with no reachable boundary violation: if Layer A prevents the attack, the absence of Layer B is a hardening note.
3. Live or shared-environment testing where bounded local evidence is insufficient.
4. Guessing provider, proxy, browser, identity, or deployment behavior not present in source.
5. Treating intended same-principal authority or self-impact as a cross-boundary result.
6. Reporting a parser or runtime effect stronger than the observed effect.
7. Emitting prose-only hunter results that cannot be deduplicated or verified.
8. Re-reporting carried same-source prior confirmed records or using them as exemplars that anchor the hunt.
9. Assigning severity to `needs_validation` records.
10. Writing the report before independent verification or letting prose and JSON disagree.
11. Calling one run complete: in the upstream authors' runs one run found about half of what repeated runs did, so the coverage statement names what was not covered.
12. Copying a found secret's value into a result, artifact, report, or the conversation: cite `path:line` and the key type. A secret that reached a remote is compromised, so its fix revokes and reissues it first.

## Output format

- **Guidance mode**: answer in the conversation. For each finding give the boundary and result (principal, input, intended control, crossed boundary, affected resource, observed result), the source trace as repository-relative `path:line`, the verdict (`confirmed` with severity, or `needs_validation` with the exact unresolved fact), and the smallest fix.
- **Full audit mode**: the files in `<output-dir>` listed under Write isolation, whose sections `references/validation-and-reporting.md` defines. In the conversation, report the output directory, profile and scope, counts by verdict and severity, the top findings, the coverage gaps, and whether both validators passed.
