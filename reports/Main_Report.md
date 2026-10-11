# Báo cáo Kiểm thử HW02 — Domain Testing & BVA trên EShop

---

# FR-03 — Quên mật khẩu & Đặt lại mật khẩu (2 bước)

## 0. Đặc tả kỹ thuật (SRS Extract) — Oracle

> Nguồn trích xuất: `README.md` (mục 2 dòng 46–61; mục 2 dòng 30–36; mục 8 dòng 240–257; mục 9 dòng 284) và `api_specification.md` (mục 1.3, 1.4).

### 0.1 Thông tin chung

| Mục | Nội dung |
|---|---|
| Tính năng | FR-03: Quên mật khẩu & Đặt lại mật khẩu (2 bước) |
| Pool | Pool A (Authentication & Authorization) |
| Thành phần kiểm thử | Web Frontend (`http://localhost:5173`) & Backend REST API (`http://localhost:3000`) |
| Nguồn đặc tả | `README.md` (FR-03 dòng 46–61; FR-01 dòng 30–36; FR-21, FR-22 dòng 240–257; SEC-07 dòng 284), `api_specification.md` (mục 1.3 & 1.4) |
| Ngày trích | 2026-10-11 |
| Trạng thái | Đã xác nhận bởi sinh viên |

### 0.2 Biến đầu vào (Inputs)

| ID | Tên trường | Kiểu dữ liệu | Bắt buộc | Cận / Miền giá trị | Định dạng / Ràng buộc | Nguồn |
|---|---|---|---|---|---|---|
| **V1** | `Email` (Bước 1) | String | Có | Cận: [1, unspecified] | Định dạng email chuẩn HTML5/RFC 5322 (`user@domain.com`). Phải là email đã đăng ký tài khoản trong hệ thống. | `README.md`: dòng 33, 44, 50 |
| **V2** | `Email` (Bước 2) | String | Có | Khớp với email Bước 1 | Ràng buộc liên biến: Phải trùng với email đã yêu cầu OTP ở Bước 1. | `README.md`: dòng 60 |
| **V3** | `OTP` (`resetToken`) | Numeric String | Có | Độ dài: chính xác 6 ký tự số. Cận độ dài: [6, 6]. Miền: `000000`–`999999` (hoặc `100000`–`999999`) | Ký tự số `[0-9]`. Khớp mã OTP hệ thống sinh cho email này, còn hiệu lực và chưa bị sử dụng. | `README.md`: dòng 51, 60; `SEC-07`: dòng 284 |
| **V4** | `Mật khẩu mới` (`newPassword`) | String | Có | Độ dài: tối thiểu 8 ký tự ($\ge 8$). Cận dưới: 8. Cận trên: `unspecified` (giả định 128) | Kế thừa FR-01: Phải có ít nhất 1 chữ hoa (`[A-Z]`), 1 chữ thường (`[a-z]`), 1 chữ số (`[0-9]`), 1 ký tự đặc biệt (`@`, `$`, `!`, `%`, `*`, `?`, `&`). | `README.md`: dòng 34, 58 |
| **V5** | `Xác nhận mật khẩu` (`confirmPassword`) | String | Có (trên UI) | Giống V4 | Phải trùng khớp 100% từng ký tự với Mật khẩu mới ($V_5 = V_4$). | `README.md`: dòng 35, 57, 59 |

### 0.3 Đầu ra mong đợi (Outputs)

| ID | Bước | Điều kiện | Kết quả mong đợi (UI & API) | Mã HTTP / Thông báo | Nguồn |
|---|---|---|---|---|---|
| **O1.1** | Bước 1 | Email hợp lệ & đã đăng ký | Sinh OTP 6 chữ số ngẫu nhiên; hiển thị mã trên UI (demo); Step Indicator chuyển "Bước 2 / 2" | HTTP 200 OK; `{"message": "Mã đặt lại mật khẩu đã được tạo", "resetToken": "..."}` | `README.md`: dòng 51-52; `api_specification.md`: dòng 42 |
| **O1.2** | Bước 1 | Email chưa đăng ký trong hệ thống | Báo lỗi không tìm thấy tài khoản / email không tồn tại | HTTP 404 Not Found (hoặc 400 Bad Request) | `api_specification.md`; `server.js` |
| **O1.3** | Bước 1 | Email sai định dạng hoặc để trống | Báo lỗi định dạng email trên UI (trên nút Submit) / từ chối request | HTML5 validation / HTTP 400 Bad Request | `README.md`: dòng 33, 44, 255 |
| **O2.1** | Bước 2 | Tất cả hợp lệ (OTP đúng + khớp email, New Password thỏa mãn FR-01, Confirm Password khớp) | Cập nhật mật khẩu mới vào DB; hủy mã OTP cũ (`reset_token = NULL`); thông báo thành công và chuyển hướng về Đăng nhập | HTTP 200 OK; `{"message": "..."}` | `README.md`: dòng 36, 56-60; `SEC-07`: dòng 284 |
| **O2.2** | Bước 2 | OTP sai / không tồn tại / hết hạn / không khớp email | Báo lỗi OTP không hợp lệ hoặc đã hết hạn | HTTP 400 Bad Request (hoặc 401/404) | `README.md`: dòng 60; `SEC-07`: dòng 284 |
| **O2.3** | Bước 2 | Mật khẩu mới không đủ độ phức tạp FR-01 (< 8 ký tự, thiếu hoa, thiếu thường, thiếu số hoặc thiếu ký tự đặc biệt) | Từ chối cập nhật, hiển thị thông báo lỗi yêu cầu mật khẩu mạnh trên nút Submit | HTTP 400 Bad Request; UI error message | `README.md`: dòng 34, 58, 255 |
| **O2.4** | Bước 2 | Xác nhận mật khẩu không khớp ($V_5 \ne V_4$) | Từ chối cập nhật, báo lỗi "Xác nhận mật khẩu không khớp" trên nút Submit | Form validation error; HTTP 400 Bad Request | `README.md`: dòng 35, 59, 255 |

### 0.4 Ràng buộc liên biến và quy tắc nghiệp vụ

| ID | Ràng buộc | Nguồn |
|---|---|---|
| **R1** | $V_5$ (`confirmPassword`) phải trùng khớp tuyệt đối với $V_4$ (`newPassword`). | `README.md`: dòng 35, 59 |
| **R2** | Mã OTP ($V_3$) gắn chặt với địa chỉ Email ($V_2$). OTP sinh cho email A không được dùng cho email B. | `README.md`: dòng 60 |
| **R3** | Tính dùng một lần (One-time usage) và vô hiệu hóa: OTP sau khi đặt lại mật khẩu thành công phải bị hủy ngay, không thể dùng lại lần thứ 2. | `SEC-07`: dòng 284 |
| **R4** | Giao diện phải có Step Indicator rõ ràng ("Bước 1 / 2" và "Bước 2 / 2") và nút "Quay lại đăng nhập". | `README.md`: dòng 52, 53, 256 |
| **R5** | Mật khẩu mới có được trùng với mật khẩu cũ gần nhất không? | Đặc tả không cấm (`unspecified`). |

### 0.5 Giá trị danh định hợp lệ (Nominal Values)

| Biến | Giá trị danh định (Nominal) | Lý do chọn |
|---|---|---|
| $V_1$ (Email B1) | `test@eshop.com` | Tài khoản người dùng mẫu có sẵn trong hệ thống SUT. |
| $V_2$ (Email B2) | `test@eshop.com` | Trùng khớp với $V_1$. |
| $V_3$ (OTP) | `123456` | Đúng 6 chữ số hợp lệ do hệ thống sinh ra. |
| $V_4$ (Mật khẩu mới) | `NewPass123!` | 11 ký tự ($\ge 8$), có hoa (`N`, `P`), thường (`ewass`), số (`123`), ký tự đặc biệt (`!`). |
| $V_5$ (Xác nhận MK) | `NewPass123!` | Trùng khớp chính xác từng ký tự với $V_4$. |

### 0.6 Cách thức giao tiếp (API Contract & UI Element)

| Mục | Bước 1 (Lấy OTP) | Bước 2 (Đặt lại mật khẩu) |
|---|---|---|
| **Endpoint** | `POST /api/forgot-password` | `POST /api/reset-password` |
| **Header** | `Content-Type: application/json` | `Content-Type: application/json` |
| **Request Body** | `{"email": "test@eshop.com"}` | `{"email": "test@eshop.com", "resetToken": "123456", "newPassword": "NewPass123!"}` |
| **Màn hình UI** | `http://localhost:5173/forgot-password` | Form chuyển bước hoặc popup cùng trang có Step Indicator |
| **Các trường UI** | Email Input (`type="email"`), Submit Button, Nút "Quay lại đăng nhập" | OTP Input, New Password (`type="password"`), Confirm Password (`type="password"`), Submit Button |

### 0.7 Điểm mơ hồ (Ambiguities) & Câu hỏi mở cần xác nhận

| Mã | Vấn đề mơ hồ | Giả định tạm thời đề xuất | Trạng thái |
|---|---|---|---|
| **Q1** | **Độ dài tối đa của Mật khẩu mới:** FR-01/FR-03 chỉ quy định "Tối thiểu 8 ký tự", không nêu cận trên (Max length). | Giả định cận trên kỹ thuật an toàn là 128 ký tự. Khi thiết kế BVA, kiểm tra cận dưới là chính (7, 8, 9 ký tự), còn cận trên kiểm tra ca danh định dài và ca vượt quá 128 ký tự. | Đã xác nhận |
| **Q2** | **Tập ký tự đặc biệt của Mật khẩu:** FR-01 nêu rõ 7 ký tự: `@`, `$`, `!`, `%`, `*`, `?`, `&`. Các ký tự đặc biệt khác (`#`, `_`, `-`, `^`, `+`, `~`...) có được chấp nhận không? | Theo nguyên tắc hộp đen nghiêm ngặt (Strict SRS), chỉ 7 ký tự trên được coi là hợp lệ. Các ký tự khác sẽ được xếp vào lớp không hợp lệ để kiểm tra hệ thống có bắt đúng đặc tả không. | Đã xác nhận |
| **Q3** | **Thời hạn OTP & giới hạn số lần nhập sai:** SEC-07 yêu cầu "OTP có thời hạn", nhưng không nêu thời gian sống cụ thể (5 phút hay 10 phút) hay số lần tối đa được thử sai trước khi hủy OTP. | Với kiểm thử hộp đen tính năng: Kiểm tra OTP hợp lệ ngay sau khi sinh; OTP sai giá trị bị từ chối; OTP đã dùng 1 lần thì không được dùng lại lần 2. | Đã xác nhận |
| **Q4** | **Phản hồi khi Email không tồn tại ở Bước 1:** Nên báo lỗi 404 "Không tìm thấy tài khoản" hay trả về thông báo chung để chống user enumeration? | Theo `api_specification.md` và mã nguồn demo: Báo lỗi 404 User not found / thông báo người dùng không tồn tại. | Đã xác nhận |
| **Q5** | **Phạm vi kiểm thử trọng tâm:** Thực hiện kiểm thử trên giao diện Web UI, qua API, hay kết hợp cả hai? | Đề xuất kết hợp cả hai: Kiểm thử độ phủ dữ liệu & biên bằng API automation (Invoke-RestMethod/curl) cho kết quả nhanh và chính xác mã HTTP; đồng thời thực hiện kiểm thử UI cho các ràng buộc giao diện (Step Indicator, `type="password"`, confirm password). | Đã xác nhận |
