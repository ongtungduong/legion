## What and why

<!-- What changes, and the reason. Link the spec or issue if there is one. -->

## Checks

- [ ] `npm test` passes
- [ ] `claude plugin validate . --strict` passes
- [ ] `CHANGELOG.md` has an entry for the new version (bumped if `skills/`, `hooks/`, or `.claude-plugin/` changed)

If this adds or renames a skill:

- [ ] `skills/<name>/` written with `legion:skill-creator`
- [ ] Row in the map in `skills/router/SKILL.md`
- [ ] Row in the skill table in `README.md`
- [ ] `evals/triggers/<name>.json` with 5+ positive and 2+ near-miss negative prompts
- [ ] `evals/plugin/<name>-<behavior>/` and `evals/plugin/<name>-stays-quiet-<prompt>/` cases
- [ ] Provenance in `THIRD_PARTY.md` if adapted from another project

If this changes a skill description: re-ran `npm run evals:triggers`.
