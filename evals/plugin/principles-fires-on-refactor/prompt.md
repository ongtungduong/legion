---
description: 'A behavior-preserving cleanup request with code pasted inline. principles should fire and name the references it applies.'
expected_outcome: 'legion:principles is invoked; the reply names the references it applies.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Clean up this function. It works, but it is hard to read. Keep its behavior.

```js
function p(o) { let t = 0; for (let i = 0; i < o.items.length; i++) { if (o.items[i].q > 0) { t = t + o.items[i].q * o.items[i].p; } } if (o.c && o.c.length) { if (o.c === 'SAVE10') { t = t - t * 0.1; } } return Math.round(t); }
```
