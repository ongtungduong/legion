---
type: llm
focus: { source: file, path: src/parcel.js }
---

PASS if `isHeavy` returns true for a weight of exactly 20 (it compares with `>=` against `HEAVY_KG`, which is still 20, or an equivalent form) and nothing else in the file changed in behavior: `handlingLabel` still maps heavy to 'TWO-PERSON LIFT' and everything else to 'STANDARD', and the exports are the same.

FAIL if the boundary is still excluded, if the threshold value was changed to get the effect (for example `> 19.99`), or if any other function or export in the file was altered or added.
