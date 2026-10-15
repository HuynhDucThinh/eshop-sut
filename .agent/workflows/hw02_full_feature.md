---
description: Chạy trọn một tính năng HW02 từ đầu đến cuối (trích đặc tả → EP → BVA → chạy test → bug → AI Gap/Audit) với các điểm dừng chờ sinh viên. Dùng để quay video demo Agent Skill.
skills:
  - hw02_orchestrator
  - hw02_domain_testing
  - hw02_boundary_value_analysis
  - hw02_test_executor
  - hw02_bug_reporter
  - hw02_ai_audit
---

> **BẮT BUỘC:** nạp và đọc `.agent/skills/hw02_orchestrator/SKILL.md` và `.agent/rules/hw02_course_rules.md` trước khi bắt đầu.

# /hw02_full_feature — Chạy trọn một tính năng

> Workflow này **nối** bốn workflow nhỏ và giữ nguyên mọi điểm dừng. Dùng khi **quay video demo** (đề bài yêu cầu video YouTube trình bày end-to-end trên một feature, sinh viên tự quay, có giọng nói của mình). Nên **nói to** lý do của mỗi bước khi quay.

## Đầu vào

| Mục | Mô tả |
|---|---|
| Tính năng | FR-XX hoặc Mobile-… |
| Nơi đặc tả | Đường dẫn README/SRS của SUT |
| Chế độ BVA mong muốn | Mặc định Robustness (hỏi nếu muốn khác) |

## Trình tự

```
1. /hw02_1_analyze_feature      ⏸ sinh viên xác nhận đặc tả
2. /hw02_2_design_tests         ⏸ sinh viên Human Review (bổ sung ca biên/bảo mật)
3. /hw02_3_execute_and_report   ⏸ sinh viên viết bug, chụp ảnh, tạo Issue
4. /hw02_4_audit_and_gap        ⏸ sinh viên xác nhận Audit, tự viết Critique
```

Ở mỗi bước: **làm đúng nội dung của workflow tương ứng**, **dừng ở điểm dừng**, **không chạy vượt**.

## Quy tắc xuyên suốt

1. Hộp đen trước (quy định §4).
2. Giải thích **từng bước** và lý do (đề bài yêu cầu giải thích chi tiết).
3. Sau mỗi bước có sản phẩm, **ghi log AI Audit** và **gợi ý commit** của bước đó.
4. Không bịa kết quả, không sinh ảnh giả, không viết thay phần sinh viên phải tự làm (quy định §3).
5. Cuối tính năng: cập nhật Test Summary tạm và nhắc sinh viên bước tiếp theo.

## Kịch bản gợi ý cho video demo (sinh viên tự quay)

| Phút | Việc làm | Nói gì |
|---|---|---|
| 0–1 | Giới thiệu bộ skills và cấu trúc `.agent/` | Skill giúp AI làm đúng từng bước của EP/BVA |
| 1–3 | Chạy bước 1 | Trích đặc tả, nguồn, câu hỏi mở |
| 3–6 | Chạy bước 2 | Cách chia lớp, vì sao chọn chế độ BVA, công thức |
| 6–7 | Human Review | Sửa/bổ sung gì, vì sao |
| 7–10 | Chạy bước 3 | Chạy test thật, ca Fail, nguyên nhân gốc |
| 10–12 | Bước 4 | AI Gap, AI Audit |
| 12–13 | Kết | Tổng kết số liệu |

Link video YouTube được ghi vào `README.md`.

## Sau khi xong một tính năng

- Cập nhật Test Summary.
- Nhắc sinh viên các việc còn lại: Critique, Disclosure, ảnh, Issue, commit.
- Khi đã xong **cả 4 tính năng**, chạy `/hw02_finalize_submission`.
