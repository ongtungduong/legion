---
description: 'A behavior change pasted inline that deletes a file named by the request. The skill should add misuse criteria next to the use case (path traversal out of the export folder, another user''s export, the folder itself), each with the refusal expected and the check for it, before or with the change.'
expected_outcome: 'legion:std-development is invoked; the criteria include refusals for `../` traversal, another user''s export, and the export root itself, the change resolves the path and checks it stays strictly under the user''s own folder before deleting, and checks for those refusals are given.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Add an endpoint so users can delete one of their exports. Exports live in `EXPORT_DIR/<userId>/<name>`.

```js
// Express 4. requireLogin sets req.user.id from a verified session.
const fs = require('node:fs/promises');
const path = require('node:path');
const EXPORT_DIR = process.env.EXPORT_DIR;

router.get('/exports/:name', requireLogin, async (req, res) => {
  res.sendFile(path.join(EXPORT_DIR, req.user.id, req.params.name));
});
```
