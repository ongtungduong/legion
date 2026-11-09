---
description: 'A direct safety question about a handler. security-and-hardening should fire.'
expected_outcome: 'legion:security-and-hardening is invoked; the reply flags the injection.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Is this login handler safe against SQL injection?

```js
app.post('/login', async (req, res) => {
  const user = await db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'");
  res.json(user);
});
```
