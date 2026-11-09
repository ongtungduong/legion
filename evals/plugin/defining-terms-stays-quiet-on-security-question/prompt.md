---
description: 'Near miss: a security question about a handler, not a terminology question.'
expected_outcome: 'legion:defining-terms is not invoked.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Is this login handler safe against injection?

```js
app.post('/login', async (req, res) => {
  const user = await db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'");
  res.json(user);
});
```
