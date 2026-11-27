# Worked reply

Request: "The nightly report crashes with ZeroDivisionError since yesterday's
deploy. `avg(xs)` returns `sum(xs)/len(xs)`, and the deploy added the filter
`xs = [x for x in rows if x.region == REGION]`."

```
Loop: `python -m report --date 2026-11-26` -> ZeroDivisionError at report.py:41, with REGION="" printed from the config
Cause: the deploy renamed the env var REGION to SALES_REGION; report.py:12 still reads REGION, gets "", the filter at report.py:38 matches no row, and avg() divides by len([]) = 0
Contributing: avg() has no empty-input guard, so a bad config surfaces as an arithmetic crash far from its source | none
Why chain: crash <- empty list reached avg() <- filter matched nothing <- REGION read as "" <- rename not applied at the read site <- no check that required config is set at startup
Evidence: predicted that `SALES_REGION=EU python -m report` succeeds and `REGION=EU` alone crashes; both held
Fix: read SALES_REGION at report.py:12 and fail at startup with a named error when it is unset | not applied: read-only session
Recurrence control: test `test_missing_region_fails_fast` RED (crash deep in avg) -> GREEN (startup error names SALES_REGION)
Unverified: the production env was not inspected; the cause is confirmed on the repro only
```
