---
name: hw02_orchestrator
description: Skill điều phối toàn bộ quy trình HW02 (Domain Testing và BVA trên EShop) cho một tính năng. Dùng khi bắt đầu làm HW02, khi chọn tính năng để kiểm thử, khi cần biết bước tiếp theo, hoặc khi cần kiểm tra mức hoàn thành theo thang điểm. Điều phối các skill hw02_domain_testing, hw02_boundary_value_analysis, hw02_test_executor, hw02_bug_reporter, hw02_ai_audit.
---

# HW02 — Skill điều phối

## Mục đích

Đây là **skill chủ**. Nó không tự thiết kế test case; nó quyết định **làm bước nào, bằng skill nào, dừng ở đâu chờ sinh viên**, và đảm bảo đúng quy định môn học.

Đọc trước khi làm: file quy định `.agent/rules/hw02_course_rules.md`. Kiến thức kỹ thuật gốc: `references/bai-4-ep-bva.md`.

## Nguyên tắc cốt lõi

1. **AI thực thi, người chiến lược và kiểm tra.** AI thiết kế, chạy test, ghi kết quả; sinh viên duyệt, bổ sung ca biên/bảo mật, **tự viết bug, Critique, Disclosure và tự điền Verdict** (rules §3).
2. **Hộp đen trước.** Thiết kế chỉ dựa trên đặc tả (quy định §4). Đọc code chỉ sau khi test Fail.
3. **Từng bước, có giải thích.** Không gộp bước; mỗi bước có đầu ra riêng và lý do.
4. **Thiết kế ≠ Thực thi ≠ Báo cáo.** Test case sinh ra chưa phải là test case đã chạy.
5. **Không bịa.** Không có nguồn thì hỏi; chưa chạy thì ghi `Not run`.

## Quy trình cho MỖI tính năng

```
B1 Trích đặc tả  →  B2 Domain Testing (EP)  →  B3 BVA  →  [Duyệt của người]
      →  B4 Thực thi  →  B5 Bug ứng viên  →  B6 AI Gap + Audit  →  B7 Commit
```

| Bước | Skill | Đầu ra | Điểm dừng chờ sinh viên |
|---|---|---|---|
| B1 | (orchestrator) + `references/SRS_extract.md` | Bảng đặc tả đã trích: input, output, điều kiện, điểm mơ hồ | **Có** — xác nhận đặc tả và trả lời câu hỏi mở |
| B2 | `hw02_domain_testing` | Bảng EC + bảng test case EP + truy vết | Không |
| B3 | `hw02_boundary_value_analysis` | Bảng biên + bảng test case BVA + công thức/số lượng | **Có** — Human Review: sinh viên bổ sung ca bị bỏ sót |
| B4 | `hw02_test_executor` | Bảng Actual/Pass/Fail kèm lệnh chạy thật | Không |
| B5 | `hw02_bug_reporter` | Bảng dữ kiện ứng viên bug | **Có** — sinh viên tự viết bug, chụp ảnh, tạo Issue |
| B6 | `hw02_ai_audit` | Gap Analysis + log Audit (dữ kiện khách quan) + câu hỏi gợi ý Critique | **Có** — sinh viên tự điền Verdict/Student Fix, tự viết Critique và Disclosure |
| B7 | quy định §6 | Commit từng bước | Sinh viên chạy commit |

## Chọn tính năng (khi sinh viên chưa chọn)

1. Hỏi sinh viên: nhóm đã có ai chọn tính năng nào?
2. Gợi ý **1 tính năng cho mỗi Pool A/B/C/D**, ưu tiên tính năng **có đầu vào có ràng buộc số/độ dài/tập giá trị rõ** (vì EP/BVA phát huy tác dụng) và có thể kiểm thử qua API hoặc UI.
3. Cân bằng độ khó trong nhóm: chọn tính năng quá đơn giản giới hạn điểm tối đa (chính sách bài tập).
4. Nhắc: không trùng với thành viên khác.

## Quản lý đa tính năng (Multi-Feature Management — Thực hiện 4–5 FRs)

Quy định bắt buộc khi thực hiện nhiều tính năng (4–5 FRs) trong cùng một đồ án:
1. **Tích lũy trong `reports/Main_Report.md` (Append-Only per Feature):**
   - Mỗi feature mới được **chèn tiếp nối vào cuối file (append)** dưới dạng một khối độc lập cấp 1 `# FR-XX — <Tên tính năng>`, bao gồm đầy đủ 5 phần chuẩn:
     + `0. Đặc tả kỹ thuật (SRS Extract) — Oracle` (trích từ Bước 1)
     + `1. Domain Testing (Phân hoạch tương đương)` (thiết kế từ Bước 2)
     + `2. Boundary Value Analysis` (thiết kế từ Bước 2)
     + `3. Thực thi test` (ghi nhận từ Bước 3)
     + `4. AI Gap Analysis` (phân tích từ Bước 4)
   - **TUYỆT ĐỐI KHÔNG ghi đè, xóa hoặc thay thế** các phần của những FR đã hoàn thành trước đó (bảo toàn 100% nội dung FR-03, FR-02...).
   - Cập nhật bảng "Thông tin sinh viên & Giảng viên" ở đầu file `Main_Report.md` để liệt kê đầy đủ danh sách các tính năng đang thực hiện.
2. **Tích lũy trong `reports/Bug_Report.md`:**
   - Các bug mới phát hiện của FR mới được đánh số tiếp nối (`BUG-004`, `BUG-005`...) và chèn tiếp nối vào sau các bug cũ. Cập nhật bảng tổng hợp ở mục 2.
3. **Phân lập thư mục bằng chứng (`evidence/`):**
   - Mỗi tính năng sở hữu một thư mục con riêng biệt: `reports/evidence/FR-XX/` (ví dụ `evidence/FR-03/`, `evidence/FR-08/`...) chứa script test, log chạy API/UI và ảnh chụp màn hình chứng cứ.

## Cổng chất lượng trước khi coi một feature là xong (Self-Quality Gate)

- [ ] Mỗi điều kiện đầu vào/đầu ra có EC ghi nhận, hoặc nêu lý do chưa làm được
- [ ] Mỗi EC invalid có ít nhất 1 ca cô lập lỗi (một biến sai, biến khác hợp lệ)
- [ ] Bảng truy vết EC → test case đầy đủ
- [ ] Biên đúng kiểu đóng/mở và đúng `δ` theo kiểu dữ liệu
- [ ] Mode BVA đúng và công thức đúng (`4n+1`, `6n+1`, `5^n`, `7^n`)
- [ ] Mỗi expected có nguồn đặc tả hoặc phép tính độc lập
- [ ] Có lệnh chạy thật cho mọi ca đã chạy; ca chưa chạy ghi `Not run`
- [ ] Mọi ca Fail đã được chạy lại để loại trừ lỗi môi trường
- [ ] Mục AI Gap đã điền
- [ ] Mỗi lượt AI đã được ghi vào AI Audit
- [ ] **Ngôn ngữ:** mã kiểm thử và tài liệu theo rules §5 (tiếng Việt có dấu, có ngoại lệ ảnh terminal)
- [ ] Đã commit từng bước
- [ ] **Kiểm tra tái sử dụng:** skill chạy được cho tính năng khác mà không sửa SKILL.md (không còn tên endpoint, mã FR, mã TC của một tính năng cụ thể trong phần hướng dẫn)

Không được tuyên bố "bao phủ 100%" nếu chỉ phủ các EC đã biết.

## Script hỗ trợ (`scripts/`)

| Script | Việc làm |
|---|---|
| `export_git_log.ps1` | Xuất `git log` ra `reports/git_commit_log.txt` (UTF-8, chỉ đọc) |
| `md_to_pdf.ps1` | Chuyển các file `.md` sang `.pdf` bằng Edge/Chrome headless (cần Node.js để `npx marked`) |

Script thực thi test nằm trong `hw02_test_executor/scripts/`.

## Tài liệu tham chiếu

| File | Nội dung |
|---|---|
| `references/bai-4-ep-bva.md` | Bài giảng gốc EP và BVA (nguồn kiến thức chính) |
| `references/SUT_CONTEXT.md` | Thông tin EShop: cổng, tài khoản test, cách chạy, danh sách FR |
| `references/SRS_extract.md` | Mẫu trích đặc tả (oracle) cho từng feature |
| `references/RUBRIC.md` | Thang điểm và tiêu chí chấm, cách đạt điểm cao |

> [!CAUTION]
> ### CÁC ĐIỀU KHOẢN NGHIÊM CẤM (STRICT PROHIBITIONS)
> - **[NGHIÊM CẤM]** Gộp nhiều bước chạy một lần mà bỏ qua các điểm dừng chờ sinh viên xác nhận.
> - **[NGHIÊM CẤM]** Tự đoán nghiệp vụ khi đặc tả chưa rõ ràng (phải ghi nhận ambiguity/câu hỏi mở).
> - **[NGHIÊM CẤM]** Viết thay phần sinh viên phải tự làm, **không có ngoại lệ**: mô tả bug chính thức, AI Critique, nội dung AI Disclosure, Verdict/Sinh viên sửa trong AI Audit, chữ ký (rules §3). Yêu cầu nhờ AI viết các mục này phải bị từ chối; chỉ đưa dữ kiện và khung trống.
> - **[NGHIÊM CẤM]** Ghi kết quả Actual cho test case khi chưa chạy thật.
> - **[NGHIÊM CẤM]** Sinh ảnh hoặc bằng chứng giả mạo.
