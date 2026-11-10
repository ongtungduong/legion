---
description: 'Near miss. A page got slower after a deploy: a regression, which belongs to systematic-debugging, not coding-principles.'
expected_outcome: 'legion:coding-principles is not invoked; the reply treats it as a regression to reproduce and bisect.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

The search page got three times slower since yesterday's deploy. This is the only change that went out:

```diff
--- a/src/search.js
+++ b/src/search.js
@@ -4,5 +4,6 @@ async function search(db, term) {
-  return db.query('SELECT id, title FROM docs WHERE title ILIKE $1 LIMIT 50', [`${term}%`]);
+  const rows = await db.query('SELECT id, title FROM docs WHERE title ILIKE $1', [`%${term}%`]);
+  return rows.slice(0, 50);
 }
```
