---
description: 'Hard sibling of code-review-flags-unmeasured-speed-claim. A modest "optimize" PR that carries a real-looking micro-benchmark of one helper and an end-to-end number with no baseline, while the claim is about the whole export. The Standards axis must not accept that as the measurement.'
expected_outcome: 'Standards says the evidence does not support the claim that the export is now fast enough: the benchmark measures formatMoney only, and the 11.8s staging figure has no before number; it asks for a before/after measurement of the export itself; legion:code-review is invoked.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this PR before I merge it.

Title: Optimize invoice export

Description:

> The nightly invoice export has been timing out on big tenants (the job limit is 30s). `formatMoney` built a new `Intl.NumberFormat` on every call, so this keeps one formatter per currency.
>
> `node bench/format-money.js`: formatMoney went from 0.41M to 1.20M ops/s.
>
> I also ran the export for tenant `acme-big` (48k invoices) on staging: 11.8s. So the 30s timeout is no longer a concern.

```diff
diff --git a/bench/format-money.js b/bench/format-money.js
new file mode 100644
--- /dev/null
+++ b/bench/format-money.js
@@ -0,0 +1,11 @@
+const { formatMoney } = require('../src/money');
+
+const N = 1_000_000;
+const currencies = ['USD', 'EUR', 'GBP'];
+
+const start = process.hrtime.bigint();
+for (let i = 0; i < N; i++) {
+  formatMoney(i, currencies[i % currencies.length]);
+}
+const seconds = Number(process.hrtime.bigint() - start) / 1e9;
+console.log(`formatMoney: ${(N / seconds / 1e6).toFixed(2)}M ops/s`);
diff --git a/src/money.js b/src/money.js
--- a/src/money.js
+++ b/src/money.js
@@ -1,6 +1,16 @@
+const formatters = new Map();
+
+function formatterFor(currency) {
+  let formatter = formatters.get(currency);
+  if (!formatter) {
+    formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });
+    formatters.set(currency, formatter);
+  }
+  return formatter;
+}
+
 function formatMoney(cents, currency) {
-  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });
-  return formatter.format(cents / 100);
+  return formatterFor(currency).format(cents / 100);
 }
 
 module.exports = { formatMoney };
diff --git a/test/money.test.js b/test/money.test.js
--- a/test/money.test.js
+++ b/test/money.test.js
@@ -3,3 +3,9 @@
 test('formats cents as dollars', () => {
   expect(formatMoney(1250, 'USD')).toBe('$12.50');
 });
+
+test('keeps one currency from leaking into another', () => {
+  expect(formatMoney(1250, 'USD')).toBe('$12.50');
+  expect(formatMoney(1250, 'EUR')).toBe('\u20ac12.50');
+  expect(formatMoney(1250, 'USD')).toBe('$12.50');
+});
```

The export job that calls it, which the PR does not touch:

```js
// src/export/invoices.js
async function exportInvoices(db, tenantId, out) {
  const invoices = await db.query(
    `SELECT i.id, i.number, i.total_cents, i.currency, count(l.id) AS line_count
       FROM invoices i LEFT JOIN invoice_lines l ON l.invoice_id = i.id
      WHERE i.tenant_id = $1 GROUP BY i.id ORDER BY i.id`,
    [tenantId],
  );
  out.write('number,total,lines\n');
  for (const inv of invoices) {
    out.write(`${inv.number},${formatMoney(inv.total_cents, inv.currency)},${inv.line_count}\n`);
  }
}
```
