---
type: llm
---

PASS if the reply explains that CSRF makes a victim's browser send an authenticated request the user did not intend (the attacker does not read the response), and XSS runs attacker script in the site's own origin (so it can read data and act as the user).

FAIL if either part is missing or wrong, or the reply starts reviewing code.
