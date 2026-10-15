---
description: Bước 2 của HW02 — thiết kế test case EP (Domain Testing) rồi BVA cho một tính năng, giải thích từng bước, sau đó dừng cho sinh viên Human Review.
skills:
  - hw02_domain_testing
  - hw02_boundary_value_analysis
  - hw02_ai_audit
---

> **BẮT BUỘC:** nạp và đọc `.agent/skills/hw02_domain_testing/SKILL.md` và `.agent/skills/hw02_boundary_value_analysis/SKILL.md`. Kiến thức gốc: `.agent/skills/hw02_orchestrator/references/bai-4-ep-bva.md`.

# /hw02_2_design_tests — Thiết kế test case EP và BVA

## Điều kiện

- Đã có `SRS_extract` được sinh viên xác nhận (bước 1). **Chưa có thì quay lại `/hw02_1_analyze_feature`.**

## Phần A — Domain Testing (EP)

Làm theo ba bước trong skill `hw02_domain_testing`:

1. **Bước 1:** xác định đầu vào và đầu ra (cả lớp đầu ra).
2. **Bước 2:** xác định các lớp tương đương (EC), theo bốn dạng điều kiện, **ghi lý do chia**.
3. **Bước 3:** chọn đại diện, tạo test case: gộp lớp hợp lệ, cô lập mỗi lớp không hợp lệ.

Đầu ra: bảng EC, bảng test case EP, bảng truy vết, báo cáo độ phủ. Dán vào `Main_Report.md` theo `references/template.md`.

Commit gợi ý: `test(FR-XX): design EP — N lớp, M test case`.

## Phần B — Boundary Value Analysis

Làm theo skill `hw02_boundary_value_analysis`:

1. **Bước 1:** bảng biên (LB, UB, đóng/mở, δ, nominal).
2. **Bước 2:** chọn chế độ BVA và **giải thích lý do** (mặc định Robustness; Worst-case chỉ khi các biến tương tác và số tổ hợp chấp nhận được).
3. **Bước 3:** sinh vector test.
4. **Bước 4:** phân loại và **tự tính** expected (cẩn thận số âm).
5. **Bước 5:** loại trùng, so sánh số lý thuyết với số thực tế.
6. **Bước 6:** biên đầu ra (nếu đủ thông tin).

Đầu ra: bảng biên, bảng điểm biên, bảng test case BVA, báo cáo. Dán vào `Main_Report.md` theo `references/template.md`.

Commit gợi ý: `test(FR-XX): design BVA <chế độ> — M test case`.

## ⏸ ĐIỂM DỪNG — Human Review (bắt buộc)

Dừng lại và yêu cầu sinh viên:

1. **Đọc** toàn bộ EC và test case, kiểm tra từng expected với đặc tả.
2. **Sửa** những chỗ AI sai (đặc biệt số học, cận đóng/mở, δ).
3. **Bổ sung** các ca biên và ca bảo mật/đặc biệt mà AI bỏ sót (ghi vào mục *Ca bổ sung do sinh viên*).
4. Ghi lại **thay đổi** để dùng cho AI Gap Analysis.

**Không sang bước 3** khi sinh viên chưa duyệt.

Commit gợi ý sau review: `test(FR-XX): review test cases — bổ sung K ca`.

## Sau khi xong

- Ghi các lượt AI vào AI Audit, đánh dấu nháp Verdict để sinh viên xác nhận.
- Chưa chạy test. Việc chạy là của `/hw02_3_execute_and_report`.
