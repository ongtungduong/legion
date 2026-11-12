# System audit (no diff)

Read this when the target is a whole repository, system, or directory rather
than a change. Skip the Spec and Standards pair: there is no change to judge.
A request to find bugs (logic) across the whole repo is out of scope: say
so and offer a diff review or a review scoped to named files.

1. **Scope.** Name the paths, modules, and entry points. Read the repo's
   standards and baseline: ADRs, `docs/`, budgets, earlier audit runs.
2. **Axes.** All three when none is named (system design, performance,
   security); only the named ones otherwise. Partition by module when the
   repo is large.
3. **Propose, then wait.** Send one proposal before any agent runs: the
   axes, the partitions, the agent count, the security profile (from
   `references/security-audit.md`), and the output directory. Approval
   given in the request ("scope and budget are approved") counts; without
   it, stop after the proposal.
4. **Run**, however small the repo: a two-file app gets the same headings
   with short bodies, because a request for several audits that gets one
   merged list leaves the reader unable to tell what was checked for each.
   - **System design and performance:** dispatch the auditors with the
     Agent tool, `subagent_type: "general-purpose"` (a fresh context, never
     `fork`), no worktree, `model: "sonnet"`, one per axis per partition,
     all in one message. Each is told to read and follow its reference of
     this skill (absolute path): `references/system-design-audit.md` or
     `references/performance-audit.md`. Give each the scope (paths, entry
     points) and cap its report at 600 words. The system-design auditor
     also gets the absolute path of `references/system-design.md` of the
     `principles` skill; the performance auditor gets the absolute paths of
     `performance.md` and `performance-web.md` from the same folder.
   - **Security:** read `references/security-audit.md` of this skill and run
     its full audit yourself (it dispatches its own hunters and verifiers;
     a subagent cannot start subagents, so it never runs inside an auditor
     subagent). Use the profile and budget from the proposal.
5. **Verify.** One fresh `opus` verifier per Critical system-design or
   performance candidate, and one for the Important batch. Security keeps
   its own verification phases.
6. **Report** under `## System design audit`, `## Performance audit`, and
   `## Security audit` (its Report summary, with the output directory), in
   that order and only for the axes run, keeping each one's findings table
   and Not checked, then one line with the count per severity. Security
   severities count as Critical (`critical`, `high`), Important (`medium`),
   Minor (`low`), and FYI (`informational`); its `needs_validation` leads
   are counted separately, never as findings.

Without a subagent tool, run the system-design and performance audits
yourself and a focused security review (`references/security-review.md`),
and say that none was independent and the security review was not a full
audit.
