---
type: regex
target: { source: file, path: src/order-counts.js }
pattern: 'db\.query\('
match: 'count:1'
---
