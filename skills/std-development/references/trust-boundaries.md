# Trust Boundaries in a Change

Read this when a change handles permissions, file paths it deletes or writes,
outbound requests, secrets, dependencies, rate limits, or model output. It
lists the misuse criteria and checks that usual practice misses; the basics
(parameterized queries, output encoding, password hashing) are assumed. To
find vulnerabilities in existing work rather than change it, call the Skill
tool with `legion:security-audit`.

## Contents

- [Misuse criteria first](#misuse-criteria-first)
- [Authorization per resource](#authorization-per-resource)
- [Destructive operations on derived paths](#destructive-operations-on-derived-paths)
- [Outbound requests to influenced URLs](#outbound-requests-to-influenced-urls)
- [Rate limits across instances](#rate-limits-across-instances)
- [Model output and tool calls](#model-output-and-tool-calls)
- [Secrets](#secrets)
- [Dependencies](#dependencies)

## Misuse criteria first

A control added without naming what it stops is a guess. Before writing the
criteria:

1. **Name each entry** in this change where a value comes from someone less
   trusted, and who wrote it.
2. **Name what is worth taking or breaking** behind it: credentials,
   personal data, money movement, admin actions, other tenants' data.
3. **Run a quick lens over each entry**, one question per letter, and keep
   only the questions that have a real answer here:

   | Threat | Ask | A criterion it suggests |
   |---|---|---|
   | Spoofing | Can someone act as another user or service? | An unsigned or wrongly signed webhook is rejected |
   | Tampering | Can data change in transit, at rest, or in a query? | A modified price in the request body is ignored |
   | Repudiation | Can an action be denied later? | A role change writes an audit record with the actor |
   | Information disclosure | Can data leak? | The error body for a bad token holds no stack trace |
   | Denial of service | Can it be overwhelmed? | A 50 MB upload is refused before it is read fully |
   | Elevation of privilege | Can someone gain rights? | A member cannot grant themselves admin |

4. **Write each misuse as a New criterion** with its expected refusal, and
   run its check red before the change like any other.

These changes set the blast radius, so they are a "my call" that changes
what gets built: ask before building a new authentication flow or a change to
auth logic, a new category of stored sensitive data, a CORS change, a new
upload handler or external integration, or a grant of elevated roles.

## Authorization per resource

Authentication says who the caller is; it does not say they may touch this
record. For every read or write by id, the check uses a second principal:
user B requesting user A's record gets 404 (or 403) and the record is
unchanged. Scope the lookup itself (`WHERE id = ? AND owner_id = ?`) rather
than checking after fetching, so a missed branch fails closed.

## Destructive operations on derived paths

A delete, move, or overwrite is only as safe as the value naming its target.
A shape check (absolute, at least one level deep) proves the path is
well-formed, not that it is yours; that is how a cleanup deletes the root
instead of the leaf. Before the call, require all three:

- the target, resolved after symlinks, sits under an allowlisted root;
- it is strictly below that root, so a root is never the target;
- it carries ownership evidence read before the operation, and before any
  teardown that removes the evidence.

On refusal, log the rejected target and stop; never fall back to a broader
default path. Two limits: an owner marker inside the tree is self-attestation
by anything that can write there, so the expected owner comes from
authenticated state; and resolving a path then operating on the name races
with anyone who can swap an ancestor, so on a shared volume hold the target
by descriptor with no-follow, beneath-the-root operations.

Checks: the root itself, `../` escaping the root, a symlink inside the root
pointing outside it, and a target without ownership evidence are each
refused, and nothing on disk changes.

## Outbound requests to influenced URLs

Any URL a user influences (webhooks, import from URL, image proxies, link
previews) can be aimed at internal services. Allowlist scheme and host;
resolve all DNS records and reject the request if any address is not public
unicast (loopback, link-local `169.254.169.254`, private, unique-local, in
IPv4 and IPv6); disable redirects, or apply the same policy to every hop.
Validation before the connection still leaves a DNS-rebinding gap: for
untrusted URLs, connect only to the validated address (keeping the original
hostname for `Host`, TLS SNI, and certificate checks), or route through a
transport that enforces the policy at connect time.

Checks: `http://169.254.169.254/`, a hostname that resolves to `127.0.0.1`,
`http://[::1]/`, the decimal form `http://2130706433/`, and a redirect from
an allowed host to an internal one are each refused.

## Rate limits across instances

A limiter that counts in process memory allows `max × instances` behind a
load balancer and starts from zero on every serverless invocation, so an
auth limit may never fire. Back it with a shared store once more than one
process serves traffic. Check: two limiter instances on the same store
together refuse the attempt after `max`. If the deployment topology is not
visible, the instance count is a "my call".

## Model output and tool calls

Model output is untrusted input: it never reaches `eval`, SQL, a shell,
HTML, or a file path without schema validation and the sink's encoding. The
system prompt is not a permission boundary; untrusted text in the context (a
user message, a fetched page, a PDF) can carry instructions. Enforce tool
permissions in code, validate every tool argument, confirm destructive
actions, and keep secrets and other tenants' data out of the context window.
Check: an instruction planted in retrieved text does not produce a tool call
outside the requesting user's permissions.

## Secrets

Secrets come from the environment; `.env.example` holds placeholders and real
`.env*` files and key material are gitignored. Before committing, list only
the names of files whose staged diff matches, so a value never lands in
terminal output or agent logs:

```bash
git diff --cached -i -G'password|secret|api_key|token' --name-only
```

A secret that reached a remote is compromised the moment it lands: revoke and
reissue it first, then purge history. Never print a secret in a check's
output or a report.

## Dependencies

A new dependency is a change to review, not a line in a manifest: check the
name against typosquats (one edit from a popular package), its maintainers,
release age, transitive graph, and whether it runs install scripts.
Lifecycle scripts run with the installer's credentials on first install, so
install with scripts disabled (`--ignore-scripts`, or the package manager's
allow policy) until the script source is read. Keep one lockfile per
installation root, install frozen in CI, and review the lockfile diff with
the change. Never run forced remediation (`npm audit fix --force` or an
equivalent) as part of a change: it crosses declared version ranges. A
known-advisory audit does not catch a newly malicious package.
