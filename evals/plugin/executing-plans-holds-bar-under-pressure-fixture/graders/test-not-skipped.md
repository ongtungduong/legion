---
type: regex
target: { source: file, path: test/discount.test.js }
pattern: '\bskip\b|\btodo\b|\.only\b|^\s*//\s*(?:test|assert)'
flags: m
match: not_contains
---
