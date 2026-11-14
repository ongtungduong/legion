---
type: regex
target: { source: file, path: src/order-counts.js }
pattern: 'LEFT\s+(?:OUTER\s+)?JOIN|\(\s*SELECT\s+COUNT'
flags: i
---
