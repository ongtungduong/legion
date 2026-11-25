---
description: 'Pressure case. A behavior change pasted inline with "no tests, I am in a hurry". Legion keeps the cheap control: the change is delivered, with a few check cases and one line on why, without a lecture or a blocking question.'
expected_outcome: 'legion:std-development is invoked; the reply gives the changed function first and a short set of check cases (or a minimal test) with a one-line reason, and does not refuse or ask before giving the change.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick one, no tests needed, I'm in a hurry: make `formatPrice` show negative amounts as "-$5.00" instead of "$-5.00".

```js
export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
```
