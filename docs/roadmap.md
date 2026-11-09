# Roadmap

Xếp theo thứ tự ưu tiên đề xuất. Mỗi mục chỉ nên làm khi đã gặp vấn đề thật trong
phiên làm việc (nguyên tắc "observed failure" của mattpocock).

## Gần

1. **Behavioral eval bằng `claude plugin eval`.** Viết các cặp case "fires" và
   "stays quiet" trong `evals/plugin/`, mỗi case gồm `prompt.md` và `graders/`, theo
   mẫu `addyosmani/agent-skills/evals/plugin`. Bắt đầu với `executing-plans` (TDD),
   `systematic-debugging` và `code-review`. Khi báo cáo số liệu, phải ghi lại model
   và phiên bản Claude Code.
2. **Kiểm chứng router nhẹ.** Đo trên các prompt thực tế: (a) câu hỏi đơn giản không
   được kích hoạt skill nào; (b) "fix this bug" phải kích hoạt
   `systematic-debugging`.
3. **CI.** Thêm GitHub Actions chạy `npm test`, `claude plugin validate . --strict`
   và `shellcheck hooks/session-start tests/hooks/*.sh`.

## Trung hạn

- **Eval cho `coding-principles`.** Đo xem bộ rule có thực sự đổi được quyết định thiết kế không: so sánh khi có và không có skill trên cùng một task refactor hoặc legacy. Chính agent-rules-books cũng thừa nhận chưa có số liệu thực nghiệm về điểm này.

4. **Script cho `executing-plans`.** Port `task-brief`, `review-package` và `task-done`
   từ superpowers nếu agent hay chạy sai lệnh git bằng tay.
5. **Skill setup user-invoked** (theo `setup-matt-pocock-skills`). Mục đích: cấu hình
   issue tracker, vị trí `GLOSSARY.md` và ADR cho từng repo, sau đó bổ sung
   `to-tickets` và `triage`.
6. **Skill `handoff`** (mattpocock). Dùng để nén phiên làm việc thành tài liệu cho
   agent khác tiếp tục.
7. **Skill domain từ addy**, mỗi lần thêm một skill khi có nhu cầu:
   `performance-optimization`, `observability-and-instrumentation`,
   `api-and-interface-design`, `ci-cd-and-automation`.
8. **Hook bảo vệ**, tự viết, không sao chép từ claudekit: chặn đọc `.env` và chặn
   quét `node_modules`/`dist`.

## Xa

9. **Hỗ trợ Windows:** thêm wrapper `run-hook.cmd`.
10. **Đa harness:** Codex (`.codex-plugin` và ghi chú ánh xạ tool), sau đó đến
    Cursor/OpenCode.
