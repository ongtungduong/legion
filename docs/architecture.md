# Kiến trúc Legion

Ghi lại các quyết định thiết kế của bản 0.1.0 và lý do, để sau này không ai "sửa"
nhầm những chỗ cố ý.

## Nguyên tắc nền

1. **Khung của superpowers.** Plugin có hook SessionStart chèn một skill router, cùng
   một chuỗi skill quy trình (brainstorm → plan → execute → review → verify) có
   hard gate. Đây là phần mạnh nhất của superpowers nên được giữ.
2. **Router nhẹ thay cho ép buộc.** superpowers bắt agent kiểm tra skill trước *mọi*
   phản hồi ("1% chance → MUST"), nên tốn token và chậm với việc nhỏ. Cách làm đó
   cũng xung đột với quy tắc "Trivial: just answer". Legion chỉ nạp skill khi task
   khớp rõ ràng. Tuy vậy, skill kỷ luật đã nạp thì không được làm mềm luật cứng.
3. **Ưu tiên chỉ dẫn của người dùng.** CLAUDE.md và AGENTS.md của người dùng thắng
   mọi skill. Điều này được ghi ngay đầu router.
4. **Không phụ thuộc thư viện ngoài.** Hook chỉ dùng bash builtin, script repo chỉ dùng
   Node có sẵn (không có `node_modules`). Riêng `validate:spec` cần `python3` vì chạy
   validator của skill-creator (chỉ dùng stdlib).
5. **Chuẩn agentskills.io cho mọi skill.** Từ 0.2.0, skill được viết và kiểm tra bằng
   `skill-creator`. Xem mục bên dưới.

## Lấy gì từ đâu

| Nguồn | Điểm mạnh được lấy | Ở đâu trong Legion |
|---|---|---|
| superpowers | Hook SessionStart; hard gate trước khi code; plan có Interfaces / Global constraints / Review focus; ledger chống mất trí nhớ khi compaction; "rulings, not stalls" và bốn điểm dừng; iron law TDD và verify; tiếp nhận review không xu nịnh | `hooks/`, `brainstorming`, `writing-plans`, `executing-plans` (gồm cả TDD và verify), `code-review/references/receiving-review.md` |
| mattpocock | Phỏng vấn theo vòng trên cây quyết định; `GLOSSARY.md` và ADR; seam và các anti-pattern của test; debug bắt đầu từ feedback loop; review hai trục chạy song song; phân biệt user-invoked và model-invoked; gọi skill bằng "Call the Skill tool with" | `brainstorming/references/grilling.md`, `brainstorming/references/adr-format.md`, `defining-terms`, `executing-plans` (TDD), `systematic-debugging`, `code-review`, `AGENTS.md` (quy ước invocation, cross-ref) |
| addyosmani | Cấu trúc spec (Commands, Testing, Boundaries Always/Ask/Never, Success criteria); lát cắt dọc và bảng size XS–XL; nhãn mức độ review; threat model STRIDE và checklist bảo mật; trigger eval tất định; bài học "even when pasted inline" cho description | `brainstorming`, `writing-plans`, `code-review`, `security-and-hardening`, `scripts/trigger-evals.mjs`, `AGENTS.md` |
| agent-rules-books | 14 bộ rule mini chắt lọc từ sách kinh điển; quy tắc "một bộ chính, tối đa thêm một"; ma trận tương thích (2 cặp ❌, 11 cặp 🔁) | `coding-principles`, các điểm nối trong writing-plans, executing-plans, code-review |
| duongot-skills | `skill-creator`: workflow 6 bước, spec và best practices của agentskills.io, template, validator | `skills/skill-creator`, `scripts/validate-spec.mjs` |

## Những gì cố ý bỏ hoặc đổi

| Thứ trong nguồn | Quyết định | Lý do |
|---|---|---|
| Hỗ trợ đa harness của superpowers (Codex, Cursor, Gemini...) | Bỏ, chỉ hỗ trợ Claude Code | Bảo trì nhiều manifest và test là chi phí lớn. `skills/` theo chuẩn Agent Skills nên có thể thêm sau mà không phải sửa skill. |
| `run-hook.cmd` (polyglot cho Windows) | Bỏ | Chỉ cần thiết với Windows. Đã ghi vào roadmap. |
| Script `sdd-workspace`, `task-brief`, `review-package` | Thay bằng lệnh git và đường dẫn ghi thẳng trong skill | Bớt phần phải bảo trì. Đổi lại agent tự chạy `git diff` vào file. |
| `subagent-driven-development` tách riêng | Gộp thành một mode trong `executing-plans` | Hai skill dùng chung ledger và vòng lặp. Gộp lại giúp router chỉ còn một lựa chọn. |
| `using-git-worktrees`, `finishing-a-development-branch` | Rút thành bước Setup và Finish trong `executing-plans` | Ở bản đầu chưa cần skill riêng. |
| Visual companion và brainstorm server | Bỏ | Phụ thuộc server JS, nằm ngoài phạm vi khung. |
| Issue tracker và `setup-matt-pocock-skills` | Chưa đưa vào | Cần một skill setup user-invoked. Đã ghi vào roadmap. |
| 25 skill của addy | Chỉ lấy `security-and-hardening` | Các skill domain khác (perf, observability, CI/CD...) sẽ thêm khi có nhu cầu thật. |

## Chuẩn agentskills.io (0.2.0)

Mọi skill được viết lại theo workflow của `skill-creator`:

| Quy tắc | Áp dụng trong Legion |
|---|---|
| Description nêu *what* rồi mới đến *when*, viết "pushy" | Câu đầu mô tả khả năng của skill, sau đó là "Use when ...", liệt kê cách người dùng hay nói kèm các tình huống model tưởng tự làm được ("even when pasted inline"). Validator chặn description bắt đầu bằng "Use". |
| Chỉ viết những gì agent chưa biết | Bỏ các phần mang tính kiến thức chung (ví dụ cách hash mật khẩu trong security). Giữ lại gotcha cụ thể lấy từ nguồn, như `HEAD~1` cắt mất commit, diff ba chấm, rate limiter in-memory nhân theo số instance. |
| Khung Workflow / Gotchas / Output format | Skill nào cũng có Gotchas. Output format chỉ thêm khi đầu ra có cấu trúc (brainstorming/grilling, code-review, verification). |
| Template dài đặt trong `assets/` | `brainstorming/assets/design-doc-template.md`, `writing-plans/assets/plan-template.md`. |
| Trỏ tới file phải nói khi nào đọc | Mọi link trong `references/` đều ghi rõ thời điểm cần đọc. |
| Không dùng ALL-CAPS, luật đi kèm lý do | Bỏ khối "iron law" viết hoa của superpowers, thay bằng câu "**The rule:** ..." kèm lý do. Nội dung luật vẫn giữ nguyên. |

Đánh đổi cần theo dõi: superpowers đã đo được rằng iron law viết hoa và bảng
rationalization giúp agent chống lại việc tự bào chữa để bỏ qua bước. Bản 0.2.0
giữ lại luật nhưng viết nhẹ giọng hơn. Nếu behavioral eval cho thấy TDD hoặc debug
bị bỏ qua nhiều hơn, cách viết này cần xem lại.

## Spec-driven, test-driven, best practice (0.3.0)

Ba lớp này móc nối với nhau thành một chuỗi, để mỗi tầng kiểm được tầng trước:

| Lớp | Ở đâu | Cơ chế |
|---|---|---|
| Spec-driven | `brainstorming` → `writing-plans` → `executing-plans` (luật 1, bước chốt criteria) | Design doc là nguồn sự thật. Mỗi task ghi `Acceptance (spec: ...)`. TDD chốt acceptance criteria trước test đầu tiên, và mỗi test phải truy về một criterion. Trục Spec của review bắt cả phần thiếu lẫn phần thừa. |
| Test-driven | `executing-plans` (luật 2, TDD cycle) | Không có test fail trước thì không viết code. Gặp code legacy thì viết characterization test trước. Trước khi báo xong phải chạy cả suite. |
| Best practice | `coding-principles` | Plan ghi `Design principles`. Implementer đọc bộ rule đó trước khi code. REFACTOR theo decision rules của bộ rule. Reviewer kiểm theo final checklist. Thứ tự ưu tiên: chuẩn của repo > bộ rule > smell baseline. |

Lý do chỉ cho phép tối đa hai bộ rule: chính agent-rules-books nhận định model
không tuân thủ được hàng trăm rule cùng lúc, và nhiều cặp sách trùng nhau hoặc
kéo ngược chiều nhau (Clean Code nghiêng về hàm nhỏ, APoSD nghiêng về module sâu).
Chỉ dùng bản `mini` (khoảng 1,3–2k token mỗi bộ, chỉ nạp khi cần), không đưa bản
`full` vào.

## Brainstorming nhiều góc nhìn (0.4.0)

| Kỹ thuật | Vị trí trong flow | Lý do |
|---|---|---|
| First principles | Sau playback, trước bước lay out approaches | Ép ít nhất một phương án được dựng lại từ goal, fact và constraint, thay vì chép lời giải quen thuộc. Code, dữ liệu và contract hiện có được coi là fact, không phải assumption. |
| Six Thinking Hats | Khi so sánh phương án | Dùng chuỗi Blue → White → Green → Yellow → Black → Red → Blue (theo Wikipedia, mục "choosing between alternatives"). Red hat chỉ phản ánh phản ứng của người dùng, không phải của agent. Nghiên cứu chứng minh hiệu quả của phương pháp này còn ít, nên nó được dùng như checklist để không bỏ sót góc nhìn nào, không phải nghi thức. |
| Grilling | Từ 0.5.0 nằm trong `brainstorming/references/grilling.md`. Chạy sau khi chọn phương án (bắt buộc với project), sớm hơn khi có từ 3 quyết định mở trở lên, hoặc qua lối vào "chỉ grill" ở bước 1 khi người dùng chỉ muốn stress-test một plan hay quyết định sẵn có (lối này không bắt buộc viết design doc). | Gộp vào brainstorming theo yêu cầu: bớt một skill khỏi phần luôn-bật và router, trong khi nội dung grilling vẫn chỉ nằm ở một nơi. Trigger "grill me" và "poke holes" chuyển sang description của brainstorming. |

Độ sâu của cả ba theo kích thước việc. Với thay đổi nhỏ: first principles chỉ
một dòng, mũ chỉ dùng Yellow và Black, và chỉ grill khi cần. Như vậy các kỹ thuật
này không làm phình các việc nhỏ.

## Một skill cho mọi việc code (0.7.0)

`test-driven-development` và `verification-before-completion` được gộp vào
`executing-plans`. Mục tiêu là mọi thay đổi code đi qua cùng một luồng: chốt
criteria, test fail trước, code tối thiểu, refactor theo principles, cổng bằng
chứng. Trước đây luồng này cần agent tự nối 3 skill, và mỗi lần nối là một chỗ có
thể bị bỏ qua.

| Quyết định | Lý do |
|---|---|
| Có "quick path" cho việc không có plan | Yêu cầu là *luôn* spec-driven và test-driven, kể cả fix nhỏ hay hàm được dán vào |
| Giữ `coding-principles` riêng | `writing-plans` và `code-review` cũng dùng nó; chuẩn agentskills không cho tham chiếu file chéo skill |
| Agent tự chọn inline hay subagent theo từng task | Dựa trên độ dài plan, độ lớn task, mức phụ thuộc và lượng context còn lại; task rủi ro (auth, dữ liệu, tiền, concurrency) luôn có reviewer mới. Người dùng vẫn có thể chỉ định. |
| Luật "xong phải có bằng chứng" cho việc không phải code nằm trong router | Một dòng gotcha luôn-bật, rẻ hơn giữ cả một skill riêng |

## Subagent: khi nào, model nào, worktree nào (0.8.0)

| Quyết định | Lý do |
|---|---|
| Ghi rõ `subagent_type: "general-purpose"` và không bao giờ dùng `fork` | `fork` chép toàn bộ hội thoại cha vào subagent, nên reviewer mất đúng góc nhìn độc lập mà nó được tạo ra để có |
| Mọi lần dispatch đều ghi alias model: `haiku` cho task XS-S một file đã được test và signature chốt chặt; `sonnet` cho task M, nhiều file, task `+review`, task reviewer, builder check; `opus` cho final review và reviewer của task rủi ro | Không ghi model thì subagent dùng model của phiên chính, thường là model đắt nhất (thứ tự ưu tiên theo docs: tham số `model` > frontmatter > `CLAUDE_CODE_SUBAGENT_MODEL` > model của phiên chính). Agent tool chỉ nhận alias. `fable` chưa được xếp tier vì chưa xác minh được |
| Implementer chạy trong worktree riêng (`isolation: "worktree"`), bước đầu tiên là reset về `BASE` | Worktree native mặc định tạo từ default branch, không phải HEAD của feature branch (trừ khi người dùng tự đặt `worktree.baseRef: "head"`). Theo yêu cầu, dùng cơ chế native rồi reset, thay vì để controller tự chạy `git worktree add` |
| Implementer tự kiểm tra isolation (`--show-toplevel` khác repo chính); nếu kiểm tra thất bại thì cả run chuyển sang inline | Chỉ từ Claude Code 2.1.203 lệnh Bash mới chạy trong worktree của subagent, và workflow script có lỗi bỏ qua isolation (issue #102657). Bước kiểm tra này biến một lỗi âm thầm thành một trạng thái BLOCKED có thể nhìn thấy |
| Controller pin head bằng `legion/<plan>/task-N`, kiểm tra tree của mình vẫn sạch, review `BASE..pin`, rồi `merge --ff-only` | Worktree có thay đổi sẽ bị harness tự dọn theo chu kỳ, nên phải pin để commit không bị mất. Fast-forward thất bại nghĩa là base đã đổi, và việc đó cần một ruling chứ không được ép |
| Vẫn chạy tuần tự từng implementer một | Task sau dùng commit của task trước. Worktree chỉ để cô lập file, chưa dùng để chạy song song |
| Reviewer và tra cứu không có worktree | Chúng chỉ đọc, làm việc trên diff package và đường dẫn tuyệt đối |
| Task XS chạy inline, trừ khi context đã dùng khoảng một nửa | Chi phí khởi động lại và cài dependency trong worktree mới lớn hơn bản thân task |

Nguồn: [Claude Code - worktrees](https://code.claude.com/docs/en/worktrees),
[Claude Code - subagents](https://code.claude.com/docs/en/sub-agents),
[issue #75451](https://github.com/anthropics/claude-code/issues/75451),
[issue #102657](https://github.com/anthropics/claude-code/issues/102657).
Hành vi khi dọn worktree đã có commit và giá trị subagent trả về chưa được docs
ghi rõ. Skill vì thế không dựa vào chúng: implementer tự báo lại path và sha,
còn controller tự pin và tự xoá worktree.

## Mô hình tư duy (0.6.0)

Mỗi mô hình được đặt ở bước mà nó làm thay đổi quyết định, không có skill
`mental-models` riêng. Một skill như vậy hầu như không được agent tự gọi, sẽ
tranh trigger với brainstorming, và chuẩn agentskills không cho phép tham chiếu
file chéo giữa các skill.

| Mô hình | Vị trí | Dạng |
|---|---|---|
| First principles | `brainstorming` bước 7 | Bước riêng, có `references/first-principles.md` |
| Inversion | `brainstorming` mũ Đen; `writing-plans` bước 6 (pre-mortem, theo Gary Klein, HBR 2007); `security-and-hardening` (STRIDE vốn đã là inversion) | Mỗi lý do thất bại trong pre-mortem phải có biện pháp đối phó: test, Review focus, đổi thứ tự task hoặc câu hỏi cho người dùng |
| Systems thinking | `brainstorming` mũ Trắng (bản đồ hệ thống) và mũ Đen (hệ quả bậc 2, vòng phản hồi), chỉ với project; `code-review` mục Blast radius; `systematic-debugging` gotcha về vòng lặp | Dừng ở mức hệ quả còn làm thay đổi lựa chọn |
| Pareto | `brainstorming` bước 6 (nhát cắt phạm vi); `writing-plans` bước 3 (`Slice order`); `code-review` (xếp findings, gom Minor) | Chỉ đề xuất, không tự cắt phạm vi: phần bị hoãn chỉ được bỏ khi người dùng đồng ý |

## Quy ước artifact

- `docs/legion/specs/` và `docs/legion/plans/`: được commit, là nguồn sự thật.
- `.legion/runs/<plan>/`: ledger, brief và gói diff. Thư mục này được gitignore và
  xoá sau khi người dùng chọn cách tích hợp.
- `GLOSSARY.md` và `docs/adr/`: chỉ tạo khi có nội dung, theo cách của mattpocock.

## Kiểm thử

| Lớp | Kiểm tra gì | Chạy ở đâu | Chi phí |
|---|---|---|---|
| `scripts/validate.mjs` | Frontmatter, kích thước, file dev lọt vào `skills/`, link, `legion:` ref, router và README phủ đủ skill, version khớp, hook có quyền thực thi | CI, local | 0 |
| `scripts/trigger-evals.mjs` | Prompt dương phải xếp hạng skill trong top 3; prompt âm không được xếp skill ở hạng 1; không có hai description gần trùng nhau | CI, local | 0 |
| `tests/hooks/` | Hook xuất JSON hợp lệ, có router, và có fallback khi thiếu file | CI, local | 0 |
| `claude plugin validate --strict` | Manifest và skill theo chuẩn Claude Code | Local | 0 |
| Behavioral eval (`claude plugin eval`) | Skill có thực sự đổi hành vi agent không | Chưa có, xem roadmap | Tốn token |

Trigger eval chỉ là phép xấp xỉ theo từ vựng. Nó bắt được trường hợp description
thiếu từ người dùng hay nói, nhưng **không** chứng minh skill thực sự được kích hoạt
trên model thật.
