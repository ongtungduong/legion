## What and why

<!-- What changes, and the reason. Link the spec or issue if there is one. -->

## Checks

- [ ] `npm test` passes
- [ ] `claude plugin validate . --strict` passes
- [ ] `CHANGELOG.md` has an entry under Unreleased

If this adds or renames a skill:

- [ ] `skills/<name>/` written with `legion:skill-creator`
- [ ] Row in the map in `skills/using-legion/SKILL.md`
- [ ] Row in the skill table in `README.md`
- [ ] `evals/triggers/<name>.json` with 3+ positive and 2+ near-miss negative prompts
- [ ] Provenance in `THIRD_PARTY.md` if adapted from another project

If this changes a skill description: re-ran `npm run evals:triggers`.
