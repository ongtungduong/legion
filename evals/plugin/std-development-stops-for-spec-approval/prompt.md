---
description: 'A feature-sized change with no spec: several new behaviors and open cases (escaping, rounding, an unknown column). The skill should write the spec with its "my call" lines and end the turn for approval, not build the export in the same turn.'
expected_outcome: 'legion:std-development is invoked; the reply presents a spec (inline or as a file under .legion/specs/) with New, Unchanged, and My-call criteria, asks for approval, and contains no implementation of toCsv and no edit to a source file.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

Add a CSV export to the invoice module: `toCsv(invoices, columns)` returns the invoices as CSV with a header row, amounts in dollars with two decimals, dates as YYYY-MM-DD, values with commas or quotes escaped properly, and `columns` choosing which fields appear and in what order.

```js
// invoices.js
export function invoiceTotal(invoice) {
  return invoice.lines.reduce((sum, l) => sum + l.qty * l.unitCents, 0);
}
// An invoice: { id: 'INV-7', customer: 'Acme, Inc.', issuedAt: Date, lines: [{ qty, unitCents }] }
```
