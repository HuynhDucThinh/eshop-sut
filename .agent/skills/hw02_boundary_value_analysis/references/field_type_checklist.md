# Gợi ý biên theo loại trường

> Công cụ hỗ trợ xác định **δ** và các biên hay gặp. **Giá trị cụ thể phải lấy từ đặc tả của feature**; nếu đặc tả không nêu, ghi `unspecified` và hỏi sinh viên. Tham khảo thêm bảng *Field-Level Validation* trong `antigravity-testing-kit` (skill `rbt_manual_testing`).

| Loại trường | δ | Biên cần xét | Ca bổ sung (robust) |
|---|---|---|---|
| Số nguyên (số lượng, tuổi…) | 1 | `min−1, min, min+1, max−1, max, max+1` | `0`, số âm, rất lớn (tràn), chuỗi chữ, số thập phân, có số `0` đứng đầu, chuỗi rỗng |
| Số thập phân / tiền | theo số chữ số thập phân cho phép (ví dụ 0,01) | tương tự số nguyên với δ tương ứng | làm tròn, dấu phân cách, định dạng tiền tệ |
| Độ dài chuỗi (tên, mật khẩu…) | 1 ký tự | `minLen−1, minLen, minLen+1, maxLen−1, maxLen, maxLen+1` | rỗng, chỉ khoảng trắng, khoảng trắng đầu/cuối, Unicode/dấu tiếng Việt, emoji |
| Ngày / giờ | đơn vị nhỏ nhất đặc tả cho phép | ngày bắt đầu/kết thúc ± 1 đơn vị | ngày không tồn tại (`31/02`), năm nhuận, múi giờ, sai định dạng |
| Khoảng ngày (ngày kết thúc ≥ bắt đầu) | 1 ngày | kết thúc = bắt đầu; kết thúc = bắt đầu − 1 | giới hạn tối đa của khoảng |
| Kích thước tệp / số dòng CSV | 1 byte / 1 dòng | `max−1, max, max+1` | tệp 0 byte, tệp rất lớn |
| Số lần thử (đăng nhập sai) | 1 lần | số lần ngay trước và đúng ngưỡng khóa | thử sau khi bị khóa, thời hạn khóa |
| Số phần tử (số sản phẩm trong giỏ, số tag) | 1 | `0, 1, max−1, max, max+1` | trùng lặp |
| Tồn kho vs số lượng đặt | 1 | `đặt = tồn kho − 1`, `= tồn kho`, `= tồn kho + 1` | tồn kho = 0 |
| Mã giảm giá vs đơn tối thiểu | δ theo đơn vị tiền | `tổng = tối thiểu − δ`, `= tối thiểu`, `= tối thiểu + δ` | hết hạn đúng thời điểm biên |
| Giá trị Boolean / tập hữu hạn | không có biên số | mỗi phần tử một ca + ca ngoài tập | — |

## Cách dùng

1. Xác định loại trường và đọc đặc tả để lấy `min`, `max`, đóng/mở.
2. Tính `δ`.
3. Điền bảng biên (Bước 1 của skill).
4. Chỉ sinh ca robust bổ sung nếu nằm trong phạm vi bài (EP/BVA). Các ca thuộc kỹ thuật khác (bảo mật chuyên sâu…) ghi là *mở rộng ngoài bài giảng*.

## Lưu ý riêng

- **Ca bảo mật** (SQL injection, XSS) không phải là phạm vi EP/BVA theo bài giảng. Nếu thêm, **do sinh viên quyết định** (human review) và ghi nhãn *mở rộng*.
- Biên của **thời gian** (khóa tài khoản trong N phút) thường khó kiểm thử vì cần chờ; ghi `Blocked` hoặc dùng cách rút ngắn thời gian nếu SUT cho phép, và nêu rõ trong báo cáo.
