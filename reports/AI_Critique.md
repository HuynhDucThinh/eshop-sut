# AI Critique — HW02

> **Ghi chú liêm chính học thuật:** Bài phản biện dưới đây được xây dựng từ dữ kiện kiểm thử thực tế xuyên suốt cả 4 tính năng (FR-03, FR-08, FR-14, FR-20) trên hệ thống EShop; sinh viên Huỳnh Đức Thịnh trực tiếp rà soát, thẩm định và chịu trách nhiệm về nội dung nộp.

---

## 1. Thông tin sinh viên & Môn học

| Mục | Nội dung |
|---|---|
| **Họ và tên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Lớp / Khóa** | CQ2023/31 |
| **Môn học** | CS423 / CSC13003 – Kiểm thử phần mềm |
| **Giảng viên hướng dẫn** | ThS. Hồ Tuấn Thanh |
| **Các tính năng thực hiện** | FR-03 (Quên mật khẩu — Pool A), FR-08 (Thanh toán — Pool B), FR-14 (Quản lý Danh mục — Pool C), FR-20.3 (Mobile Thanh toán & Mã giảm giá — Pool D) |
| **Ngày lập báo cáo** | 16/10/2026 |

---

## 2. Các câu hỏi định hướng của đề bài (Mục 10)

Bài viết phản biện bắt buộc trả lời trực diện 3 câu hỏi cốt lõi từ đề bài:
1. **AI đã sai, phiến diện (bias) hoặc thiếu sót ở những điểm nào?**
2. **Tại sao AI lại không phát hiện được các vấn đề đó?**
3. **Nguyên tắc và bài học kinh nghiệm bạn rút ra khi cộng tác cùng AI trong kiểm thử phần mềm là gì?**

---

## 3. Bài viết phản biện AI (200–300 từ)

Trong quá trình kiểm thử 4 tính năng (FR-03, FR-08, FR-14, FR-20) trên EShop, em thấy AI hỗ trợ hiệu quả ở việc đọc đặc tả, chia lớp tương đương (EP), tính điểm biên Robustness ($6n+1$) và sinh mã kiểm thử tự động. AI đề xuất phù hợp các ca biên địa chỉ 254/255/256 ký tự, ngưỡng đơn hàng và phân quyền RBAC, giúp phát hiện lỗi không xóa giỏ hàng và thiếu quyền Admin (`BUG-009`).

Tuy nhiên, AI bộc lộ hạn chế khi phân tích từng request riêng lẻ và chia lớp đơn chiều. Ở FR-08 và FR-20, AI ban đầu bỏ sót lỗi gian lận giá client-side, lỗi IDOR đọc đơn hàng người khác (`BUG-007`) và logic ngầm về giới hạn lượt dùng coupon C5. Ở FR-14, AI chỉ kiểm tra bảng `categories` mà chưa chú ý tính toàn vẹn liên bảng, dẫn đến xóa danh mục làm mồ côi sản phẩm (`BUG-011`). Nguyên nhân là AI chủ yếu phản hồi theo ngữ cảnh hẹp của prompt, chưa mô hình hóa máy trạng thái xuyên suốt và khó suy luận các ràng buộc cơ sở dữ liệu ngầm định.

Bài học em rút ra là không nên xem kết quả của AI như nguồn chuẩn mực duy nhất. Người kiểm thử cần chủ động đối chiếu đặc tả, bổ sung các ca kiểm thử bảo mật, tương tác đồng thời và liên kết dữ liệu, cũng như trực tiếp kiểm chứng lại các lỗi trên hệ thống thực tế.

---

## 4. Bảng kiểm đếm số từ

| Tiêu chí kiểm tra | Yêu cầu đề bài | Thực tế đạt được | Đánh giá |
|---|---:|---:|:---:|
| Số từ tối thiểu | 200 từ | 251 từ | **Đạt** |
| Số từ tối đa | 300 từ | 251 từ | **Đạt** |
| Trả lời đủ 3 câu hỏi trọng tâm | Bắt buộc | Đã trả lời ở 3 đoạn riêng biệt | **Đạt** |
| Dẫn chứng ca kiểm thử & bug thật | Bắt buộc | `BUG-007`, `BUG-009`, `BUG-011`, FR-03, FR-08, FR-14, FR-20 (FR-20.3), C5 | **Đạt** |
| Danh tính sinh viên & Liêm chính học thuật | Bắt buộc | Huỳnh Đức Thịnh — 23120199 | **Đạt** |

