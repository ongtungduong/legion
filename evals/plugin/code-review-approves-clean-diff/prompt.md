---
description: 'Negative control. A correct one-line fix with its tests and a spec it meets. A review that helps must be able to say "approve": this case measures invented findings, the cost a review process adds when there is nothing to find.'
expected_outcome: 'The review approves (Approve or Approve with comments) and reports no Critical or Important finding; optional remarks are fine. legion:code-review is invoked only in the with-plugin arm.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff before I merge it. It closes this issue: "`pageOf(rows, page, size)` returns the wrong rows: page 1 skips the first `size` rows. Pages are 1-based. A page past the end returns an empty array. `page` and `size` are positive integers; the route schema already rejects anything else."

```diff
diff --git a/src/paging.js b/src/paging.js
--- a/src/paging.js
+++ b/src/paging.js
@@ -1,6 +1,6 @@
 function pageOf(rows, page, size) {
-  const start = page * size;
+  const start = (page - 1) * size;
   return rows.slice(start, start + size);
 }

 module.exports = { pageOf };
diff --git a/test/paging.test.js b/test/paging.test.js
--- a/test/paging.test.js
+++ b/test/paging.test.js
@@ -1,4 +1,21 @@
 const test = require('node:test');
 const assert = require('node:assert');
 const { pageOf } = require('../src/paging');
+
+const rows = [1, 2, 3, 4, 5];
+
+test('page 1 starts at the first row', () => {
+  assert.deepStrictEqual(pageOf(rows, 1, 2), [1, 2]);
+});
+
+test('the last page may be shorter than size', () => {
+  assert.deepStrictEqual(pageOf(rows, 3, 2), [5]);
+});
+
+test('a page past the end is empty', () => {
+  assert.deepStrictEqual(pageOf(rows, 4, 2), []);
+});
```
