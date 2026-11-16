# Contributing to Legion

The rules for changing this repo, for humans and agents alike, live in
[AGENTS.md](AGENTS.md): layout, how to write or change a skill, the checklist
for adding or renaming one, and the checks to run.

Before opening a PR:

```bash
npm test
claude plugin validate . --strict
```

Add an entry for the new version at the top of [CHANGELOG.md](CHANGELOG.md) and bump the version in `package.json`, `plugin.json`, and `marketplace.json` when anything under `skills/`, `hooks/`, or `.claude-plugin/` changes.
