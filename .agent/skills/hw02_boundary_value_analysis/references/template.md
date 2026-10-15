# Khuôn báo cáo BVA — dán vào `Main_Report.md`

```markdown
## 2. Boundary Value Analysis — FR-XX: [Tên tính năng]

**Chế độ BVA:** Standard / Robustness / Worst-case / Robust Worst-case
**Lý do chọn chế độ:** …
**Ngày thiết kế:** YYYY-MM-DD

### Bước 1 — Xác định phân vùng có thứ tự và các cận

| B ID | Biến | Ràng buộc (trích đặc tả) | LB | UB | Loại cận LB | Loại cận UB | δ | Nominal | Nguồn |
|---|---|---|---|---|---|---|---|---|---|

**Giải thích:** (vì sao δ như vậy; cận đóng hay mở)

### Bước 2 — Chọn chế độ và điểm cần kiểm tra

| Điểm | Biến | Giá trị | Quan hệ với biên | Hợp lệ? |
|---|---|---|---|---|

**Công thức:** … = … ca (lý thuyết)

### Bước 3 — Test case BVA

| TC ID | Biên nhắm tới | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|

**Giải thích:** (cách tính expected; điểm nào trùng đã loại)

### Bước 4 — Biên đầu ra (nếu có)

| Biên đầu ra | Input gây ra | Test case |
|---|---|---|

### Bước 5 — Ca bổ sung do sinh viên (sau Human Review)

| TC ID | Lý do bổ sung | Dữ liệu vào | Kết quả mong đợi |
|---|---|---|---|

### Tổng kết

- Số ca theo công thức:
- Số ca thực tế duy nhất:
- Số ca đã loại trùng:
- Vấn đề oracle / mơ hồ chưa giải quyết:
```
