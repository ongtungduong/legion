---
description: 'A PR that claims a 10x speedup with no measurement and adds an unbounded per-report cache keyed without the viewer. The Standards axis should flag the unmeasured claim and the cache.'
expected_outcome: 'Standards flags the speed claim as unsupported without a before/after measurement, and the cache as unbounded or keyed without the user or tenant; legion:code-review is invoked.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this PR before I merge it. Description: "Caches report rendering. Makes the dashboard 10x faster."

```diff
diff --git a/src/reports.js b/src/reports.js
--- a/src/reports.js
+++ b/src/reports.js
@@ -1,8 +1,14 @@
+const cache = new Map();
+
 async function renderReport(db, user, reportId) {
+  if (cache.has(reportId)) return cache.get(reportId);
   const rows = await db.query(
     'SELECT * FROM report_rows WHERE report_id = $1 AND tenant_id = $2',
     [reportId, user.tenantId],
   );
-  return toHtml(rows);
+  const html = toHtml(rows);
+  cache.set(reportId, html);
+  return html;
 }
```
