# Legion

Plugin skill cho Claude Code. Legion buộc agent làm việc như một kỹ sư có kỷ luật:
làm rõ ý định trước khi code, lên kế hoạch theo lát cắt dọc, viết test trước,
review trên hai trục, và chỉ báo "xong" khi có bằng chứng.

Khung quy trình dựa trên [superpowers](https://github.com/obra/superpowers),
bổ sung điểm mạnh của [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills),
[mattpocock/skills](https://github.com/mattpocock/skills) và
[agent-rules-books](https://github.com/ciembor/agent-rules-books). Nguồn gốc từng phần
xem [THIRD_PARTY.md](THIRD_PARTY.md) và [docs/architecture.md](docs/architecture.md).

## Khác superpowers ở đâu

- **Router nhẹ.** Câu hỏi và việc nhỏ được trả lời ngay, không kéo theo quy trình.
  Skill chỉ được nạp khi task khớp rõ ràng. Riêng các skill kỷ luật (executing-plans,
  debug), một khi đã nạp thì luật cứng vẫn giữ nguyên.
- **Ngôn ngữ chung.** `GLOSSARY.md` và ADR (từ mattpocock) được đưa vào brainstorming,
  TDD và review.
- **Review hai trục.** Spec và Standards chạy song song trong hai subagent riêng
  (mattpocock), dùng nhãn mức độ của addy, kèm smell baseline.
- **Debug bắt đầu từ feedback loop.** Theo mattpocock: phải có lệnh tái hiện lỗi
  ra đỏ trước rồi mới đến giả thuyết. Giữ luật "3 lần sửa thất bại thì xem lại
  kiến trúc" của superpowers.
- **Best practice từ sách kinh điển.** `coding-principles` chọn một bộ rule chính (tối đa thêm một bộ bổ trợ) trong 14 bộ của agent-rules-books, theo loại task và ma trận tương thích. Bộ rule được ghi vào plan, implementer dùng khi viết code và REFACTOR, reviewer kiểm theo checklist của chính bộ đó.
- **Brainstorming nhiều góc nhìn.** Rút bài toán về những gì *phải đúng* (first principles), so sánh phương án bằng 6 chiếc mũ tư duy theo chuỗi "chọn giữa các phương án" của de Bono, rồi grill thiết kế theo vòng cho tới khi không còn quyết định nào bị ngầm định. Độ sâu tuỳ theo kích thước việc.
- **Mô hình tư duy đặt đúng chỗ ra quyết định.** First principles nằm ở brainstorming. Inversion là mũ Đen trong brainstorming và bước pre-mortem trong writing-plans. Systems thinking là bản đồ hệ thống và hệ quả bậc 2 trong brainstorming, blast radius trong code-review và vòng phản hồi trong debug. Pareto là nhát cắt phạm vi trong brainstorming, thứ tự slice trong writing-plans và cách xếp findings trong code-review.
- **Spec-driven + test-driven xuyên suốt.** TDD bắt đầu bằng việc chốt acceptance criteria; mỗi test phải truy về một criterion; mỗi task trong plan ghi rõ nó hiện thực yêu cầu nào trong spec.
- **Chuẩn agentskills.io.** Mọi skill được viết lại bằng `skill-creator`: description nêu cả *what* lẫn *when*, thân bài theo khung Workflow / Gotchas, template dài nằm trong `assets/`, và validator của skill-creator chạy trong `npm test`.
- **Trigger eval tất định.** Theo addy: CI kiểm tra description có đủ từ vựng mà
  người dùng thực sự dùng.

## Cài đặt

Chạy thử trực tiếp từ thư mục:

```bash
claude --plugin-dir /path/to/legion
```

Hoặc cài qua marketplace cục bộ:

```
/plugin marketplace add /path/to/legion
/plugin install legion@legion-dev
```

> Nếu đang bật superpowers, hãy tắt nó khi dùng Legion. Cả hai đều chèn router ở
> SessionStart và có các skill trùng tên (brainstorming, writing-plans, TDD...):
> `claude plugin disable superpowers@claude-plugins-official`

## Quy trình

```
brainstorming ─▶ writing-plans ─▶ executing-plans ─▶ code-review (cuối)
     │                                  │
     └─ defining-terms                  └─ spec + TDD + coding-principles + cổng bằng chứng trong mọi task,
                                           inline hay subagent do agent tự chọn theo từng task
```

Mức độ áp dụng tuỳ theo độ lớn của việc. Thay đổi nhỏ thì brainstorming chỉ còn
một bước xác nhận ngắn. Việc vặt thì bỏ qua toàn bộ quy trình.

Tài liệu do agent tạo ra:

| Loại | Vị trí |
|---|---|
| Design doc | `docs/legion/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `docs/legion/plans/YYYY-MM-DD-<topic>.md` |
| Ledger khi chạy plan (gitignored) | `.legion/runs/<plan>/progress.md` |
| Ngôn ngữ chung | `GLOSSARY.md`, `docs/adr/NNNN-*.md` |

## Skill

| Skill | Dùng khi | Nguồn chính |
|---|---|---|
| `using-legion` | Router, được nạp ở SessionStart | superpowers, viết lại cho nhẹ |
| `brainstorming` | Làm rõ ý định, tư duy first principles, so sánh phương án bằng 6 chiếc mũ tư duy, grill theo vòng (gộp từ skill grilling cũ, kể cả khi chỉ cần stress-test một plan), viết design doc, ghi ADR | superpowers + addy (spec) + mattpocock (grilling, ADR) + de Bono |
| `defining-terms` | Thuật ngữ, `GLOSSARY.md` | mattpocock |
| `writing-plans` | Chia spec thành task theo lát cắt dọc, xếp slice theo giá trị (Pareto), pre-mortem | superpowers + addy (slicing, sizing) + Klein (pre-mortem) |
| `executing-plans` | Mọi việc code, có hoặc không có plan: chốt acceptance criteria, TDD, theo coding-principles, cổng bằng chứng trước khi báo xong. Agent tự chọn inline hay subagent cho từng task, có ledger. Subagent viết code chạy trong git worktree riêng, model chọn theo vai trò (haiku/sonnet/opus). Gộp từ TDD và verification cũ. | superpowers (executing-plans + SDD + TDD + verification) + mattpocock (seams, anti-patterns) |
| `systematic-debugging` | Bug, test fail, chậm, flaky | mattpocock (feedback loop) + superpowers |
| `code-review` | Review diff/PR hai trục; tiếp nhận review | mattpocock + addy + superpowers |
| `coding-principles` | Chọn 1–2 bộ rule từ sách kinh điển (Clean Code, APoSD, Refactoring, WELC, Clean Architecture, DDD, DDIA, Release It!...) để định hình code, tránh cặp xung đột | agent-rules-books (14 bản mini) |
| `security-and-hardening` | Input không tin cậy, auth, secret, PII, LLM output | addy (rút gọn) |
| `skill-creator` | Tạo, sửa, kiểm tra skill theo chuẩn agentskills.io | duongot-skills/skill-creator |

## Phát triển

```bash
npm test                 # validate + validate:spec + trigger evals + hook test
npm run validate         # cấu trúc repo: link, router, README, manifest, version
npm run validate:spec    # từng skill theo agentskills.io (validator của skill-creator, cần python3)
npm run evals:triggers   # định tuyến từ vựng (TF-IDF)
claude plugin validate . --strict
```

Quy ước cho người đóng góp (kể cả agent) nằm trong [AGENTS.md](AGENTS.md). Việc
còn lại nằm trong [docs/roadmap.md](docs/roadmap.md).

## License

MIT. Xem [LICENSE](LICENSE) và [THIRD_PARTY.md](THIRD_PARTY.md).
