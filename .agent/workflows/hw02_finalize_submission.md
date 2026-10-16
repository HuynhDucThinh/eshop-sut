---
description: Hoàn tất bài nộp HW02 — kiểm tra đủ tài liệu bắt buộc, đối chiếu số liệu, xuất git log, xuất PDF, soạn README và đặt tên file zip đúng quy định.
skills:
  - hw02_orchestrator
  - hw02_ai_audit
---

> **BẮT BUỘC:** nạp và đọc `.agent/rules/hw02_course_rules.md` (§5, §6, §7) và `.agent/skills/hw02_orchestrator/references/RUBRIC.md`.

# /hw02_finalize_submission — Hoàn tất bài nộp

> Thiếu bất kỳ tài liệu bắt buộc nào là **0 điểm**. Workflow này kiểm tra, **không tự bịa nội dung thiếu**.

## Các bước

### 1. Kiểm tra đủ 4 tính năng
- Mỗi Pool A/B/C/D có đúng một tính năng, không trùng nhóm.
- Mỗi tính năng có đủ 5 mục trong `Main_Report.md`: Đặc tả (SRS Extract), Domain Testing, BVA, Thực thi, AI Gap Analysis.

### 2. Kiểm tra tài liệu bắt buộc

Đối chiếu với checklist ở `hw02_course_rules.md` §7 (checklist trước khi nén). Báo cáo ở dạng bảng: có/thiếu.

### 3. Đối chiếu số liệu
Tính từ `Main_Report.md` rồi so với README:

| Số liệu | Nguồn tính |
|---|---|
| Số tính năng | Các mục tính năng |
| Test case thiết kế | Tổng ca EP + BVA + ca bổ sung |
| Đã chạy / Pass / Fail / Chưa chạy | Bảng thực thi |
| Số bug | `Bug_Report.md` (khớp số Issue) |

Số liệu phải khớp nhau. Lệch thì **báo cho sinh viên**, không tự chỉnh để khớp.

### 4. Xuất log Git
```powershell
./.agent/skills/hw02_orchestrator/scripts/export_git_log.ps1 -Output reports/git_commit_log.txt
```
Kiểm tra mỗi tính năng có đủ chuỗi commit các bước.

### 5. Xuất PDF
```powershell
./.agent/skills/hw02_orchestrator/scripts/md_to_pdf.ps1 -Path reports/Main_Report.md,reports/Bug_Report.md,reports/AI_Audit_Report.md,reports/AI_Critique.md,reports/AI_Disclosure.md,reports/README.md
```

### 6. Soạn README
Dùng khung dưới đây; số liệu lấy từ bước 3, **điểm tự chấm do sinh viên quyết định**, link video do sinh viên điền.

```markdown
# HW02 — Domain Testing — <MSSV> — <Họ tên>

## Bảng tự chấm
| STT | Tiêu chí | Điểm tối đa | Điểm tự chấm |
| 1 | Feature A (Domain + Boundary) | 25 | |
| 2 | Feature B (Domain + Boundary) | 25 | |
| 3 | Feature C (Domain + Boundary) | 25 | |
| 4 | Feature D — Mobile (Domain + Boundary) | 15 | |
| 5 | Agent Skills | 10 | |
| | Tổng | 100 | |

## Test Summary
| Chỉ số | Giá trị |
| Số tính năng | |
| Test case thiết kế | |
| Đã chạy | |
| Pass | |
| Fail | |
| Chưa chạy | |
| Số bug | |

## Video demo Agent Skill
<link YouTube>
```

### 7. Chạy checklist cuối
- Không có file tạm, ảnh giả, thông tin xác thực thật.
- Số file ≤ 20, mỗi file ≤ 20 MB, **tổng ≤ 20 MB** (đo lại bằng `Get-ChildItem -Recurse`).
- Đã xóa mọi `node_modules/` (ví dụ `tests/*/node_modules`) và `.git` khỏi gói nộp.
- README có link video YouTube do sinh viên tự quay (còn trống thì nhắc sinh viên, không tự bịa).
- Các mục nội dung sinh viên phải tự làm (rules §3) đã do sinh viên điền/viết và đọc lại được.
- Ảnh bằng chứng là ảnh thật, mỗi bug có link Issue.
- Critique do sinh viên viết, 200–300 từ.

### 8. Đặt tên file zip

```
<MSSV>_HW02_AI_DomainTesting_<3 chữ số điểm tự chấm>.zip
```

Ví dụ: `25127001_HW02_AI_DomainTesting_090.zip`. Điểm tự chấm do **sinh viên** quyết định.

## ⏸ ĐIỂM DỪNG — việc của sinh viên

- Điền điểm tự chấm, link video, ký các biểu mẫu.
- Tự nén và nộp lên Moodle trước hạn (**không có nộp trễ**).
- Chuẩn bị vấn đáp 5–7 phút: giải thích được EP, BVA, công thức, lý do chọn chế độ, từng bug, từng khoảng trống AI.

## Đầu ra

- Bảng kiểm tra có/thiếu.
- Báo cáo số liệu đối chiếu.
- Khung README đã điền số liệu.
- Tên file zip đề xuất.
