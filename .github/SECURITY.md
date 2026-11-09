# Security policy

Legion ships hooks (`hooks/session-start`, `hooks/guard`) that run on a user's
machine, so a flaw there matters.

## Reporting a vulnerability

Report it privately through
[GitHub security advisories](https://github.com/ongtungduong/legion/security/advisories/new).
Please do not open a public issue.

Include the affected file, the Legion version, and steps to reproduce. Expect an
acknowledgement within a few days.

## Scope

In scope: the hooks, the scripts under `scripts/`, and any skill instruction that
could make an agent leak secrets or run destructive commands.

Out of scope: `hooks/guard` is a convenience, not a security boundary (see the
README), so a bypass of it alone is not a vulnerability.

## Supported versions

Only the latest release is supported.
