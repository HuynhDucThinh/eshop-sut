---
description: Bước 1 của HW02 — đọc đặc tả của một tính năng EShop, trích đầu vào/đầu ra/điều kiện, liệt kê điểm mơ hồ, rồi dừng chờ sinh viên xác nhận.
skills:
  - hw02_orchestrator
---

> **BẮT BUỘC:** nạp và đọc `.agent/skills/hw02_orchestrator/SKILL.md` và `.agent/rules/hw02_course_rules.md` trước khi làm.

# /hw02_1_analyze_feature — Trích đặc tả (hộp đen)

## Đầu vào cần từ sinh viên

| Mục | Mô tả |
|---|---|
| Tính năng | FR-XX hoặc tên chức năng Mobile |
| Pool | A / B / C / D |
| Nơi đặc tả | Đường dẫn README/SRS của SUT (hoặc dán nội dung) |

Thiếu thông tin nào thì **hỏi sinh viên**, không tự đoán.

## Các bước

1. Đọc phần đặc tả của tính năng. **Chỉ đọc đặc tả và giao diện/API contract.** Chưa đọc logic trong mã nguồn (quy định §4).
2. Điền `references/SRS_extract.md` (trong skill orchestrator): đầu vào, đầu ra, ràng buộc, nominal, cách gọi.
3. Ghi rõ **nguồn** (mục, dòng) cho mỗi điều kiện. Điều kiện nào đặc tả không nêu thì ghi `unspecified`.
4. Lập danh sách **Câu hỏi mở**: giá trị giới hạn thiếu, cận đóng/mở chưa rõ, nội dung thông báo lỗi, mâu thuẫn giữa mô tả bằng lời và điều kiện toán học.
5. Với mỗi câu hỏi mở, nêu **giả định tạm** để sinh viên chọn đồng ý hoặc đổi.
6. Kiểm tra nhanh tính khả thi: tính năng có đầu vào có ràng buộc để áp dụng EP/BVA không? Nếu quá đơn giản, nhắc sinh viên rằng sẽ giới hạn điểm tối đa.

## ⏸ ĐIỂM DỪNG — chờ sinh viên

Dừng và yêu cầu sinh viên:
- Xác nhận bảng đặc tả đã trích.
- Trả lời hoặc chấp nhận giả định cho các câu hỏi mở.

**Không sang bước 2** khi sinh viên chưa xác nhận.

## Đầu ra

- Bảng SRS extract đã điền.
- Danh sách câu hỏi mở và giả định.

## Sau khi xong

1. Ghi lượt AI vào AI Audit (skill `hw02_ai_audit`).
2. Ghi nội dung đặc tả đã xác nhận vào `reports/Main_Report.md`: Chèn section mới `# FR-XX — <Tên tính năng>` vào cuối file (append-only) với mục `0. Đặc tả kỹ thuật (SRS Extract) — Oracle`. Không ghi đè các FR trước.
3. Gợi ý commit: `test(FR-XX): extract SRS and inputs — <mô tả ngắn>`.
