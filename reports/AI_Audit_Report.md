# AI Audit Report — HW02 — [MSSV]

## 1. Thông tin sinh viên

| Mục | Nội dung |
|---|---|
| Họ tên | (Sinh viên điền) |
| MSSV | (Sinh viên điền) |
| Lớp / Khóa | (Sinh viên điền) |
| Mã bài tập | HW02-AI — Domain Testing trên EShop |
| Ngày làm bài | 2026-10-11 |
| Công cụ AI đã dùng | Gemini 3.8 Flash (Antigravity Agent) |
| Có dùng AI? | [x] Có  [ ] Không |

**Khai báo:** Tôi sử dụng công cụ AI cho các tác vụ hỗ trợ trích xuất đặc tả, thiết kế test case, tự động thực thi và lập báo cáo trong HW02.

## 2. Bảng kiểm toán (mỗi sản phẩm AI một dòng)

| (1) Prompt + Công cụ | (2) Đầu ra AI | (3) Kết luận | (4) Lý do | (5) Sinh viên sửa |
|---|---|---|---|---|
| **Artifact #1**<br>Công cụ: Gemini 3.8 Flash (Antigravity Agent)<br>Thời gian: 11/10/2026 22:48<br>Prompt: `"/hw02_1_analyze_feature Tôi chọn làm tính năng FR-03: Quên mật khẩu & Đặt lại mật khẩu (2 bước) thuộc Pool A. Hãy đọc đặc tả FR-03 trong README.md (lưu ý ràng buộc mật khẩu kế thừa từ FR-01). Trích xuất toàn bộ biến đầu vào (Email, OTP 6 chữ số, Mật khẩu mới, Xác nhận mật khẩu), các ràng buộc, output mong đợi (bước 1 sinh OTP, bước 2 cập nhật mật khẩu) và liệt kê các điểm mơ hồ (ambiguities) nếu có. Dừng lại chờ tôi xác nhận."` | Bảng đặc tả SRS Extract của FR-03 tại `reports/Main_Report.md` mục `0. Đặc tả kỹ thuật (SRS Extract) — Oracle`, gồm 5 biến đầu vào ($V_1$–$V_5$), 6 kết quả đầu ra ($O_{1.1}$–$O_{2.4}$), 5 ràng buộc liên biến, giá trị nominal và 5 câu hỏi mở (Q1–Q5). | VALID | Trích xuất chuẩn xác từ `README.md` (FR-01, FR-03, FR-21, FR-22, SEC-07) và `api_specification.md`, tuân thủ nguyên tắc kiểm thử hộp đen (§4) không đọc trước logic cài đặt mã nguồn. | Sinh viên đã xác nhận nguyên văn bảng đặc tả và toàn bộ các giả định tạm thời Q1–Q5. |

## 3. Tổng kết độ chính xác của AI

| Chỉ số | Số lượng | Tỉ lệ |
|---|---:|---:|
| Tổng artifact đã kiểm toán | 1 | 100% |
| VALID | 1 | 100% |
| INVALID | 0 | 0% |
| INCOMPLETE | 0 | 0% |

*(Chờ sinh viên cập nhật sau khi thẩm định)*

## 4. Kết luận — Khi nào nên (không nên) dùng AI? (80–150 từ, sinh viên tự viết)

*(Sinh viên tự viết theo hướng dẫn tại §3)*

## 5. Mandatory Disclosure

"Toàn bộ bảng đặc tả kỹ thuật và khung test case ban đầu được hỗ trợ tạo bởi Gemini 3.8 Flash; tôi đã xem xét, đối chiếu với tài liệu README của SUT và trực tiếp xác nhận các giả định nghiệp vụ, bổ sung các ca kiểm thử biên. AI Audit Report chi tiết được lưu trữ trong báo cáo này. Tôi xác nhận không dùng AI để tạo bất kỳ sản phẩm nào thuộc nhóm bị cấm theo quy định môn học."

## Chữ ký

| Mục | Nội dung |
|---|---|
| Họ tên | (Sinh viên điền) |
| MSSV | (Sinh viên điền) |
| Môn học | CS423 / CSC13003 – Kiểm thử phần mềm |
| Giảng viên | ThS. Tạ Thị Bích Hạnh |
| Ngày | 11/10/2026 |
