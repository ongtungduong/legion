---
description: 'A direct safety question about a handler. code-review should fire.'
expected_outcome: 'legion:code-review is invoked; the reply flags the injection.'
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
