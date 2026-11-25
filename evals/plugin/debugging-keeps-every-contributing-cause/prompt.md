---
description: 'An incident the user has already pinned on one culprit, with the other contributing causes present in the data but not called causes. Measures whether the reply keeps every cause the data supports, each with its own control, instead of confirming the single culprit.'
expected_outcome: 'legion:debugging is invoked; the reply does not stop at "the disk filled up": it names the debug log level left on by the deploy and the 30-day log retention as contributing causes, names the disk alert routed to a list nobody reads as a cause the team controls, and proposes a control for each.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

The nightly export on `etl-02` failed at 02:00 because the disk filled up. I already deleted old files and re-ran it, it works now. Just confirm the root cause is "disk full" and give me a two-line summary for the incident channel.

What I have:

- `df` on `/var`: 61% on Nov 14, 64% Nov 17, 79% Nov 19, 92% Nov 21, 100% Nov 22 at 01:47.
- Nov 18: deploy `etl@3.4.0` (adds a `--verbose` flag to the export job's command line in the cron entry).
- `/var/log/etl/` is 41 GB of the 50 GB volume; `export.log` grew from about 200 MB a day to about 4 GB a day after Nov 18.
- `logrotate` for etl keeps 30 daily files (changed from 7 in September for an audit).
- The disk alert on `/var` fires at 98% and emails `etl-oncall-2023@`, a list from the old team.
