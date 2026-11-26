---
description: A trivial edit with the code pasted inline. Checks finding-skills' promise that a trivial edit is done directly, with no Legion skill.
expected_outcome: The function with cnt renamed to count, and nothing else changed; no Legion skill is invoked.
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Rename the variable `cnt` to `count` in this function and show me the result:

```js
function countActive(users) {
  let cnt = 0;
  for (const u of users) if (u.active) cnt++;
  return cnt;
}
```
