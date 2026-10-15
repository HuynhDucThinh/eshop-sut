---
description: Bước 4 của HW02 — phân tích AI Gap, hoàn thiện AI Audit, hỗ trợ Disclosure và khung AI Critique, soạn gợi ý commit cho một tính năng.
skills:
  - hw02_ai_audit
---

> **BẮT BUỘC:** nạp và đọc `.agent/skills/hw02_ai_audit/SKILL.md` và `.agent/rules/hw02_course_rules.md` (§2, §3).

# /hw02_4_audit_and_gap — AI Gap, Audit, Critique

## Điều kiện

- Đã qua Human Review và đã chạy test (bước 2 và 3).

## Các bước

### A. AI Gap Analysis (cho tính năng này)

1. So sánh **bộ test case AI sinh ban đầu** với **bộ sau Human Review**. Phần sinh viên thêm vào là ứng viên khoảng trống.
2. So sánh bug thực tế với dự đoán của AI (nếu có).
3. Đối chiếu bài giảng: lớp đầu ra, biên ngoài miền, chế độ BVA, số học số âm.
4. Phân loại nguyên nhân **A** (prompt) / **B** (công cụ AI) / **C** (độ phức tạp tính năng).
5. Điền `references/gap_template.md` vào `Main_Report.md`, mục `AI Gap Analysis — <Tính năng>`.

### B. Hoàn thiện AI Audit

1. Rà `AI_Audit_Report.md`: mọi sản phẩm AI của tính năng đã có dòng chưa.
2. Điền nháp **Verdict** (VALID/INVALID/INCOMPLETE) và **Lý do (có nguồn)**, ghi rõ *"đề xuất của AI, chờ sinh viên xác nhận"*.
3. Tính bảng tổng kết độ chính xác của AI.

### C. Hỗ trợ Disclosure và Critique

1. Điền khung `AI_Disclosure.md` (các mục dữ kiện).
2. Đưa **câu hỏi gợi ý** cho AI Critique (`references/critique_template.md`). **Không viết thay.**

### D. Soạn commit

Đưa danh sách lệnh commit gợi ý theo từng bước đã hoàn thành (quy định §6). Sinh viên tự chạy.

## ⏸ ĐIỂM DỪNG — việc của sinh viên

1. **Xác nhận hoặc sửa** Verdict và điền cột **Sinh viên sửa**.
2. **Tự viết AI Critique** 200–300 từ.
3. Ký/điền các biểu mẫu Disclosure.
4. Tự chạy các lệnh commit.

## Đầu ra

- Mục AI Gap Analysis trong `Main_Report.md`.
- `AI_Audit_Report.md` cập nhật.
- Khung `AI_Disclosure.md`.
- Danh sách commit gợi ý.

Commit gợi ý: `docs(FR-XX): add AI gap analysis` và `docs(audit): log AI interactions for FR-XX`.
