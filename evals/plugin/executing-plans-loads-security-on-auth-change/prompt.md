---
description: 'A small function that takes an email from the login form. The quick path should load the security standards before coding and produce a parameterized, validated lookup.'
expected_outcome: 'legion:security-and-hardening is invoked before the code is written; the lookup uses a parameterized query and validates the email at the boundary.'
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a function `findUserByEmail(db, email)` to this module. The email comes straight from the login form. Show me the code and its test.

```js
// src/users.js
// db.query(sql, params) runs a Postgres query and resolves to rows.
async function findUserById(db, id) {
  const rows = await db.query('SELECT id, email, password_hash FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}
module.exports = { findUserById };
```
