---
type: regex
target: { source: file, path: src/orders.js }
pattern: 'for \(const order of orders\) \{\n    order\.items = await db\.query\('
---
