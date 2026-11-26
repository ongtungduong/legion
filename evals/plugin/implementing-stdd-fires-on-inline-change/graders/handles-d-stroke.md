---
type: llm
---

Unicode NFD normalization plus stripping combining marks turns most Vietnamese letters into ASCII, but not "đ"/"Đ" (U+0111/U+0110), which has no decomposition and would still be dropped.

PASS if the reply's change or its tests handle "đ" (for example "Đà Nẵng" -> "da-nang"), mapping it to "d".

FAIL if "đ" is not mentioned or handled, so a title with it still loses the letter.
