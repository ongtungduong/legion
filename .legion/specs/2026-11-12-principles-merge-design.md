# Principles Merge and Three-Axis System Audit Design

## Intent
Legion has one standard for code: system design, coding, performance, and
security, applied to new code (greenfield) and to changes in existing code
(brownfield). The skill that holds it is `principles`. `security-principles`
is removed: its standards move into `principles`, and everything that checks
code (focused security review, full security audit, every system audit)
moves into `code-review`. A review of a whole codebase covers three axes:
system design, performance, and security.

Why: the maintainer wants a single standard that the chain (writing-plans,
executing-plans, code-review) applies everywhere, and a single place that
verifies code against it, for a diff or for a whole repository. This
continues the 0.12.0 direction, which folded `performance-principles` into
`coding-principles`.

## Goals / Non-goals / Anti-goals
- Goals:
  - `skills/principles/` holds the standards: `system-design`, `coding`,
    `coding-existing-code`, `performance`, `performance-optimization`,
    `performance-web`, and a new `security` reference.
  - Security comes first in the precedence order of `principles`.
  - `code-review` owns every check: diff review (unchanged axes), focused
    security review ("is this safe?"), and the system audit (no diff) on
    three axes: system design (new), performance, and security.
  - Brownfield rule stated once: code you write or change meets every loaded
    standard; untouched code is reported, never rewritten unasked.
  - Version 0.13.0, every check green, affected behavioral evals re-run and
    recorded.
- Non-goals:
  - A whole-repository correctness (logic) or coding-style audit. A request
    to "find bugs in the whole repo" is answered by saying it is out of
    scope and offering a diff review or a scoped review instead.
  - An alias or stub for `legion:security-principles` or
    `legion:coding-principles`.
  - Changing the diff review's Spec and Standards axes.
  - Build mode reading the attack-class companions (it does not today).
  - Running behavioral evals in CI (roadmap item 2).
- Anti-goals:
  - Security fires less often than today: a trust-boundary change, even an
    XS one, no longer loads the security standard, or "is this safe?" no
    longer reaches a security review.
  - A multi-agent audit starts on a trigger match, before the user approved
    its scope and budget.
  - The system-design audit reports opinions or proposes rewrites without a
    quoted rule and a concrete consequence.
  - The per-task token cost of the quick path rises (an XS change with no
    trust boundary loads more than it does in 0.12.5).

## First principles
- Goal (no solution words): code is designed and written right and secure
  from the start, and the same standard is checked on any change and on a
  whole system.
- Must be true:
  - `description` is at most 1024 characters (agentskills.io spec,
    `skills/skill-creator/references/specification.md`). Today:
    `coding-principles` 878, `security-principles` 709, `code-review` 805.
  - `SKILL.md` under 20,000 bytes (`AGENTS.md`). Today: `code-review`
    13,821; `coding-principles` 7,083; `security-principles` 7,172.
  - Skills do not link to another skill's files; text that names another
    skill's file by absolute path for a subagent is the existing pattern
    (`code-review/SKILL.md` step 3.3, `reviewer-prompts.md`).
  - A subagent cannot start subagents, so the security audit runs in the
    main session (`security-principles/references/audit.md`).
  - Build mode of `security-principles` reads only its `SKILL.md` and
    `security-checklist.md`. `review.md`, `attack-classes.md`, the ten domain
    companions, the phase files, and `scripts/` are read only by guidance
    reviews and the full audit (`security-principles/SKILL.md`, Modes).
  - `validate.mjs` requires every `skills/*/references/audit.md` to end in
    the same report skeleton.
  - 32 files outside `.legion/` name `security-principles` (router, README,
    four other skills, reviewer and implementer prompts, five behavioral eval
    cases, trigger evals, `tests/security-audit/`, docs).
- Assumptions questioned:
  - "Security knowledge must sit with the standards" -> dropped: the attack
    classes and companions are hunting material, read only when checking
    code. They move with the audit, so the audit reads nothing across skills
    except the checklists, which removes the cost that made 0.12.4 reject a
    split.
  - "A whole-repo review needs a logic axis" -> dropped by the maintainer:
    with no spec there is no oracle, and the cost is the largest of all axes.
  - "Security overrides the user" -> dropped by the maintainer (choice 1a):
    the user's insistence still wins, after one warning.
- System touched: router map, README, `writing-plans`, `executing-plans`
  (quick path, plan workflow, implementer and task-reviewer prompts),
  `systematic-debugging` (fix pointers), `code-review` (SKILL, prompts,
  checklists), `scripts/validate.mjs`, `tests/`, `evals/`, `docs/`,
  `THIRD_PARTY.md`, `CHANGELOG.md`, the three version fields.

## Approaches

| | A: everything into `principles`, audit entered via `code-review` | B: standards into `principles`, every check into `code-review` |
|---|---|---|
| Roles | `principles` hosts a pen-test pipeline beside design rules | One skill says how to write, one checks |
| Cross-skill reads | None | Only the checklists (already the pattern) once the attack material moves too |
| Churn | Low | Higher: scripts, tests, and 17 files move |
| `code-review` size | Unchanged | Grows; the system audit section moves to a reference to stay well under 20 KB |
| Triggers | "audit", "pen-test" in `code-review`; "is this safe" in `principles` | All checking words in `code-review`; `principles` keeps building words |

Chosen: B (maintainer's decision), with all security review and audit
material moving to `code-review`, because it gives a clean write/check split
and keeps the audit's 200 KB of material next to the procedure that reads it.
Wrong if: build mode turns out to need the attack-class companions while
designing (for example an OAuth flow); then `principles/references/security.md`
names the companion's path in `code-review` for that case.

## Design

### Decisions from the grilling rounds
1. Name: `principles`, invoked as `legion:principles` (maintainer).
2. Precedence (maintainer, 1a): security reference > documented repo
   conventions > other references > smell baseline. A user's request to drop
   a security control keeps the cheap control with a one-line reason; the
   control is dropped only if the user insists after that. The router's
   "user instructions win" stays as is. Wrong if: Legion is used as a team
   policy that must block individual overrides.
3. Approach B (maintainer).
4. "Is this safe?" and a focused security review of code go to `code-review`
   (maintainer, 2a). A security question about a design with no code yet is
   answered from `principles/references/security.md`. Wrong if: these
   questions mostly arrive before code exists.
5. System audit axes: system design, performance, security (maintainer).

### `skills/principles/`
- `SKILL.md` (target under 10 KB): the current `coding-principles` workflow,
  with step 4 "Secure by design" now loading `references/security.md`
  instead of another skill; the precedence order (decision 2); the brownfield
  rule (my call): code written or changed meets every loaded reference,
  pre-existing violations in untouched code are reported as FYI and fixed
  only when asked. The audit row and the "performance-only audit" trigger
  leave this skill.
- Reference table (my call): the existing six non-audit references keep
  their names; add `security` with the trigger "crosses a trust boundary
  (untrusted input, auth, sessions, secrets, uploads, user-supplied URLs,
  third-party packages, personal data, LLM output), whatever the size".
- `references/security.md` (my call): the build-mode workflow of
  `security-principles` (trust boundaries, assets, STRIDE, abuse cases as the
  first test, fix order), its Boundaries (always / ask first / never), its
  Gotchas, and ending in the final checklist that is today
  `security-checklist.md`. One file, like the other topics, so implementers
  and reviewers get one path.
- `references/audit.md` leaves (to `code-review`).
- Output format: the `Security:` line becomes part of `Checklist:` (one gate
  for all loaded references), and a `Principles:` line names `security` when
  loaded.
- Description (at most 1024 characters): what (four standards), then when:
  designing, refactoring, legacy code, making code faster, and writing code
  that crosses a trust boundary. Checking words ("audit", "pen-test", "is
  this safe", "find vulnerabilities") are dropped from it.

### `skills/code-review/`
- Moved in, under `references/` (my call on names, one level deep):

  | From | To |
  |---|---|
  | `coding-principles/references/audit.md` | `performance-audit.md` |
  | `security-principles/references/audit.md` | `security-audit.md` |
  | `security-principles/references/review.md` | `security-review.md` |
  | `reconnaissance.md`, `hunting.md`, `validation-and-reporting.md`, `attack-classes.md`, the ten domain companions | same names |
  | `security-principles/scripts/*` | `code-review/scripts/*` |
  | new | `system-design-audit.md` |
  | new | `system-audit-flow.md` (the orchestration, moved out of `SKILL.md`) |

- `SKILL.md`:
  - Step 1 targets gain *A security question about code* (pasted, a file, or
    a diff): run the focused security review of `references/security-review.md`
    (guidance format, no output directory), Security reviewer only.
  - *A whole repository or system* goes to `references/system-audit-flow.md`.
  - The mode gate moves here: loading the skill authorizes no audit; a
    whole-repo review proposes its scope and budget and waits for approval
    before any agent runs; an ambiguous security request gets one focused
    question before any file is written.
  - Diff review: Security finders read `security-review.md`,
    `attack-classes.md`, and `principles/references/security.md`'s checklist
    instead of the old paths. Spec and Standards axes are unchanged.
- `references/system-audit-flow.md` (my call on the procedure):
  1. Scope: paths, modules, entry points; repo standards and baseline
     (ADRs, `docs/`, budgets, prior audit runs).
  2. Axes: all three when none is named; only the named ones otherwise.
     Partition by module when the repo is large.
  3. Proposal: axes, partitions, agent count, security profile (from
     `security-audit.md`), output directory. Wait for approval.
  4. Run: system-design and performance auditors as `general-purpose`
     subagents on `sonnet`, one per axis per partition, dispatched in one
     message; the main session runs the security phases itself.
  5. Verify: one fresh `opus` verifier per Critical design or performance
     candidate and one for the Important batch (as deep review does);
     security keeps its own verification phases.
  6. Report: `## System design audit`, `## Performance audit`,
     `## Security audit`, each with its findings table and Not checked, then
     one line with counts per severity (security mapped as today:
     critical/high -> Critical, medium -> Important, low -> Minor,
     informational -> FYI; `needs_validation` counted apart).
- `references/system-design-audit.md` (my call on the bar): read
  `principles/references/system-design.md`; map modules, dependency
  direction and cycles, owners of rules and state, sources of truth, data
  stores, external calls and their failure handling. A finding quotes a rule
  of that file's final checklist and names a concrete consequence: a failure
  scenario ("when the payment API times out, the order stays pending
  forever"), a consistency scenario (two sources of truth that diverge
  when ...), or a change scenario ("adding a field touches seven modules").
  No consequence: at most Minor. Severity: Critical = data loss or
  inconsistency, or an outage at current load; Important = breaks under the
  expected growth or a likely failure; Minor = a smell; FYI = context. Fixes
  are the smallest change that restores the rule, never a rewrite proposal
  without its cost. Report in the shared skeleton.
- Description (at most 1024 characters): gains "is this safe", "security
  audit", "pen-test", "find vulnerabilities", "audit the system design /
  architecture of the whole repo"; trimmed elsewhere to fit.

### Rest of the chain
- Router: one row for `legion:principles` (designing, refactoring, faster
  code, code crossing a trust boundary); the `code-review` row gains
  security questions, pen-test, vulnerability hunt, and whole-repo audits on
  any of the three axes; the security row is removed; the flow diagram says
  `principles (design, code, performance, security)`.
- `executing-plans` quick path: loads `legion:principles`; the `security`
  reference loads on any trust-boundary change, including XS; performance
  still skips XS; "Review if risky" keys on the `security` reference.
- `writing-plans` and `plan-template.md`: `Design principles`, `Security`,
  `Performance` lines keep their names (my call: less churn, an eval checks
  the Security line) and point at `legion:principles` references.
- `systematic-debugging`, implementer and task-reviewer prompts,
  `reviewer-prompts.md`: new skill name and paths.
- `scripts/validate.mjs`: the skeleton rule compares
  `skills/code-review/references/*-audit.md` (performance, security, system
  design); `tests/scripts/` gets the matching failing-copy case.
- `tests/security-audit/`: requires from `skills/code-review/scripts/`.
- Docs: README skill table; `docs/architecture.md` gains a 0.13.0 section
  that records this decision and marks the 0.12.4 section as superseded;
  `THIRD_PARTY.md` provenance paths; `CHANGELOG.md` with the breaking
  rename; `docs/evals.md` with the new run.
- Versions: `package.json`, `plugin.json`, `marketplace.json` -> 0.13.0.

### Evals
- Triggers: `coding-principles.json` -> `principles.json` (gains the build
  prompts of `security-principles.json`); the checking prompts of
  `security-principles.json` move to `code-review.json`; the file is removed.
- Behavioral (my call on renames; graders change only in the skill they
  name, never in their pass bar):

  | Case | Becomes |
  |---|---|
  | `coding-principles-*` (5) | `principles-*` |
  | `security-principles-fires-on-is-this-safe` | `code-review-fires-on-is-this-safe` |
  | `security-principles-holds-under-internal-pressure` | `principles-holds-security-under-pressure` |
  | `security-principles-stays-quiet-on-glossary-rename` | merged into `principles-stays-quiet-on-glossary` if the prompts overlap, else renamed |
  | `executing-plans-loads-security-on-auth-change` (+ `-hard`) | grader: `legion:principles` loaded and `security.md` read |
  | `security-audit-on-system`, `code-review-runs-system-audit` | graders expect the three headings |
  | new | `code-review-runs-design-audit`: a fixture with two sources of truth; the report names it with a quoted rule |

## Commands
```bash
npm test
npm run validate
npm run validate:spec
npm run evals:triggers
claude plugin validate . --strict
claude plugin eval . --no-publish   # affected cases; record model and Claude Code version
```

## Testing strategy
- Static: `validate.mjs` (links, `legion:` refs, router and README coverage,
  sizes, versions, skeletons), `validate:spec` (frontmatter, 1024-character
  descriptions), `evals:triggers` (rank and near-duplicate checks), and the
  moved `tests/security-audit/` suites prove the move is complete and
  consistent.
- `tests/scripts/`: the changed skeleton rule fails on a copy where one
  `*-audit.md` skeleton differs.
- Behavioral: the cases in the table above prove that triggering did not
  regress (security on an auth change, "is this safe", pressure) and that
  the new design audit produces a rule-backed finding. Bar as in 0.11.0: a
  case passes at 2 of 3 runs; quality graders beat the no-plugin arm.

## Boundaries
- Always: `git mv` for moved files so history follows; run `npm test` after
  each slice; keep every rule's text when moving it, unless the move makes
  it wrong.
- Ask first: dropping a rule or gotcha during the merge; deleting an eval
  case instead of renaming it; any grader change beyond the skill name and
  headings; spending more than the 0.12.0 full-suite cost on evals.
- Never: loosen a grader to pass; copy content from claudekit-engineer;
  leave `security-principles` or `coding-principles` named outside history
  (`CHANGELOG.md`, `docs/architecture.md` past sections, `.legion/` specs
  and plans).

## Non-functional
- Security: no product trust boundary. The risk is behavioral: weaker
  security triggering. Covered by the auth-change, is-this-safe, and
  pressure cases.
- Performance: token cost per task. The quick path for an XS change with no
  trust boundary loads no more than in 0.12.5; `principles/SKILL.md` under
  10 KB; `code-review/SKILL.md` stays near its 0.12.5 size because the
  system audit moves to a reference.

## Success criteria
1. `skills/security-principles/` and `skills/coding-principles/` do not
   exist; `skills/principles/` does.
2. `grep -rn "security-principles\|coding-principles" skills hooks scripts tests evals README.md THIRD_PARTY.md`
   prints nothing.
3. `npm test` and `claude plugin validate . --strict` pass.
4. Every description is at most 1024 characters and every `SKILL.md` under
   20,000 bytes (enforced by the validators).
5. `npm run evals:triggers`: every positive prompt of `principles.json` and
   `code-review.json` ranks its skill in the top 3; no near-duplicates.
6. The behavioral cases in the Evals table pass the 0.11.0 bar; results are
   logged in `docs/evals.md` with model and Claude Code version.
7. A whole-repo review with no axis named proposes scope and budget first,
   then reports exactly three audit headings.

## Open questions
None blocking planning.
