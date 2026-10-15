# Khuôn báo cáo Domain Testing (EP) — dán vào `Main_Report.md`

```markdown
## 1. Domain Testing (Phân hoạch tương đương) — FR-XX: [Tên tính năng]

**Thành phần kiểm thử:** Web / Admin / Mobile / API
**Nguồn đặc tả:** [README SUT, mục …]
**Ngày thiết kế:** YYYY-MM-DD

### Bước 1 — Xác định đầu vào và đầu ra

| Thành phần | Tên | Kiểu | Ràng buộc | Nguồn |
|---|---|---|---|---|
| Input | | | | |
| Output hợp lệ | | | | |
| Output lỗi | | | | |

**Giải thích:** (vì sao các đầu vào/đầu ra này là đủ; điểm mơ hồ nào còn lại)

### Bước 2 — Xác định các lớp tương đương

| EC ID | Yêu cầu | Biến / Đầu ra | Điều kiện | Loại | Giá trị đại diện | Lý do chia |
|---|---|---|---|---|---|---|

**Giải thích:** (dạng điều kiện đã dùng, vì sao chia/gộp như vậy)

### Bước 3 — Chọn đại diện và tạo test case

| TC ID | EC phủ | Điều kiện tiên quyết | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|

**Giải thích:** (ca nào gộp lớp hợp lệ; ca nào cô lập lỗi)

### Truy vết EC → Test case

| EC ID | Test case phủ |
|---|---|

### Báo cáo độ phủ

- Số điều kiện đã phân tích:
- Lớp EP: V hợp lệ + I không hợp lệ + O lớp đầu ra
- Lớp đã phủ: C / tổng
- Số test case EP:
- Giả định / Câu hỏi mở:
```
