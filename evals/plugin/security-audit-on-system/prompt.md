---
description: 'A whole-app security audit request with three small files and no subagent tool. The skill cannot run its full audit here, so it must say so and give a guidance-mode review that finds the SQL injection and the hard-coded key, reports the key without its value, and marks the dependency step not applicable.'
expected_outcome: 'A guidance-mode review (Findings table, Hardening, Not checked) that says the full multi-agent audit needs a subagent tool and offers it; the SQL injection filed critical or high with a file:line location; the hard-coded key reported without printing it; the dependency audit marked not applicable for lack of a lockfile.'
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
---

Audit this app's security. It is the whole app; there is no lockfile yet.

```js
// src/server.js
const express = require('express');
const { search } = require('./search');
const app = express();
app.get('/search', async (req, res) => res.json(await search(req.query.q)));
app.listen(3000);
```

```js
// src/search.js
const db = require('./db');
async function search(q) {
  return db.query(`SELECT id, title FROM docs WHERE title LIKE '%${q}%'`);
}
module.exports = { search };
```

```js
// src/config.js
module.exports = {
  stripeKey: 'sk_live_TESTONLY123',
  dbUrl: process.env.DATABASE_URL,
};
```
