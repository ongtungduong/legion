# Full Audit Setup and Planning

Read this in full audit mode, before reconnaissance: it holds the values to resolve, the write-isolation rules every agent works under, coverage and prior runs, run profiles and scope, and the cost budget. Guidance mode does not need it.

## Full audit setup

In full audit mode, resolve these values before reconnaissance:

- **Skill directory** (`<skill-dir>` in the references): the absolute directory containing this skill's `SKILL.md`, one level above this file.
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
