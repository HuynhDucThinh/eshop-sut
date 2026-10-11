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
| **Artifact #2**<br>Công cụ: Claude Sonnet 5.5 (Antigravity Agent)<br>Thời gian: 11/10/2026 23:10<br>Prompt: `"/hw02_2_design_tests Đặc tả FR-03 đã được duyệt. Hãy áp dụng kỹ thuật Domain Testing (Phân hoạch tương đương EP 3 bước) chia các lớp EC valid/invalid cho từng biến và ràng buộc chéo (mật khẩu khớp nhau, OTP đúng email đã yêu cầu). Sau đó áp dụng BVA chế độ Robustness (6n+1) cho độ dài mật khẩu mới (min 8) và độ dài OTP (6 chữ số). Tính toán Expected result độc lập từ SRS và ghi toàn bộ vào reports/Main_Report.md. Dừng lại để tôi Human Review."` | `reports/Main_Report.md` mục 1 (EP: 30 EC, 23 test case) và mục 2 (BVA Robustness: 13 lý thuyết, 9 thực tế). Kèm sửa 3 nguồn sai ở mục 0 (O1.2, Q4, route UI). | VALID | Thiết kế EP & BVA chuẩn theo bài giảng bài 4; phân tích đúng 4 dạng điều kiện và công thức $6n+1$; expected tính độc lập từ SRS. | Sinh viên đã trực tiếp thẩm định toàn bộ thiết kế EP và BVA; xác nhận bản hiệu chỉnh Q4; bổ sung 4 test case chất lượng cao (SR-TC01 đến SR-TC04) kiểm tra các trường hợp góc: OTP có số 0 ở đầu (leading zero), vô hiệu hóa OTP cũ khi sinh mã mới, khoảng trắng trong mật khẩu và tính không phân biệt hoa/thường của email. |

## 3. Tổng kết độ chính xác của AI

| Chỉ số | Số lượng | Tỉ lệ |
|---|---:|---:|
| Tổng artifact đã kiểm toán | 2 | 100% |
| VALID | 2 | 100% |
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
