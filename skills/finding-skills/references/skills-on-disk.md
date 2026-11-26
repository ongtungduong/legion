# Skills on Disk

Read this when the user asks whether a skill exists for something, asks you
to find one, or names a skill that is not in your list.

Installed skills that your list lacks are either user-invoked
(only the user can start them, so the model never sees them) or belong to
a disabled plugin. Read only frontmatter, never whole skill folders:

```bash
find ~/.claude/skills .claude/skills -maxdepth 2 -name SKILL.md \
  -exec grep -H -A4 '^description:' {} + 2>/dev/null
find ~/.claude/plugins/cache -mindepth 3 -maxdepth 3 -type d   # <marketplace>/<plugin>/<version>
```

In the plugin cache, read only the newest version folder of each plugin; older
ones stay behind after updates. Report what you found and how to use it: a
user-invoked skill runs when the user types `/<name>`; a disabled plugin's
skill needs `claude plugin enable <plugin>@<marketplace>` and a new session.
Do not read and follow such a skill on your own: it was kept out of your list
on purpose, by its author or by the user.
