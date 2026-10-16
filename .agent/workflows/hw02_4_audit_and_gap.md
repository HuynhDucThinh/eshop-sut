---
description: Bước 4 của HW02 — phân tích AI Gap, ghi log AI Audit (dữ kiện khách quan), chuẩn bị khung Disclosure và câu hỏi gợi ý cho AI Critique, soạn gợi ý commit cho một tính năng.
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

### B. Ghi log AI Audit

1. Rà `AI_Audit_Report.md`: mọi sản phẩm AI của tính năng đã có dòng chưa (chỉ **append**, không sửa dòng cũ).
2. Điền **dữ kiện khách quan** (công cụ, thời gian, prompt nguyên văn, đường dẫn đầu ra). **Để trống Verdict, Lý do và Sinh viên sửa** — nghiêm cấm AI điền hay đề xuất nhãn.
3. Tính bảng tổng kết từ các nhãn sinh viên đã điền (chưa có nhãn thì để trống).

### C. Chuẩn bị khung Disclosure và Critique

1. Tạo **khung trống** `AI_Disclosure.md` kèm dữ kiện khách quan (công cụ, thời gian). **Không điền nội dung khai báo, không ký.**
2. Đưa **câu hỏi gợi ý** cho AI Critique (`references/critique_template.md`). **Không viết thay.**

### D. Soạn commit

Đưa danh sách lệnh commit gợi ý theo từng bước đã hoàn thành (quy định §6). Sinh viên tự chạy.

## ⏸ ĐIỂM DỪNG — việc của sinh viên

1. **Tự điền** Verdict, Lý do (có nguồn) và cột **Sinh viên sửa** trong AI Audit.
2. **Tự viết AI Critique** 200–300 từ.
3. **Tự điền nội dung AI Disclosure** và tự ký các biểu mẫu.
4. Tự chạy các lệnh commit.

## Đầu ra

- Mục AI Gap Analysis trong `Main_Report.md`.
- `AI_Audit_Report.md` cập nhật (dữ kiện khách quan, ô Verdict để trống).
- Khung trống `AI_Disclosure.md`.
- Danh sách commit gợi ý.

Commit gợi ý: `docs(FR-XX): add AI gap analysis` và `docs(audit): log AI interactions for FR-XX`.
