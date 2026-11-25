---
description: 'User-invoked skill. A rough chat prompt with a shouted constraint and a vague quality word. The rewrite should keep what the user asked, give no reason the user did not give, and list what it added as assumptions.'
expected_outcome: 'The reply returns the improved prompt in a code block, does not write the five posts, keeps the five-post and no-emoji requirements, and lists every added requirement (length, angles, hashtags, a reason for no emoji) under Assumptions instead of presenting it as the user''s.'
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/legion:prompt-optimization bạn là chuyên gia marketing. viết 5 bài post facebook cho quán cà phê của tôi. KHÔNG ĐƯỢC dùng emoji. phải thật hay và thu hút.
