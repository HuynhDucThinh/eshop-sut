---
name: hw02_test_executor
description: Thực thi bộ test case đã duyệt (Domain Testing và BVA) cho BẤT KỲ tính năng EShop nào theo 2 hướng — HTTP API (script run_cases.js, đối chiếu mã phản hồi và trạng thái dữ liệu) và Playwright (giao diện, HTML5 DOM, ảnh bằng chứng). Chỉ ghi kết quả thật, chạy lại ca Fail để loại trừ lỗi môi trường, xuất log JSON và bảng Markdown cho báo cáo.
---

# HW02 Test Executor — Thực thi kiểm thử 2 hướng

> Quy tắc chung (ngôn ngữ, hộp đen, phân vai, Git): xem `.agent/rules/hw02_course_rules.md` §3, §4, §5. Không nhắc lại ở đây.

## Nguyên tắc

1. **Thiết kế ≠ Thực thi.** Ca chỉ tính là đã chạy khi có **lệnh thật** và **kết quả thật**. Chưa chạy thì ghi `Not run`; không bịa Actual.
2. **Clean Code:** tách *Hành động* (action), *Xác minh* (oracle), *Dữ liệu mẫu* (fixture); tên hàm nêu rõ ý định kiểm thử.
3. **Không gắn cứng vào một tính năng.** Mọi tên endpoint, selector, mã TC lấy từ bảng test case của tính năng đang làm.

## Hai hướng thực thi

| | Hướng 1 — HTTP API | Hướng 2 — Playwright |
|---|---|---|
| Mục đích | Phủ dữ liệu và biên; kiểm tra trạng thái dữ liệu sau hành động | Ràng buộc giao diện (HTML5 `type`, chỉ báo bước, trường bắt buộc), ảnh bằng chứng |
| Công cụ | `scripts/run_cases.js` (không cần cài thư viện, Node 18+) hoặc `scripts/api_test_template.js` khi cần oracle phức tạp | `scripts/playwright_ui_template.spec.js` (điền khối `FEATURE`) |
| Đầu ra | `run_api_N.json` + `run_api_N.md` | `run_ui_N.json`, ảnh `.png` trong `reports/evidence/FR-XX/` |

Tệp trong `scripts/`:

| Tệp | Công dụng |
|---|---|
| `run_cases.js` | Chạy hàng loạt ca API từ `cases.json`, sinh bảng Markdown có lệnh `curl`/PowerShell tái hiện |
| `cases.sample.json` | Mẫu khai báo ca (`id`, `covers`, `method`, `path`, `body`, `expectStatus`, …) |
| `api_test_template.js` | Mẫu 3 tầng ApiClient / StateOracle / ApiTestRunner |
| `playwright_ui_template.spec.js` | Mẫu Page Object, tự bỏ qua ca nếu đặc tả không có yêu cầu |
| `reset_state.ps1` | Reset dữ liệu SUT (xóa dữ liệu — **phải được sinh viên đồng ý**) |

## Quy trình 6 bước

1. **Chuẩn bị nền:** backend (`localhost:3000`) và frontend (`localhost:5173`) chạy được. Ưu tiên chạy trên **CSDL tạm** (đặt biến `DB_PATH` và `JWT_SECRET` khi khởi động backend) để không làm hỏng dữ liệu thật; giải phóng cổng 3000 trước và sau khi chạy.
2. **Chạy hướng 1 (API):** `node .agent/skills/hw02_test_executor/scripts/run_cases.js <cases.json> --out reports/evidence/FR-XX/run_api_1`.
3. **Chạy hướng 2 (UI):** `npx playwright test <spec> ` từ thư mục chứa `package.json` của bộ UI; đặt `RUN_NAME` nếu cấu hình dùng.
4. **Chạy lại mọi ca Fail ít nhất 1 lần nữa** (`run_api_2`, `run_ui_2`). Kết quả giống nhau mới coi là lỗi ổn định.
5. **Phân tích nguyên nhân gốc** chỉ sau khi Fail ổn định (quy định §4, giai đoạn B): mới được đọc mã nguồn để ghi `tệp:dòng`. Không sửa Expected cho khớp code.
6. **Bàn giao:** điền cột `Actual` và `Trạng thái` vào `Main_Report.md`, chuyển danh sách Fail sang `hw02_bug_reporter`.

### Lưu ý thực tế khi chạy trên Windows

- Dùng PowerShell `Invoke-RestMethod`/`Invoke-WebRequest -SkipHttpErrorCheck`; `curl.exe` với JSON có dấu nháy hay bị lỗi 400 do quoting.
- Ảnh bằng chứng terminal phải là **output thật** của lệnh đã chạy, không trang trí (ngoại lệ ngôn ngữ ở rules §5).
- Dọn dẹp tiến trình backend/frontend sau khi chạy; trước khi nộp bài xóa `node_modules/`.

## Khi đặc tả thay đổi (đồng bộ lan truyền)

1. Xác định trường/quy tắc đổi và các `EC`, `TC` bị ảnh hưởng.
2. Cập nhật `Expected` và `Nguồn expected` của các ca đó; giữ nguyên ca không ảnh hưởng.
3. Chạy lại các ca ảnh hưởng để lấy Actual thật.
4. Đồng bộ `Main_Report.md`: bảng thực thi, mọi bảng tổng hợp Pass/Fail/Blocked/Not run, danh sách ứng viên bug (ca chuyển Fail → Pass thì loại khỏi bug), AI Gap Analysis và AI Audit.

## Cổng chất lượng

- [ ] Mọi `Pass`/`Fail` có lệnh chạy thật và log thật; ca chưa chạy ghi `Not run`
- [ ] Ca API kiểm tra cả mã HTTP lẫn trạng thái dữ liệu (oracle độc lập)
- [ ] Ca không làm hỏng dữ liệu của ca khác (reset hoặc dùng tài khoản riêng)
- [ ] Lỗi giao diện có ảnh `.png` thật trong `reports/evidence/FR-XX/`
- [ ] Mọi ca Fail đã chạy lại ≥ 2 lần cho kết quả nhất quán
- [ ] Không sửa `Expected` để ép Pass
- [ ] Không in mật khẩu/token thật ra báo cáo (mask `***`)

> [!CAUTION]
> ### CÁC ĐIỀU KHOẢN NGHIÊM CẤM (STRICT PROHIBITIONS)
> - **[NGHIÊM CẤM]** Tự điền `Pass`/`Fail` khi chưa chạy lệnh thật trên SUT.
> - **[NGHIÊM CẤM]** Đọc mã nguồn để sửa `Expected` theo code sai của hệ thống.
> - **[NGHIÊM CẤM]** Dùng `sleep` cứng dài; ưu tiên chờ theo điều kiện (polling/auto-wait của Playwright).
> - **[NGHIÊM CẤM]** Lưu mật khẩu/token thật vào mã nguồn hoặc báo cáo công khai.
> - **[NGHIÊM CẤM]** Chạy `reset_state.ps1` hoặc lệnh xóa dữ liệu khi chưa được sinh viên đồng ý.
