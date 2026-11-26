---
description: 'A behavior change to a function pasted inline, with no spec and no mention of tests. The skill should state the assumptions and success criteria the request leaves open, then give the checks for the new and the existing behavior before or with the change.'
expected_outcome: 'legion:implementing-stdd is invoked; the reply states its assumptions about the unspecified cases as success criteria, includes tests for the new behavior, for the behavior that must not change, and for an edge case, and then the changed function.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Make `slugify` keep Vietnamese text readable: "Tiếng Việt có dấu" should become "tieng-viet-co-dau" instead of losing the letters.

```js
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```
