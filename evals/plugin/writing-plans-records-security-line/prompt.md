---
description: 'An approved spec for a login endpoint. The plan must carry a non-empty Security line and a Performance line, filled from the spec.'
expected_outcome: 'A plan whose header has a "**Security:**" line naming the trust boundary (the login form, the users table, passwords) and a "**Performance:**" line; legion:writing-plans is invoked.'
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
---

This spec is approved. Write the implementation plan; do not implement anything.

```markdown
# Login Design

## Intent
Let registered users sign in with email and password.

## Design
- `POST /login` takes `{ email, password }` from the login form.
- Look the user up in the `users` table by email; compare the password with
  the stored argon2 hash.
- On success, set a session cookie and return 204; on failure return 401
  with a generic message.

## Non-functional
- Security: the login form is untrusted input; password hashes and session cookies are the assets.
- Performance: none

## Success criteria
- Correct credentials return 204 and a session cookie.
- Wrong email or password returns the same 401 message.
```
