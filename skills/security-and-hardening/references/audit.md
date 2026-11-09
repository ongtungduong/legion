# Security audit

Read this when asked to audit a system, a directory, or a whole repository
(not a diff) for security. A finding enters the report only after you have
checked it against the code; an unverified suspicion goes under Not checked.

## Procedure

1. **Scope.** Name the paths, entry points (routes, CLIs, jobs, webhooks,
   queue consumers), and assets (credentials, personal data, payments, admin
   actions). Read the baseline: the repo's own security docs and the last
   audit, if any, so a known and accepted risk is not reported as new.
2. **Secrets.** Search for committed credentials, printing only file names,
   never matching lines: the Grep tool with `output_mode:
   "files_with_matches"`, or `git grep -l -E '<pattern>'`. Patterns:
   `AKIA[0-9A-Z]{16}`, `gh[pousr]_[A-Za-z0-9_]{36,}`, `github_pat_`,
   `sk_live_`, `rk_live_`, `xox[baprs]-`, `AIza[0-9A-Za-z_-]{35}`,
   `sk-ant-`, `-----BEGIN [A-Z ]*PRIVATE KEY-----`, and assignments to
   names like `password`, `secret`, `api_key`, `token`. For staged changes:
   `git diff --cached -i -G'password|secret|api_key|token' --name-only`.
   Report the file and the kind of secret, never the value. A secret that
   reached a remote must be rotated, whatever happens to the history.
3. **Dependencies.** Run the ecosystem's audit against the committed
   lockfile (`npm audit`, `pnpm audit`, `pip-audit`, `govulncheck`,
   `cargo audit`); verify registry signatures where supported
   (`npm audit signatures`), treating their absence as a signal to
   investigate, not proof of compromise. Triage critical and high by
   reachability. No lockfile: report the step as not applicable and say
   installs are not reproducible.
4. **Threat model.** Walk STRIDE over each trust boundary from step 1, then
   check the OWASP Top 10 categories it exposes (and the OWASP Top 10 for LLM
   Applications if the system calls a model). Use the checklist in
   [security-checklist.md](security-checklist.md) as the item list.
5. **Attacker personas.** STRIDE asks what can go wrong at a boundary; a
   persona asks who would make it go wrong, and each sees what the others
   do not. Take one pass as each, asking "what is the cheapest way in from
   here, and what do I get?":
   - *Anonymous outsider*, with only the public surface: every unauthenticated
     route, form, and file the server serves.
   - *Signed-in user with the lowest role*: change every id, tenant, and role
     in a request; call every action the UI hides.
   - *Owner of something you depend on*: a package, a CI step, a container
     base image, a third-party API whose response you trust.
   - *Someone who can read the runtime*: logs, error pages, metrics,
     environment, backups, and the model context if there is one.
6. **Verify each finding.** Re-read the code path end to end and confirm the
   input really reaches the sink and no control upstream already blocks it.
   Drop what fails the check; move what you cannot settle to Not checked.
7. **Rank (Pareto).** Order by exposure x impact: reachable without
   authentication and leading to data loss, account takeover, or code
   execution first; theoretical or already mitigated last. Fold more than
   five Minor findings into one line per file.

## Report

```
### Scope
<paths, entry points, assets; baseline read>
### Method
<steps run, tools and commands, what each found>
### Findings
| Severity | Location | Finding | Evidence | Impact |
|---|---|---|---|---|
| Critical | src/routes/users.js:42 | SQL built from req.query.id | traced from route to db.query, no validation | measured: <value, source> / potential impact |
### Not checked
<what was out of reach, and what would settle it>
```

Severity: Critical (exploitable now: data loss, takeover, code execution),
Important (fix before release), Minor (hardening), FYI (context only).
