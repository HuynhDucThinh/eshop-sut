---
description: Bước 3 của HW02 — chạy test case đã được sinh viên duyệt, ghi kết quả thật, phân tích ca Fail và lập bảng dữ kiện ứng viên bug cho sinh viên tự viết báo cáo.
skills:
  - hw02_test_executor
  - hw02_bug_reporter
  - hw02_ai_audit
---

> **BẮT BUỘC:** nạp và đọc `.agent/skills/hw02_test_executor/SKILL.md` và `.agent/skills/hw02_bug_reporter/SKILL.md`, cùng `.agent/rules/hw02_course_rules.md` (§3, §4).

# /hw02_3_execute_and_report — Chạy test và lập dữ kiện bug

## Điều kiện

- Test case đã qua Human Review (bước 2).
- SUT đang chạy: kiểm tra bằng `Invoke-RestMethod http://localhost:3000/api/products`.

## Các bước

1. **Chuẩn bị** `cases.json` từ bảng test case (mẫu `scripts/cases.sample.json`).
2. **Reset trạng thái** nếu nhóm ca có trạng thái (khóa tài khoản, giỏ hàng, import). **Hỏi sinh viên đồng ý** trước khi chạy `reset_state.ps1` vì lệnh xóa dữ liệu.
3. **Chạy test API** bằng `scripts/run_cases.js`. Test UI chạy bằng trình duyệt tự động, ghi lại từng bước.
4. **Chạy lại các ca Fail** ít nhất một lần để loại trừ lỗi môi trường.
5. **Ghi** kết quả vào bảng thực thi trong `Main_Report.md`: lệnh thật, expected, actual, trạng thái.
6. **Với mỗi ca Fail ổn định:**
   - Kiểm tra expected theo đặc tả. Mơ hồ thì ghi *Câu hỏi mở*, hỏi sinh viên.
   - **Từ lúc này được đọc mã nguồn** để tìm nguyên nhân gốc (quy định §4, giai đoạn B). Ghi tệp:dòng.
   - Gom các ca cùng nguyên nhân thành một ứng viên bug.
7. **Lập bảng dữ kiện ứng viên bug** (skill `hw02_bug_reporter`). **Không viết mô tả bug.**
8. Cập nhật Test Summary tạm: số ca đã chạy, Pass, Fail, Blocked, Not run.

Commit gợi ý: `test(FR-XX): execute EP and BVA — P pass, F fail`.

## ⏸ ĐIỂM DỪNG — việc của sinh viên

Dừng và nhắc sinh viên:

1. **Xác minh** lại các ca Fail trên SUT.
2. **Tự viết** bug trong `Bug_Report.md` theo khung `references/bug_template.md`.
3. **Chụp ảnh thật** lưu vào `reports/evidence/FR-XX/BUG-NNN.png`.
4. **Tự tạo GitHub Issue** có ảnh, ghi link vào báo cáo.

Sau khi sinh viên báo xong, AI **kiểm tra đủ trường** (không viết thay).

Commit gợi ý: `docs(FR-XX): add bug report BUG-001, BUG-002`.

## Đầu ra

- Bảng thực thi có lệnh thật và kết quả thật.
- Bảng dữ kiện ứng viên bug.
- Số liệu Test Summary tạm thời.

## Cấm

- ❌ Ghi Actual cho ca chưa chạy
- ❌ Viết mô tả bug thay sinh viên
- ❌ Sửa Expected để khớp code
- ❌ Chạy lệnh xóa dữ liệu khi chưa được đồng ý
