# System audit (no diff)

Read this when the target is a whole repository, system, or directory rather
than a change. Skip the Spec and Standards pair: there is no change to judge.
Run the two audits side by side, however small the repo: a two-file app gets
the same two headings with short bodies, because a request for "both audits"
that gets one merged list leaves the reader unable to tell what was checked
for each:

- **Performance:** dispatch one auditor with the Agent tool,
  `subagent_type: "general-purpose"` (a fresh context, never `fork`), no
  worktree, `model: "sonnet"`, told to read and follow
  `references/performance-audit.md` of this skill (absolute path), with the
  absolute paths of `performance.md` and `performance-web.md` from the
  `principles` skill's references folder. Give it the scope (paths, entry
  points) and cap its report at 600 words.
- **Security:** read `references/security-audit.md` of this skill and run its
  full audit yourself (it dispatches its own hunters and verifiers; a
  subagent cannot start subagents, so it never runs inside an auditor
  subagent). Propose its profile and budget before starting, as that file
  says.

Merge them under `## Security audit` (its Report summary, with the output
directory) and `## Performance audit`, keeping each one's findings table,
then one summary line with the count per severity. Security severities count
as Critical (`critical`, `high`), Important (`medium`), Minor (`low`), and
FYI (`informational`); its `needs_validation` leads are counted separately,
never as findings. Without a subagent tool, run the performance audit and a
focused security review (`references/security-review.md`) yourself, and say that neither was independent
and the security review was not a full audit.
