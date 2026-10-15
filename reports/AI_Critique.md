# AI Critique — HW02

> **Ngoại lệ giảng viên ngày 13/10/2026:** Theo xác nhận của sinh viên, AI được phép hoàn thiện các yêu cầu còn lại của bài. Bài phản biện dưới đây được AI hỗ trợ hoàn thiện từ dữ kiện kiểm thử thật và được khai báo trong `AI_Audit_Report.md`/`AI_Disclosure.md`; sinh viên chịu trách nhiệm đọc lại trước khi nộp.

---

## 1. Thông tin sinh viên & Môn học

| Mục | Nội dung |
|---|---|
| **Họ và tên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Lớp / Khóa** | CQ2023/31 |
| **Môn học** | CS423 / CSC13003 – Kiểm thử phần mềm |
| **Giảng viên hướng dẫn** | ThS. Hồ Tuấn Thanh |
| **Tính năng thực hiện** | FR-03: Quên mật khẩu & Đặt lại mật khẩu (Pool A); FR-08: Thanh toán (Pool B) |
| **Ngày cập nhật khung gợi ý** | 13/10/2026 |

---

## 2. Câu hỏi gợi ý định hướng bài viết (3 câu hỏi cốt lõi)

Khi viết đoạn văn 200–300 từ, bạn cần trả lời đủ 3 luận điểm chính dựa trên trải nghiệm thực tế với FR-03 và FR-08. Bạn tự chọn các dẫn chứng tiêu biểu; không cần liệt kê tất cả:

1. **AI sai, thiên lệch hoặc bỏ sót ở điểm nào trong bài của bạn?**
   - *Gợi ý FR-03*: AI tập trung vào request đơn lẻ, bỏ qua việc mã mới phải hủy mã cũ (`SR-TC02`); chưa xét OTP có số `0` ở đầu (`SR-TC01`); chưa phát hiện lỗi giao diện thiếu trường "Xác nhận mật khẩu" (`BUG-003`) trước khi chạy UI.
   - *Gợi ý FR-08*: AI chưa xét sản phẩm đổi giá giữa lúc thêm giỏ và checkout (`SR-TC01`), hai request đồng thời (`SR-TC02`) và quyền sở hữu đơn hàng tại endpoint đọc chi tiết (`SR-TC05`). `SR-TC05` đã phát hiện IDOR `BUG-007`.
2. **Nguyên nhân vì sao AI lại có khoảng trống đó?**
   - *Gợi ý*: Do prompt chưa yêu cầu kiểm thử trạng thái/liên endpoint, do AI phân tích từng request tách rời, hay do tính năng có phụ thuộc thời gian, đồng thời và quyền sở hữu dữ liệu?
3. **Bài học và nguyên tắc bạn rút ra khi phối hợp với AI trong kiểm thử phần mềm là gì?**
   - *Gợi ý*: AI dựng khung EP/BVA nhanh, nhưng sinh viên cần tự truy vết đặc tả, bổ sung kiểm thử trạng thái/đồng thời/phân quyền, chạy lặp lại và không sửa Expected cho khớp mã nguồn lỗi.

---

## 3. Bài viết phản biện (200–300 từ)

Trong quá trình kiểm thử FR-03 và FR-08, tôi nhận thấy AI hỗ trợ tốt ở việc đọc đặc tả, chia lớp tương đương, tính điểm biên và tạo script chạy lặp lại. Với FR-08, AI đề xuất các ca kiểm tra `total_amount` bằng `-1`, `0`, `1` và địa chỉ ở các biên `254`, `255`, `256` ký tự. Bộ kiểm thử phát hiện được các lỗi nghiêm trọng như gian lận tổng tiền, không xóa giỏ hàng và cho phép thanh toán giỏ rỗng.

Tuy nhiên, AI vẫn thiên về phân tích từng request độc lập. Bộ ca ban đầu chưa xét đầy đủ việc giá sản phẩm thay đổi giữa lúc thêm vào giỏ và thanh toán, hai request checkout chạy đồng thời, hoặc quyền sở hữu đơn hàng sau khi tạo. Human Review đã bổ sung `SR-TC01`, `SR-TC02` và `SR-TC05`; riêng `SR-TC05` phát hiện lỗi IDOR `BUG-007`. Với FR-03, AI cũng bỏ sót vòng đời OTP, trường hợp mã bắt đầu bằng số `0` và sự thiếu hụt trường xác nhận mật khẩu trên giao diện. Nguyên nhân chủ yếu là prompt ban đầu chưa yêu cầu mô hình hóa trạng thái liên phiên, đồng thời và quan hệ giữa nhiều endpoint.

Bài học tôi rút ra là không nên xem đầu ra AI như kết luận cuối cùng. Tôi cần tự đối chiếu Expected với đặc tả, rà từng biến và lớp đầu ra, bổ sung kiểm thử trạng thái, bảo mật và UI, sau đó chạy lại ít nhất hai lần. AI phù hợp để tăng tốc thiết kế và tự động hóa, còn con người phải chịu trách nhiệm về oracle, đánh giá bug và tính trung thực của báo cáo.

---

## 4. Bảng kiểm đếm số từ của sinh viên

| Tiêu chí | Yêu cầu | Thực tế sinh viên đạt | Đánh giá |
|---|---:|---:|---|
| Số từ tối thiểu | 200 từ | 286 từ | Đạt |
| Số từ tối đa | 300 từ | 286 từ | Đạt |
| Có dẫn chứng ca kiểm thử thực tế | Bắt buộc | `SR-TC01`, `SR-TC02`, `SR-TC05`, `BUG-007` | Đạt |
