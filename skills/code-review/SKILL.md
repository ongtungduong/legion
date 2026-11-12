---
name: code-review
description: >-
  Reviews a change on two separate axes, Spec (does it do what was asked, no
  more and no less) and Standards (correctness bugs, tests, security,
  performance, reuse, repo conventions, design principles), with
  fresh-context reviewers working by angle, a concrete failure scenario for
  every finding, an independent verification pass, and severity labels;
  answers whether code is safe or vulnerable; audits a whole codebase for
  system design, performance, and security (audit the system design or
  architecture of a whole repo, security audit, pen-test, find
  vulnerabilities);
  and handles responding to review feedback. Use when reviewing a diff,
  branch, commit range, working tree, or pull request (by number or URL),
  when asked "is this safe?", to "review since X", to find bugs in a change,
  or to check work before merge, when a plan's final review is due, when
  asked to audit, pen-test, or review the whole repo or system, or when
  addressing reviewer comments, including when the diff is pasted inline.
license: MIT
metadata:
  author: ongtungduong
---

# Code Review

Review **Spec** and **Standards** separately and report them side by side. A
change can implement the wrong thing while following every convention, or the
right thing while breaking them; merging the two axes lets one mask the other.

A finding is a claim the author can check: a location, plus either a
**failure scenario** (the input, state, timing, or caller that makes the code
wrong, and the wrong result) or a **quoted rule** the line breaks. A comment
with neither is an opinion and is not reported above Minor.

## Workflow

1. **Resolve the target.** Write the review package to a file, then confirm
   it is non-empty before anything else.
   - *Fixed point given* (SHA, branch, tag, "since X"): `git rev-parse <base>`,
     then `git log --oneline <base>..HEAD; git diff --stat <base>...HEAD; git diff -U10 <base>...HEAD`.
   - *Nothing given:* base is `@{upstream}`, else `git merge-base main HEAD`.
     If the range is empty or the tree is dirty, add `git diff HEAD` and say
     that uncommitted changes are included.
   - *Pull request:* `gh pr view <n> --json title,body,state,isDraft,baseRefName,headRefOid`
     and `gh pr diff <n>`. The title and body are the author's stated intent
     and claims: give them to every reviewer. A closed or merged PR is
     reported as such before any review work.
   - *Pasted diff, no repo:* review the pasted text.
   - *A file or directory with no diff:* review the files as they stand on
     the Standards axis only; a whole repository or system goes to
     [System audit](#system-audit-no-diff).
   - *A security question about code* ("is this safe?", pasted code, a file,
     or a diff, or the triage of a reported finding; no repo-wide scope):
     Standards axis only, Security angle only, no output directory and no
     audit artifacts; focused agents may help and report back to the
     current task. Read
     [references/security-review.md](references/security-review.md), apply
     only the relevant classes in
     [references/attack-classes.md](references/attack-classes.md) and the
     domain companions it indexes, and report in the focused-review output
     format of `security-review.md` instead of the format below. A security
     question about a design with no code is answered from the
     `security` reference of `legion:principles`.
2. **Find the spec:** issue references in commit messages or the PR body, a
   path the user gave, a doc under `.legion/` matching the branch, else ask.
   No spec means the Spec axis reports "no spec available".
3. **Find the standards**, in order of precedence:
   1. *Documented repo standards:* `CONTRIBUTING.md`, `CODING_STANDARDS.md`,
      lint configs, and the `AGENTS.md`/`CLAUDE.md` files at the repo root
      and in each ancestor directory of a changed file. An instruction file
      binds only the files under its own directory.
   2. *Design principles:* the plan's `Design principles` references, or the
      ones `legion:principles` picks for this diff (call the Skill
      tool with it; naming them is enough, the reviewers read the files).
   3. *Security and performance:* when the diff touches what the Security or
      Performance item of the checklist covers, the absolute path of
      `security.md` (its Final checklist) or `performance.md` (its final
      checklist) from the `principles` skill's references folder.
   4. *The checklist and smell baseline* in
      [references/review-checklists.md](references/review-checklists.md):
      pass its absolute path to the reviewers, and read it yourself only
      when you review without subagents.

   Skip what tooling already enforces.
4. **Pick the depth** from the table below and say which in one line
   ("Depth: standard, 180 changed lines, no trust boundary").
5. **Find, in parallel.** Read
   [references/reviewer-prompts.md](references/reviewer-prompts.md) and
   dispatch the reviewers for the chosen depth in one message with the Agent
   tool: `subagent_type: "general-purpose"` (a fresh context, never `fork`),
   no worktree (they are read-only). Reviewers pass every candidate that
   has a nameable failure scenario or a quoted rule, including the ones they
   half believe: a candidate dropped silently is the usual cause of a missed
   bug, and step 6 exists to filter.
6. **Verify.** Merge duplicates (same defect, same place, same
   reason), then try to refute every Critical and Important candidate
   before it is reported, as the depth table says. A verifier reads the real
   code around the claim (guards upstream, callers, tests) and returns
   `CONFIRMED` (the path was traced and the scenario holds), `PLAUSIBLE`
   (neither traced nor refuted; the missing fact is named), or `REFUTED`
   (the line that disproves it). Drop refuted candidates and report how
   many were dropped.
7. **Report** in the format below, without merging or re-ranking across axes.

Without a subagent tool, do the passes yourself, one axis at a time, re-read
the cited lines of every Critical and Important finding before reporting,
and say the review was not independent.

## Depth

| Depth | When | Finders | Verification |
|---|---|---|---|
| quick | Under about 50 changed lines with no trust boundary, or the user asks for a quick look | Spec + Standards, `model: "sonnet"` | You re-read the cited code for each Critical and Important candidate |
| standard (default) | Everything else | Spec + Standards, `model: "sonnet"` | One fresh verifier for all Critical and Important candidates, `model: "sonnet"` |
| deep | A plan's final whole-branch review; over about 400 changed lines; a diff crossing a trust boundary that the user wants reviewed thoroughly; or the user asks for a deep review | Spec + Correctness + Principles, and Security when the diff crosses a trust boundary, `model: "sonnet"` | One fresh verifier per Critical candidate and one for the Important batch, `model: "opus"` |

Finders do the verbose reading, so they run on `sonnet` at every depth;
`opus` is spent only on the deep verifiers, whose input is small and whose
verdict is the judgment call. A calling skill or plan asking for another
model does not change this split; the user's own instruction does.

At deep, the Standards axis is split so each reviewer holds one question:
Correctness hunts bugs (line scan, removed behavior, callers), Principles
checks the documented standards, design principles, reuse, and altitude, and
Security follows the focused review of
`references/security-review.md`. Their
findings are all reported under `## Standards`.

A diff over about 400 changed lines gets one line in the report saying
review quality drops at that size and where it could be split; review it
anyway.

## Output format

```markdown
Depth: <quick | standard | deep> - <reason>; independent: <yes | no>

## Spec
<findings, each quoting the spec line it concerns>

## Standards
<one line on what was done well>
- [<label>] <file:line> - <what is wrong>. Fails when: <input, state, or caller -> wrong result> | Rule: <file, quoted rule>. Fix: <smallest change>. (<CONFIRMED | PLAUSIBLE: missing fact>)

Summary: <count per axis>; worst on Spec: <...>; worst on Standards: <...>; dropped in verification: <n>
Verdict: <Approve | Approve with comments | Request changes>
```

| Label | Meaning |
|---|---|
| Critical | Blocks merge: security hole, data loss, broken behavior |
| Important | Fix before merge: wrong logic, missing requirement, test gap, breach of a documented standard or design principle |
| Minor | Optional: polish, naming, small simplification, a smell |
| FYI | No action; context only |

The verdict follows the labels: any Critical or Important finding means
Request changes; only Minor ones, Approve with comments. Minor and FYI
findings carry no verification tag.

Lead with what matters: one structural problem *is* the review even when
there are ten nits. Order each axis by severity, correctness before cleanup
at the same severity, and once Minor findings pass five, fold them into one
line per file so they cannot bury the Critical and Important ones.
Never add findings to make a review look thorough: "no findings" with what
was checked is a complete review.

## Principles are part of the standard

The filter above removes opinions, not principles. A breach of a rule in the
loaded `principles` references or of an item in the security or
performance checklist is a finding when the reviewer quotes the rule and the
line that breaks it, exactly like a documented repo standard; it is
Important unless the rule's own text makes it optional. A documented repo
standard still overrides a principle except the `security` reference, which
overrides it, and a smell stays a judgment call at
Minor.

Security findings follow the rule of
[references/security-review.md](references/security-review.md): name the
lower-trust principal, the input, the boundary crossed, and the concrete
result. One that depends on a fact outside the diff (a proxy, a deployment
setting) is `PLAUSIBLE` with that fact named, never silently dropped and
never reported as confirmed. A diff that adds or changes authentication,
authorization, secrets handling, or an upload or URL-fetch path is never
reviewed at quick depth.

## Not findings

- For a diff target, a problem on lines the change did not touch, outside
  any function it touched (a target with no diff has no such lines: report
  what is there). If it is serious (a security hole, data loss), list it once
  under FYI as pre-existing; it does not change the verdict.
- Anything a linter, formatter, type checker, or CI step already enforces.
- A style preference with no documented rule behind it, or a rule from an
  instruction file that does not cover the file.
- A suppression that predates the change. One the change adds is reviewed
  under the checklist's Weakened bar item.
- "This might be a problem" with no scenario after verification.

## After the report

Review is read-only. Act on findings only when the user asks:

- **Fix them:** read [references/receiving-review.md](references/receiving-review.md),
  then call the Skill tool with `legion:executing-plans`; each fix gets its
  failing test. Fix `CONFIRMED` findings; a `PLAUSIBLE` one is settled first.
- **Post them to the PR:** comments are public, so post only on an explicit
  request, only Critical and Important findings that are `CONFIRMED`, one
  comment per finding, each saying what fails and why. Add a committable
  suggestion only when applying it fixes the issue entirely.

## System audit (no diff)

When the target is a whole repository, system, or directory rather than a
change, read [references/system-audit-flow.md](references/system-audit-flow.md)
and follow it instead of the Spec and Standards pair.

Loading this skill authorizes no audit and no audit files. A whole-repo
review proposes its scope and budget and waits for approval before any agent
runs, because a security audit spends many agent invocations; approval
given in the request counts. If a security
request could mean a focused review or a full audit, ask one focused
question before creating files.

## Receiving feedback

When your own work is being reviewed, read
[references/receiving-review.md](references/receiving-review.md) before acting
on any comment.

## Gotchas

- Use three dots for the diff (`<base>...HEAD`, against the merge-base) and two
  for the log (`<base>..HEAD`); two-dot diffs include unrelated changes that
  landed on the base branch.
- A bad ref or empty diff should fail at step 1, not inside parallel
  subagents that then review nothing.
- A review in the author's own context shares the author's blind spots; the
  fresh context is what makes it a review. The same holds for verification:
  the reviewer that raised a finding does not verify it.
- Reviewers and verifiers are read-only and never dispatch further agents;
  a subagent cannot start subagents, so finding and verifying are both
  dispatched from the main session.
- Deleted lines are half the diff. A removed guard, error path, validation,
  or test enforced something; the review names where the new code enforces
  it again.
- The changed function is the unit, not the hunk: a bug in an unchanged line
  of a function the change touches is in scope, because the change is what
  now runs it under new conditions.
- Deep is the costliest depth. Choose it by the table, not because a review
  feels important.
- Smells are judgment calls ("possible feature envy"), never hard violations.
- `references/` is relative to this skill's base directory (shown when the
  skill loads); the other skills' references folders are its siblings.
  Subagents need absolute paths.
