# Ví dụ mẫu — EP cho chương trình cộng hai số (bài giảng)

> Nguồn: bài giảng trang 1–18. Dùng để làm mẫu trình bày, **không sao chép sang bài của feature thật**.

## Đặc tả

- A, B là số nguyên, `−99 ≤ A ≤ 99`, `−99 ≤ B ≤ 99` (cận đóng, bước 1, gồm `0`).
- Hợp lệ: `SUM = A + B`. Không hợp lệ: thông báo lỗi (nội dung chưa quy định).
- Số cặp hợp lệ: `199 × 199 = 39.601` — không thể thử hết, nên cần EP.

## Bước 1 — Đầu vào và đầu ra

| Thành phần | Mô tả |
|---|---|
| Input A | Số nguyên, `−99 … 99` |
| Input B | Số nguyên, `−99 … 99` |
| Output SUM | Tổng của A và B |
| Output lỗi | Thông báo lỗi |

## Bước 2 — Lớp tương đương

| EC | Thành phần | Lớp | Loại |
|---|---|---|---|
| EC1 | A | `−99 ≤ A ≤ 99`, A nguyên | Hợp lệ |
| EC2 | A | `A < −99`, A nguyên | Không hợp lệ |
| EC3 | A | `A > 99`, A nguyên | Không hợp lệ |
| EC4 | A | A không phải số nguyên | Không hợp lệ |
| EC5 | B | `−99 ≤ B ≤ 99`, B nguyên | Hợp lệ |
| EC6 | B | `B < −99`, B nguyên | Không hợp lệ |
| EC7 | B | `B > 99`, B nguyên | Không hợp lệ |
| EC8 | B | B không phải số nguyên | Không hợp lệ |
| EC9 | SUM | `SUM = A + B` | Đầu ra hợp lệ |
| EC10 | SUM | Thông báo lỗi | Đầu ra khi đầu vào sai |

## Bước 3 — Đại diện và test case (bộ rút gọn 7 ca)

| TC | EC phủ | A | B | Kết quả mong đợi |
|---|---|---:|---:|---|
| TC1 | EC1, EC5, EC9 | 10 | 9 | 19 |
| TC2 | EC2, EC10 | −102 | 9 | Thông báo lỗi |
| TC3 | EC3, EC10 | 102 | 9 | Thông báo lỗi |
| TC4 | EC4, EC10 | `Abc` | 9 | Thông báo lỗi |
| TC5 | EC6, EC10 | 10 | −200 | Thông báo lỗi |
| TC6 | EC7, EC10 | 10 | 200 | Thông báo lỗi |
| TC7 | EC8, EC10 | 10 | `1.25` | Thông báo lỗi |

## Điều rút ra

- TC1 phủ **cùng lúc** hai lớp đầu vào hợp lệ và lớp đầu ra hợp lệ (gộp ca hợp lệ).
- TC2–TC7 **cô lập** mỗi lỗi (một đầu vào sai, đầu vào kia vẫn hợp lệ).
- EC10 đã được phủ qua nhiều ca nên không cần ca riêng.
- Trong bản đầu (trang 17) có ca bị lặp, bản rút gọn (trang 18) loại các ca trùng.
- Giả định "mỗi lớp một đại diện" **không** chứng minh cả lớp đúng. Đó là lý do cần BVA ở bước sau.

## Áp dụng với API thật

Với API, `1.25` hay `Abc` có thể bị lớp ràng buộc kiểu từ chối **trước khi** đến logic nghiệp vụ (lỗi binding khác lỗi nghiệp vụ). Khi đó ghi rõ ca thuộc tầng nào, đừng giả định hai loại lỗi cho cùng kết quả.
