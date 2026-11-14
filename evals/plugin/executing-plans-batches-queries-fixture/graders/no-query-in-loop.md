---
type: regex
target: { source: file, path: src/order-counts.js }
pattern: '(?:for\s*\(|while\s*\(|\.forEach\(|\.map\(|Promise\.all)[\s\S]*db\.query\('
match: not_contains
---
