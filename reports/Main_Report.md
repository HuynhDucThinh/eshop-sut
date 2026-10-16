# Báo cáo Kiểm thử HW02 — Domain Testing & BVA trên EShop

## Thông tin sinh viên & Giảng viên

| Mục | Nội dung |
|---|---|
| **Họ và tên sinh viên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Lớp / Khóa** | CQ2023/31 |
| **Môn học** | CS423 / CSC13003 – Kiểm thử phần mềm |
| **Giảng viên hướng dẫn** | ThS. Hồ Tuấn Thanh |
| **Danh sách tính năng thực hiện** | 1. **FR-03**: Quên mật khẩu & Đặt lại mật khẩu (2 bước) — Pool A<br>2. **FR-08**: Thanh toán (Checkout) — Pool B<br>3. **FR-14**: Quản lý Danh mục (Category CRUD) — Pool C |
| **Ngày nộp / hoàn thành** | 15/10/2026 |

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
| **O1.2** | Bước 1 | Email chưa đăng ký trong hệ thống | Báo lỗi không tìm thấy tài khoản / email không tồn tại | Lỗi phía client (4xx); mã cụ thể `unspecified` — xem Q4 | `README.md`: dòng 50 (chỉ email đã đăng ký); mã lỗi không có trong đặc tả |
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
| **Màn hình UI** | `TBD` (README không nêu route; xác định từ giao diện `http://localhost:5173` khi chạy) | `TBD` (form chuyển bước, có Step Indicator "Bước 2 / 2") |
| **Các trường UI** | Email Input (`type="email"`), Submit Button, Nút "Quay lại đăng nhập" | OTP Input, New Password (`type="password"`), Confirm Password (`type="password"`), Submit Button |

### 0.7 Điểm mơ hồ (Ambiguities) & Câu hỏi mở cần xác nhận

| Mã | Vấn đề mơ hồ | Giả định tạm thời đề xuất | Trạng thái |
|---|---|---|---|
| **Q1** | **Độ dài tối đa của Mật khẩu mới:** FR-01/FR-03 chỉ quy định "Tối thiểu 8 ký tự", không nêu cận trên (Max length). | Giả định cận trên kỹ thuật an toàn là 128 ký tự. Khi thiết kế BVA, kiểm tra cận dưới là chính (7, 8, 9 ký tự), còn cận trên kiểm tra ca danh định dài và ca vượt quá 128 ký tự. | Đã xác nhận |
| **Q2** | **Tập ký tự đặc biệt của Mật khẩu:** FR-01 nêu rõ 7 ký tự: `@`, `$`, `!`, `%`, `*`, `?`, `&`. Các ký tự đặc biệt khác (`#`, `_`, `-`, `^`, `+`, `~`...) có được chấp nhận không? | Theo nguyên tắc hộp đen nghiêm ngặt (Strict SRS), chỉ 7 ký tự trên được coi là hợp lệ. Các ký tự khác sẽ được xếp vào lớp không hợp lệ để kiểm tra hệ thống có bắt đúng đặc tả không. | Đã xác nhận |
| **Q3** | **Thời hạn OTP & giới hạn số lần nhập sai:** SEC-07 yêu cầu "OTP có thời hạn", nhưng không nêu thời gian sống cụ thể (5 phút hay 10 phút) hay số lần tối đa được thử sai trước khi hủy OTP. | Với kiểm thử hộp đen tính năng: Kiểm tra OTP hợp lệ ngay sau khi sinh; OTP sai giá trị bị từ chối; OTP đã dùng 1 lần thì không được dùng lại lần 2. | Đã xác nhận |
| **Q4** | **Phản hồi khi Email không tồn tại ở Bước 1:** Nên báo lỗi 404 "Không tìm thấy tài khoản" hay trả về thông báo chung để chống user enumeration? | Đặc tả không nêu mã lỗi. Chấp nhận mọi lỗi 4xx, không sinh OTP; nội dung/mã chính xác không so sánh. *(Đã hiệu chỉnh ở bước 2: bản trước ghi nguồn từ mã nguồn, vi phạm §4 — sinh viên xem lại.)* | Đã xác nhận (bản hiệu chỉnh) |
| **Q5** | **Phạm vi kiểm thử trọng tâm:** Thực hiện kiểm thử trên giao diện Web UI, qua API, hay kết hợp cả hai? | Đề xuất kết hợp cả hai: Kiểm thử độ phủ dữ liệu & biên bằng API automation (Invoke-RestMethod/curl) cho kết quả nhanh và chính xác mã HTTP; đồng thời thực hiện kiểm thử UI cho các ràng buộc giao diện (Step Indicator, `type="password"`, confirm password). | Đã xác nhận |

> **Ghi chú §4 (thời điểm đọc mã nguồn):** ở Bước 1, AI đã mở `backend/server.js` dòng 70–95 chỉ để xác nhận tên endpoint/trường; đoạn đó vô tình lộ logic. **Không dùng** để suy expected — mọi expected bên dưới lấy từ `README.md` / `api_specification.md` và phép tính độc lập. Mã nguồn chỉ được đọc lại sau khi có test Fail.

---

## 1. Domain Testing (Phân hoạch tương đương) — FR-03: Quên mật khẩu & Đặt lại mật khẩu

**Thành phần kiểm thử:** API (`POST /api/forgot-password`, `POST /api/reset-password`) + Web UI (riêng ràng buộc xác nhận mật khẩu)
**Nguồn đặc tả:** `README.md` FR-03 (dòng 46–60), FR-01 (30–36), FR-22 (250–256), SEC-07 (284); `api_specification.md` mục 1.3, 1.4
**Ngày thiết kế:** 2026-10-11

### Bước 1 — Xác định đầu vào và đầu ra

| Thành phần | Tên | Kiểu | Ràng buộc | Nguồn |
|---|---|---|---|---|
| Input | V1 `email` (B1) | String | Bắt buộc; định dạng email; đã đăng ký | README 33, 50 |
| Input | V2 `email` (B2) | String | Bắt buộc; là email đã yêu cầu OTP | README 60 |
| Input | V3 `resetToken` (OTP) | Chuỗi số | Đúng 6 chữ số; khớp mã cấp cho V2; dùng 1 lần, có thời hạn | README 51, 60; SEC-07 |
| Input | V4 `newPassword` | String | ≥ 8 ký tự (max 128 — giả định Q1); có hoa, thường, số, ký tự đặc biệt ∈ {`@ $ ! % * ? &`} (Q2) | README 34, 58 |
| Input | V5 `confirmPassword` | String | = V4. **Chỉ có trên UI**, API body không có trường này | README 35, 59; api_spec 1.4 |
| Output hợp lệ | O1.1, O2.1 | — | B1: sinh OTP 6 số, hiển thị; B2: đổi mật khẩu, hủy OTP | README 51, 36; SEC-07 |
| Output lỗi | O1.2, O1.3, O2.2–O2.4 | — | Từ chối; trạng thái dữ liệu không đổi. Mã/nội dung lỗi `unspecified` | README 34, 35, 60 |

**Giải thích:** năm biến V1–V5 đủ phủ mọi ràng buộc nêu trong FR-03. Đặc tả **không** nêu mã HTTP/nội dung lỗi nên oracle chính là *trạng thái dữ liệu*: (a) bước 1 không sinh OTP; (b) bước 2 mật khẩu **không** đổi — kiểm tra bằng `POST /api/login` (đã có trong api_spec 1.2), không cần đọc code. Điểm mơ hồ còn lại: Q1–Q5 (xem 0.7).

**Phân loại biến: Direct Input và State Input (DB/phiên):**

| Biến / điều kiện | Phân loại | Kiểu | Ràng buộc (SRS) | Giá trị hợp lệ mặc định |
|---|---|---|---|---|
| V1 `email` (B1) | Direct Input (body/UI) | String | Đúng định dạng, đã đăng ký | `test@eshop.com` |
| V2 `email` (B2) | Direct Input | String | Trùng email đã xin OTP | `test@eshop.com` |
| V3 `resetToken` | Direct Input | Chuỗi số | 6 chữ số; khớp mã đã cấp | `OTP_T` |
| V4 `newPassword` | Direct Input | String | ≥ 8 ký tự; 4 nhóm ký tự | `NewPass123!` |
| V5 `confirmPassword` | Direct Input (chỉ UI) | String | = V4 | `NewPass123!` |
| `otp_issued` | **State Input** (DB: `reset_token`) | Mã | OTP đã được cấp bởi bước 1 cho đúng email | P1 (đã gọi bước 1) |
| `otp_used` | **State Input** (DB: `reset_token = NULL` sau khi dùng) | Boolean | OTP chưa dùng (R3 / SEC-07) | `false` |
| `otp_owner` | **State Input** | Email | OTP thuộc đúng email (R2) | `test@eshop.com` |

Các lớp EC11 (OTP của email khác), EC12 (OTP đã dùng), EC33 (email khác email đã xin OTP) là lớp của **State Input**; điều kiện tiên quyết P1 và các bước tạo trạng thái trong bảng test case chính là cách đưa hệ thống về trạng thái này.

### Bước 2 — Xác định các lớp tương đương

**Quy ước:** `OTP_T` = mã thật hệ thống cấp cho `test@eshop.com`; `REJ` = bị từ chối (lỗi 4xx, trạng thái dữ liệu không đổi).

| EC ID | Yêu cầu | Biến / Đầu ra | Điều kiện | Loại | Giá trị đại diện | Lý do chia |
|---|---|---|---|---|---|---|
| EC01 | FR-03 B1 | V1 | Email đúng định dạng **và** đã đăng ký | Valid | `test@eshop.com` | Điều kiện AND (kiểu + tồn tại) |
| EC02 | FR-03 B1 | V1 | Sai định dạng email | Invalid | `testeshop.com` | Boolean/kiểu |
| EC03 | FR-03 B1 | V1 | Rỗng | Invalid | `""` | Trường bắt buộc |
| EC04 | FR-03 B1 | V1 | Đúng định dạng nhưng chưa đăng ký | Invalid | `nobody.unregistered@eshop.com` | Tách khỏi EC02 vì lỗi khác nguyên nhân (O1.2 ≠ O1.3) |
| EC05 | FR-03 B2 | V3 | Đúng 6 chữ số, bằng mã đã cấp, chưa dùng | Valid | `OTP_T` | Giá trị đơn (= mã cấp) AND độ dài AND kiểu số |
| EC06 | FR-03 B2 | V3 | Độ dài < 6 | Invalid | `123` | Dải [6,6] → lớp dưới |
| EC07 | FR-03 B2 | V3 | Độ dài > 6 | Invalid | `12345678` | Dải [6,6] → lớp trên |
| EC08 | FR-03 B2 | V3 | Đủ 6 ký tự nhưng có ký tự không phải số | Invalid | `12ab56` | Boolean/kiểu (cô lập khỏi độ dài) |
| EC09 | FR-03 B2 | V3 | 6 chữ số hợp lệ nhưng ≠ mã đã cấp | Invalid | `OTP_T` đổi chữ số cuối (d → (d+1) mod 10) | Giá trị đơn: x ≠ A |
| EC10 | FR-03 B2 | V3 | Rỗng | Invalid | `""` | Trường bắt buộc |
| EC11 | R2 | V3×V2 | OTP cấp cho email khác (OTP của `admin@eshop.com`) dùng cho `test@eshop.com` | Invalid (liên biến) | `OTP_A` | Ràng buộc chéo OTP–email |
| EC12 | R3 / SEC-07 | V3 | OTP đã dùng thành công 1 lần | Invalid (liên biến/trạng thái) | `OTP_T` dùng lại lần 2 | Vô hiệu hóa sau khi dùng |
| EC13 | FR-03 B2 | V2 | Email đã đăng ký và chính là email đã yêu cầu OTP | Valid | `test@eshop.com` | Gộp vào ca hợp lệ |
| EC14 | FR-03 B2 | V2 | Rỗng / thiếu | Invalid | `""` | Trường bắt buộc |
| EC15 | FR-01 | V4 | 8 ≤ độ dài ≤ 128 **và** đủ 4 nhóm ký tự (ký tự đặc biệt ∈ tập cho phép) | Valid | `NewPass123!` | Điều kiện AND |
| EC16 | FR-01 | V4 | Độ dài < 8 (đủ nhóm ký tự) | Invalid | `Ab1!` | Dải → lớp dưới |
| EC17 | Q1 | V4 | Độ dài > 128 (đủ nhóm ký tự) | Invalid | `'Aa1!' + 'a'*196` (200 ký tự) | Dải → lớp trên (cận trên theo giả định Q1) |
| EC18 | FR-01 | V4 | Thiếu chữ hoa | Invalid | `newpass123!` | Mỗi nhóm ký tự một lớp riêng để cô lập lỗi |
| EC19 | FR-01 | V4 | Thiếu chữ thường | Invalid | `NEWPASS123!` | như trên |
| EC20 | FR-01 | V4 | Thiếu chữ số | Invalid | `NewPass!!!!` | như trên |
| EC21 | FR-01 | V4 | Thiếu ký tự đặc biệt | Invalid | `NewPass1234` | như trên |
| EC22 | FR-01 / Q2 | V4 | Có ký tự đặc biệt nhưng **ngoài** tập cho phép | Invalid | `NewPass123#` | Tập giá trị: x ∉ tập; tách khỏi EC21 để kiểm tra giả định Q2 |
| EC23 | FR-01 | V4 | Rỗng | Invalid | `""` | Trường bắt buộc |
| EC24 | R1 | V5 | V5 = V4 | Valid | `NewPass123!` | Giá trị đơn |
| EC25 | R1 | V5 | V5 ≠ V4 | Invalid (liên biến) | `NewPass123?` | Giá trị đơn: x ≠ A |
| EC26 | R1 | V5 | Rỗng khi V4 hợp lệ | Invalid | `""` | Trường bắt buộc |
| EC27 | O1.1 | Output B1 | OTP trả về/hiển thị là 6 chữ số | Output hợp lệ | khớp `^\d{6}$` | Lớp đầu ra hợp lệ |
| EC28 | O1.2, O1.3 | Output B1 | Từ chối, không sinh OTP | Output lỗi | `REJ` | Lớp đầu ra lỗi |
| EC29 | O2.1 | Output B2 | Mật khẩu đổi sang giá trị mới; OTP bị hủy | Output hợp lệ | login mật khẩu mới = 200 | Lớp đầu ra hợp lệ |
| EC30 | O2.2–O2.4 | Output B2 | Từ chối, mật khẩu không đổi | Output lỗi | login `Test1234!` = 200 | Lớp đầu ra lỗi |
| EC31 | FR-03 B2 | V2 | Email bước 2 sai định dạng | Invalid | `testeshop.com` | *(bổ sung 2026-10-13)* Boolean/kiểu cho V2, đối xứng EC02 |
| EC32 | FR-03 B2 | V2 | Email bước 2 đúng định dạng nhưng chưa đăng ký | Invalid | `nobody.unregistered@eshop.com` | *(bổ sung)* Đối xứng EC04 |
| EC33 | R2 | V2×V3 | Email bước 2 là tài khoản đã đăng ký nhưng **khác** email đã xin OTP (OTP_T của `test@eshop.com` dùng cho `admin@eshop.com`) | Invalid (liên biến) | email=`admin@eshop.com`, OTP=`OTP_T` | *(bổ sung)* R2 xét theo chiều ngược lại với EC11 |
| EC34 | FR-01 | V4 | Mật khẩu chỉ gồm khoảng trắng (≥ 8 ký tự, thiếu cả 4 nhóm ký tự) | Invalid | 8 dấu cách | *(bổ sung)* Lớp đặc biệt của kiểu chuỗi, tách khỏi EC23 (rỗng) |
| EC35 | R4 | UI | Có Step Indicator "Bước 1 / 2" → "Bước 2 / 2" và nút "Quay lại đăng nhập" | Valid (UI) | quan sát DOM | *(bổ sung)* Yêu cầu giao diện R4 tách khỏi ca luồng chính |
| EC36 | FR-03 B1 | UI V1 | Ô email dùng `type="email"`: chuỗi sai định dạng bị trình duyệt chặn trước khi gửi | Invalid (UI) | `testeshop.com` nhập trên UI | *(bổ sung)* Ràng buộc HTML5 (README 33, 44) |
| EC37 | FR-03 B2 | UI V4/V5 | Ô mật khẩu mới và xác nhận dùng `type="password"` (che ký tự) | Valid (UI) | quan sát DOM | *(bổ sung)* Ràng buộc UI (README 35, 57) |

**Giải thích:** dùng cả bốn dạng điều kiện — *dải* (độ dài OTP, độ dài mật khẩu → 2 lớp lỗi dưới/trên), *giá trị đơn* (khớp mã, V5 = V4), *tập giá trị* (ký tự đặc biệt ∈ 7 ký tự), *boolean/kiểu* (định dạng email, ký tự số). Mỗi nhóm ký tự mật khẩu tách lớp riêng vì lỗi nghiệp vụ khác nhau (cô lập 1 lỗi/ca). Ba ràng buộc chéo R1, R2, R3 được sinh lớp riêng (EC25, EC11, EC12). “Chữ hoa/thường của email” chưa tách thành lớp EP vì đặc tả không nêu → xem mục *Ca bổ sung* (SR-TC04). **Bổ sung sau rà soát (2026-10-13):** thêm EC31–EC33 để V2 có đủ lớp đối xứng với V1 (sai định dạng, chưa đăng ký, khác email đã xin OTP); EC34 cho mật khẩu chỉ gồm khoảng trắng; EC35–EC37 cho ràng buộc giao diện R4 và HTML5. **Lớp chưa thể thiết kế ca thực thi:** *OTP hết hạn / quá số lần thử sai* (SEC-07, Q3) — đặc tả không nêu thời hạn nên không có giá trị đại diện; ghi nhận là giới hạn, không tự bịa thời gian.

### Bước 3 — Chọn đại diện và tạo test case

**Điều kiện nền dùng chung**

- **P0:** `test@eshop.com` có mật khẩu `Test1234!` (README dòng 24); chưa có OTP còn hiệu lực. Reset trước *mỗi* ca (do `hw02_test_executor` thực hiện ở bước 3).
- **P1:** P0 + gọi `POST /api/forgot-password` với `test@eshop.com`, ghi `OTP_T`.
- **OC-OK(mk):** `POST /api/login` với (`test@eshop.com`, `mk`) → 200 + token; đăng nhập `Test1234!` → **không** 200.
- **OC-NO:** `POST /api/login` với (`test@eshop.com`, `Test1234!`) → 200 (mật khẩu không đổi). Chỉ dùng **một** lần đăng nhập đúng để tránh kích hoạt khóa FR-02.
- **Mã HTTP lỗi:** đặc tả không nêu → chỉ yêu cầu `REJ` (4xx), không so sánh mã cụ thể. Mã thành công bước 2 cũng `unspecified` → dùng `2xx` + OC-OK.

| TC ID | Kỹ thuật | EC phủ | Thành phần | Điều kiện tiên quyết | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|---|---|
| EP-TC01 | EP (gộp valid) | EC01, EC27 | API | P0 | `email=test@eshop.com` | `POST /api/forgot-password` | 200; `resetToken` khớp `^\d{6}$` | README 50–51; api_spec 1.3 |
| EP-TC02 | EP (gộp valid) | EC01, EC05, EC13, EC15, EC24, EC27, EC29 | UI | P0 | email `test@eshop.com`; OTP = mã hiển thị; mk mới `NewPass123!`; xác nhận `NewPass123!` | Mở màn hình Quên mật khẩu → nhập email → lấy OTP → nhập OTP + mk + xác nhận → Submit | Hiện “Bước 1/2” rồi “Bước 2/2”; thành công, chuyển về Đăng nhập; OC-OK(`NewPass123!`) | README 36, 51–52, 56–60 |
| EP-TC03 | EP (cô lập) | EC02, EC28 | API | P0 | `email=testeshop.com` | `POST /api/forgot-password` | `REJ`, không có `resetToken` | README 33 |
| EP-TC04 | EP (cô lập) | EC03, EC28 | API | P0 | `email=""` | như trên | `REJ`, không có `resetToken` | README 33, 50 |
| EP-TC05 | EP (cô lập) | EC04, EC28 | API | P0 | `email=nobody.unregistered@eshop.com` | như trên | `REJ`, không có `resetToken` | README 50 |
| EP-TC06 | EP (cô lập) | EC06, EC30 | API | P1 | OTP=`123`; mk=`NewPass123!` | `POST /api/reset-password` rồi OC-NO | `REJ`; OC-NO | README 51 |
| EP-TC07 | EP (cô lập) | EC07, EC30 | API | P1 | OTP=`12345678`; mk hợp lệ | như trên | `REJ`; OC-NO | README 51 |
| EP-TC08 | EP (cô lập) | EC08, EC30 | API | P1 | OTP=`12ab56`; mk hợp lệ | như trên | `REJ`; OC-NO | README 51 |
| EP-TC09 | EP (cô lập) | EC09, EC30 | API | P1 | OTP=`OTP_T` đổi chữ số cuối; mk hợp lệ | như trên | `REJ`; OC-NO | README 60 |
| EP-TC10 | EP (cô lập) | EC10, EC30 | API | P1 | OTP=`""`; mk hợp lệ | như trên | `REJ`; OC-NO | README 51 |
| EP-TC11 | EP (liên biến R2) | EC11, EC30 | API | P1 + gọi bước 1 cho `admin@eshop.com` lấy `OTP_A` (≠ `OTP_T`) | email=`test@eshop.com`; OTP=`OTP_A`; mk hợp lệ | như trên | `REJ`; OC-NO | README 60 |
| EP-TC12 | EP (liên biến R3) | EC12, EC30 | API | P1 + reset thành công với `OTP_T`, mk=`NewPass123!` | OTP=`OTP_T` (lần 2); mk=`Another456@` | `POST /api/reset-password` lần 2 | `REJ`; đăng nhập `NewPass123!` vẫn 200 (không đổi sang `Another456@`) | SEC-07 (284) |
| EP-TC13 | EP (cô lập) | EC14, EC30 | API | P1 | email=`""`; OTP=`OTP_T`; mk hợp lệ | như trên | `REJ`; OC-NO | README 57, 60 |
| EP-TC14 | EP (cô lập) | EC16, EC30 | API | P1 | OTP=`OTP_T`; mk=`Ab1!` | như trên | `REJ`; OC-NO | README 34, 58 |
| EP-TC15 | EP (cô lập) | EC17, EC30 | API | P1 | OTP=`OTP_T`; mk=`'Aa1!'+'a'*196` | như trên | `REJ`; OC-NO | Q1 (giả định) |
| EP-TC16 | EP (cô lập) | EC18, EC30 | API | P1 | OTP=`OTP_T`; mk=`newpass123!` | như trên | `REJ`; OC-NO | README 34 |
| EP-TC17 | EP (cô lập) | EC19, EC30 | API | P1 | OTP=`OTP_T`; mk=`NEWPASS123!` | như trên | `REJ`; OC-NO | README 34 |
| EP-TC18 | EP (cô lập) | EC20, EC30 | API | P1 | OTP=`OTP_T`; mk=`NewPass!!!!` | như trên | `REJ`; OC-NO | README 34 |
| EP-TC19 | EP (cô lập) | EC21, EC30 | API | P1 | OTP=`OTP_T`; mk=`NewPass1234` | như trên | `REJ`; OC-NO | README 34 |
| EP-TC20 | EP (cô lập) | EC22, EC30 | API | P1 | OTP=`OTP_T`; mk=`NewPass123#` | như trên | `REJ`; OC-NO | README 34; Q2 |
| EP-TC21 | EP (cô lập) | EC23, EC30 | API | P1 | OTP=`OTP_T`; mk=`""` | như trên | `REJ`; OC-NO | README 57–58 |
| EP-TC22 | EP (liên biến R1) | EC25, EC30 | UI | P1 (qua UI) | mk=`NewPass123!`; xác nhận=`NewPass123?` | Bước 2 trên UI → Submit → OC-NO | Báo lỗi không khớp, không đổi mật khẩu; OC-NO | README 35, 59 |
| EP-TC23 | EP (cô lập) | EC26, EC30 | UI | P1 (qua UI) | mk=`NewPass123!`; xác nhận=`""` | như trên | Báo lỗi, không đổi mật khẩu; OC-NO | README 35, 57 |
| EP-TC24 | EP (cô lập) *(bổ sung)* | EC31, EC30 | API | P1 | email=`testeshop.com`; OTP=`OTP_T`; mk hợp lệ | `POST /api/reset-password` rồi OC-NO | `REJ`; OC-NO | README 33, 60 |
| EP-TC25 | EP (cô lập) *(bổ sung)* | EC32, EC30 | API | P1 | email=`nobody.unregistered@eshop.com`; OTP=`OTP_T`; mk hợp lệ | như trên | `REJ`; OC-NO | README 50, 60 |
| EP-TC26 | EP (liên biến R2) *(bổ sung)* | EC33, EC30 | API | P1 | email=`admin@eshop.com`; OTP=`OTP_T` (cấp cho `test@eshop.com`); mk hợp lệ | như trên | `REJ`; OC-NO; đồng thời mật khẩu `admin@eshop.com` không đổi | README 60 |
| EP-TC27 | EP (cô lập) *(bổ sung)* | EC34, EC30 | API | P1 | OTP=`OTP_T`; mk=8 dấu cách | như trên | `REJ`; OC-NO | README 34, 58 |
| EP-TC28 | EP (cô lập) *(bổ sung)* | EC09, EC30 | API | P1 | OTP=`000000` (đủ **6 chữ số**, chắc chắn ≠ `OTP_T`); mk hợp lệ | như trên | `REJ`; OC-NO | README 51, 60 — thay cho EP-TC09 vốn chỉ thử được OTP 4 số do BUG-001 |
| EP-TC29 | EP (UI) *(bổ sung)* | EC35 | UI | P0 | email `test@eshop.com` | Mở `/forgot-password`, quan sát chỉ báo bước, bấm lấy OTP, quan sát lại, tìm nút "Quay lại đăng nhập" | Hiện "Bước 1 / 2" rồi "Bước 2 / 2"; có nút "Quay lại đăng nhập" | README 52–53, 256 |
| EP-TC30 | EP (UI) *(bổ sung)* | EC36 | UI | P0 | nhập `testeshop.com` vào ô email, bấm Submit | Kiểm tra `type="email"` và thông báo HTML5 | Trình duyệt chặn gửi, hiện báo lỗi định dạng; không có request tới API | README 33, 44 |
| EP-TC31 | EP (UI) *(bổ sung)* | EC37 | UI | P1 (qua UI) | quan sát hai ô mật khẩu ở Bước 2 | Kiểm tra thuộc tính `type` của ô mật khẩu mới và xác nhận | Cả hai là `type="password"` (ký tự bị che) | README 35, 57 |

**Giải thích:** hai ca hợp lệ (TC01 cho bước 1; TC02 gộp mọi lớp hợp lệ của bước 2 và chạy qua UI vì V5 chỉ tồn tại trên UI). Mọi ca âm chỉ sai **đúng một** điều kiện (OTP chuẩn `OTP_T`, mk và email hợp lệ cho các biến còn lại). Ca EP-TC12 cần thao tác 2 lần để tạo trạng thái “OTP đã dùng”. Ca API hợp lệ của bước 2 được thay bằng `BV-TC01` (nominal) để tránh trùng input; do đó EC05, EC13, EC15, EC29 được phủ **cả** qua EP-TC02 (UI) **và** BV-TC01 (API). Các ca EP-TC24–EP-TC31 được bổ sung sau rà soát đối chiếu bài giảng (2026-10-13), **chưa chạy** nên trạng thái `Not run`; EP-TC28 dùng OTP 6 số `000000` vì hệ thống hiện chỉ sinh OTP 4 số (BUG-001) nên EP-TC09 chưa chứng minh được lớp "6 chữ số nhưng sai".

### Truy vết EC → Test case (xem thêm Bước 3b bên dưới)

| EC ID | Test case phủ | EC ID | Test case phủ | EC ID | Test case phủ |
|---|---|---|---|---|---|
| EC01 | TC01, TC02 | EC11 | TC11 | EC21 | TC19 |
| EC02 | TC03 | EC12 | TC12 | EC22 | TC20 |
| EC03 | TC04 | EC13 | TC02, BV-TC01 | EC23 | TC21 |
| EC04 | TC05 | EC14 | TC13 | EC24 | TC02 |
| EC05 | TC02, BV-TC01 | EC15 | TC02, BV-TC01 | EC25 | TC22 |
| EC06 | TC06 | EC16 | TC14 | EC26 | TC23 |
| EC07 | TC07 | EC17 | TC15 | EC27 | TC01, TC02 |
| EC08 | TC08 | EC18 | TC16 | EC28 | TC03–TC05 |
| EC09 | TC09, TC28 | EC19 | TC17 | EC29 | TC02, BV-TC01 |
| EC10 | TC10 | EC20 | TC18 | EC30 | TC06–TC28 |
| EC31 | TC24 | EC33 | TC26 | EC35 | TC29 |
| EC32 | TC25 | EC34 | TC27 | EC36 | TC30 |
| EC37 | TC31 | | | | |

### Bước 3b — Bảng ca sơ bộ (mỗi EC một dòng) và phân tích rút gọn

Theo bài giảng (Slide 17 → 18): trước hết duyệt **100% EC**, mỗi EC một dòng sơ bộ; khi dòng đó kiểm tra một EC invalid thì mọi biến còn lại **bắt buộc hợp lệ** (cô lập lỗi). Sau đó gộp các dòng có cùng input và cùng kết quả.

| Dòng | EC | Biến đang kiểm tra | Giá trị | Các biến khác | Kết quả mong đợi sơ bộ | → TC sau rút gọn |
|---:|---|---|---|---|---|---|
| 1 | EC01 | V1 | `test@eshop.com` | — | OTP 6 số được sinh | TC01 |
| 2 | EC02 | V1 | `testeshop.com` | — | REJ | TC03 |
| 3 | EC03 | V1 | `""` | — | REJ | TC04 |
| 4 | EC04 | V1 | `nobody.unregistered@eshop.com` | — | REJ | TC05 |
| 5 | EC05 | V3 | `OTP_T` | V2, V4, V5 hợp lệ | Mật khẩu đổi | **TC02** (gộp) |
| 6 | EC06 | V3 | `123` | các biến khác hợp lệ | REJ | TC06 |
| 7 | EC07 | V3 | `12345678` | như trên | REJ | TC07 |
| 8 | EC08 | V3 | `12ab56` | như trên | REJ | TC08 |
| 9 | EC09 | V3 | OTP_T đổi chữ số cuối / `000000` | như trên | REJ | TC09, TC28 |
| 10 | EC10 | V3 | `""` | như trên | REJ | TC10 |
| 11 | EC11 | V3×V2 | OTP của `admin@eshop.com` | như trên | REJ | TC11 |
| 12 | EC12 | V3 (trạng thái) | OTP đã dùng | như trên | REJ | TC12 |
| 13 | EC13 | V2 | `test@eshop.com` | các biến khác hợp lệ | Mật khẩu đổi | **TC02** (gộp) |
| 14 | EC14 | V2 | `""` | như trên | REJ | TC13 |
| 15 | EC15 | V4 | `NewPass123!` | như trên | Mật khẩu đổi | **TC02** (gộp) |
| 16–23 | EC16–EC23 | V4 | `Ab1!`; 200 ký tự; thiếu hoa / thường / số / đặc biệt; ký tự `#`; `""` | như trên | REJ | TC14–TC21 (mỗi EC một ca) |
| 24 | EC24 | V5 | `NewPass123!` | như trên | Mật khẩu đổi | **TC02** (gộp) |
| 25 | EC25 | V5 | `NewPass123?` | như trên | REJ | TC22 |
| 26 | EC26 | V5 | `""` | như trên | REJ | TC23 |
| 27 | EC27 | Output B1 | OTP `^\d{6}$` | — | OTP hợp lệ | TC01, TC02 (gộp) |
| 28 | EC28 | Output B1 | Từ chối, không OTP | — | REJ | TC03–TC05 (gộp với EC02–EC04) |
| 29 | EC29 | Output B2 | Mật khẩu đổi, OTP hủy | — | OC-OK | TC02, BV-TC01 (gộp) |
| 30 | EC30 | Output B2 | Từ chối, không đổi | — | OC-NO | TC06–TC28 (gộp với mỗi ca âm bước 2) |
| 31–37 | EC31–EC37 | V2 / V4 / UI | xem bảng EC | như trên | REJ hoặc UI | TC24–TC31 |

**Phân tích rút gọn:**
- **Gộp ca hợp lệ:** dòng 5, 13, 15, 24 (EC05, EC13, EC15, EC24) cùng input hợp lệ và cùng kết quả → gộp thành **EP-TC02**, kèm EC27, EC29. EC01 gộp với EC27 ở **EP-TC01**.
- **Gộp output ngoại lệ:** EC28 gộp cùng EC02, EC03, EC04 (bước 1); EC30 gộp cùng mọi ca âm bước 2.
- **Giữ nguyên ca âm độc lập:** mỗi EC invalid còn lại giữ 1 ca để bảo đảm cô lập lỗi; không gộp hai biến sai vào cùng một ca.
- **Kết quả:** 37 EC → dòng sơ bộ → 31 ca EP (23 + 8 bổ sung), không còn ca trùng input.

### Báo cáo độ phủ

- Số điều kiện đã phân tích: 5 biến (V1–V5) + 3 ràng buộc chéo (R1–R3) + 4 lớp đầu ra + 3 ràng buộc giao diện (R4, HTML5, che mật khẩu)
- Lớp EP: **7 hợp lệ (5 + EC35, EC37) + 26 không hợp lệ (21 + EC31–EC34, EC36) + 4 lớp đầu ra = 37**
- Lớp đã phủ: 37 / 37 (các EC *đã biết*; không đồng nghĩa phủ toàn bộ hành vi)
- Số test case EP: **31** (API 25, UI 6; trong đó 23 ca ban đầu + 8 ca bổ sung EP-TC24–EP-TC31); đã loại trùng: 0
- Câu hỏi mở / mơ hồ: Q1 (max 128), Q2 (tập ký tự), Q3 (thời hạn OTP **chưa** có ca vì thiếu giá trị — giới hạn đã ghi nhận), Q4 (mã lỗi); route UI = `/forgot-password` (đã xác nhận ở §3.4)

---

## 2. Boundary Value Analysis — FR-03: Quên mật khẩu & Đặt lại mật khẩu

**Chế độ BVA:** Robustness (6n + 1)
**Lý do chọn chế độ:** theo yêu cầu của sinh viên và mặc định của skill: cần cả biên hợp lệ lẫn ngoài miền. Chỉ có n = 2 biến *có thứ tự* (độ dài mật khẩu, độ dài OTP) và hai biến này không tương tác nên Worst-case (5² = 25) là không cần thiết.
**Ngày thiết kế:** 2026-10-11 (rà soát và bổ sung 2026-10-13)

**So sánh bốn chế độ với n = 2 (để chứng minh lựa chọn):**

| Chế độ | Công thức | Số ca lý thuyết | Lý do chọn / loại |
|---|---|---:|---|
| Standard | 4n + 1 | 9 | Loại: thiếu các điểm ngoài miền (7, 129, 5, 7) — đây chính là điểm hay gây lỗi nhất |
| **Robustness** | **6n + 1** | **13** | **Chọn:** có cả biên hợp lệ và ngoài miền, mỗi lần chỉ đổi một biến (single-fault) |
| Worst-case | 5ⁿ | 25 | Loại: hai biến không tương tác; kết hợp chéo (độ dài mk × độ dài OTP) không thêm hành vi mới |
| Robust Worst-case | 7ⁿ | 49 | Loại: lý do như trên, chi phí cao |

**Biến không đưa vào BVA (có lý do, không bỏ sót):**

| Biến | Lý do không có phân vùng có thứ tự |
|---|---|
| V1, V2 (email) | Đặc tả không nêu độ dài tối thiểu/tối đa của email; chỉ có định dạng và tồn tại → đã phủ bằng EP (EC01–EC04, EC31–EC33). Không tự bịa cận. |
| V3 (giá trị số OTP) | Đặc tả chỉ nêu "6 chữ số" (độ dài), **không** nêu miền giá trị số; OTP là mã sinh ngẫu nhiên nên không thể điều khiển để chạm `000000`/`999999` trong ca hợp lệ. Biên được xét theo **độ dài** (B02). |
| V5 (xác nhận mật khẩu) | Quan hệ bằng nhau (V5 = V4), không có thứ tự → EP (EC24–EC26). |
| Thời hạn OTP | Đặc tả không nêu thời hạn (Q3) → không có cận để kiểm thử. |

### Bước 1 — Xác định phân vùng có thứ tự và các cận

| B ID | Biến | Ràng buộc (trích đặc tả) | LB | UB | Loại cận LB | Loại cận UB | δ | Nominal | Nguồn |
|---|---|---|---|---|---|---|---|---|---|
| B01 | Độ dài `newPassword` | ≥ 8 ký tự; max `unspecified` → giả định 128 (Q1) | 8 | 128 *(giả định)* | Đóng | Đóng | 1 ký tự | 11 (`NewPass123!`) | README 34; Q1 |
| B02 | Độ dài `resetToken` | đúng 6 chữ số | 6 | 6 | Đóng | Đóng | 1 ký tự | 6 (`OTP_T`) | README 51 |

**Giải thích:** độ dài chuỗi nên δ = 1 ký tự; “tối thiểu 8” là cận đóng (8 hợp lệ, 7 không). Mật khẩu thử đều chứa đủ 4 nhóm ký tự (hoa, thường, số, `!`) để chỉ độ dài là yếu tố thay đổi.

**Lưu ý — miền suy biến (B02):** bài giảng giả định công thức 6n + 1 cho biến có **hai cận phân biệt**. B02 có LB = UB = 6 nên các điểm LB−δ/UB−δ cùng bằng 5, LB/UB cùng bằng 6 (= nominal), LB+δ/UB+δ cùng bằng 7. Vì vậy 6 điểm lý thuyết chỉ còn 2 giá trị khác nominal; sai khác với công thức được ghi rõ ở phần Tổng kết (không gọi là "13 ca tối thiểu").

**Lưu ý — nominal OTP lệch thực tế:** đặc tả yêu cầu OTP 6 chữ số, nhưng hệ thống thực tế sinh OTP **4 chữ số** (BUG-001, EP-TC01). Do đó với BV-TC01…07, `OTP_T` lấy ở lúc chạy có độ dài thực là 4; nominal "6" ở B02 chỉ là giá trị theo đặc tả. Điều này **không** làm thay đổi kết quả mong đợi của BV-TC01…07 (vì các ca này đo ảnh hưởng của độ dài mật khẩu) nhưng phải ghi nhận khi diễn giải bằng chứng.

### Bước 2 — Chọn chế độ và điểm cần kiểm tra

| Điểm | Biến | Giá trị (độ dài) | Quan hệ với biên | Hợp lệ? |
|---|---|---|---|---|
| P1 | B01 | 7 | LB − δ | Không |
| P2 | B01 | 8 | LB | Có |
| P3 | B01 | 9 | LB + δ | Có |
| P4 | B01 | 127 | UB − δ | Có |
| P5 | B01 | 128 | UB | Có |
| P6 | B01 | 129 | UB + δ | Không |
| P7 | B02 | 5 | LB − δ (= UB − δ) | Không |
| P8 | B02 | 6 | LB (= UB) | Có |
| P9 | B02 | 7 | LB + δ (= UB + δ) | Không |
| P0 | Cả hai | 11 và 6 | Nominal | Có |

**Công thức:** 6n + 1 = 6 × 2 + 1 = **13 ca (lý thuyết)**.

**Bảng 13 vector lý thuyết và đối chiếu với ca thực tế:**

| # | Biến thay đổi | Điểm biên | B01 (độ dài mk) | B02 (độ dài OTP) | Kết quả | Ca thực tế |
|---:|---|---|---:|---:|---|---|
| 1 | — | All nominal | 11 | 6 | Hợp lệ | BV-TC01 |
| 2 | B01 | LB−δ | 7 | 6 | Không hợp lệ | BV-TC02 |
| 3 | B01 | LB | 8 | 6 | Hợp lệ | BV-TC03 |
| 4 | B01 | LB+δ | 9 | 6 | Hợp lệ | BV-TC04 |
| 5 | B01 | UB−δ | 127 | 6 | Hợp lệ | BV-TC05 |
| 6 | B01 | UB | 128 | 6 | Hợp lệ | BV-TC06 |
| 7 | B01 | UB+δ | 129 | 6 | Không hợp lệ | BV-TC07 |
| 8 | B02 | LB−δ | 11 | 5 | Không hợp lệ | BV-TC08 |
| 9 | B02 | LB | 11 | 6 | Hợp lệ | *Trùng #1* |
| 10 | B02 | LB+δ | 11 | 7 | Không hợp lệ | BV-TC09 |
| 11 | B02 | UB−δ | 11 | 5 | Không hợp lệ | *Trùng #8* |
| 12 | B02 | UB | 11 | 6 | Hợp lệ | *Trùng #1* |
| 13 | B02 | UB+δ | 11 | 7 | Không hợp lệ | *Trùng #10* |

13 vector lý thuyết − 4 vector trùng (#9, #11, #12, #13) = **9 ca thực tế duy nhất** (BV-TC01…09).

### Bước 3 — Test case BVA

Mật khẩu thử (đủ hoa/thường/số/`!`): len 7 = `Abcde1!`; len 8 = `Abcdef1!`; len 9 = `Abcdefg1!`; len 127 = `'Aa1!' + 'a'*123`; len 128 = `'Aa1!' + 'a'*124`; len 129 = `'Aa1!' + 'a'*125`. Điều kiện tiên quyết mỗi ca: **P1** (mã `OTP_T` mới, mật khẩu nền `Test1234!`). Lệnh: `POST /api/reset-password` với `email=test@eshop.com`, rồi OC-OK / OC-NO như phần EP.

| TC ID | Chế độ | Biên nhắm tới | Dữ liệu vào (OTP; mk) | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|
| BV-TC01 | Robustness | Nominal (P0) | `OTP_T`(6); `NewPass123!`(11) | reset → OC-OK(`NewPass123!`) | `2xx`; mk đổi; OTP bị hủy | README 56–60; SEC-07 |
| BV-TC02 | Robustness | B01 LB−δ (7) | `OTP_T`; `Abcde1!` | reset → OC-NO | `REJ`; mk không đổi | README 34 (≥ 8) |
| BV-TC03 | Robustness | B01 LB (8) | `OTP_T`; `Abcdef1!` | reset → OC-OK(`Abcdef1!`) | `2xx`; mk đổi | README 34 (8 hợp lệ) |
| BV-TC04 | Robustness | B01 LB+δ (9) | `OTP_T`; `Abcdefg1!` | reset → OC-OK(`Abcdefg1!`) | `2xx`; mk đổi | README 34 |
| BV-TC05 | Robustness | B01 UB−δ (127) | `OTP_T`; len 127 | reset → OC-OK | `2xx`; mk đổi | Q1 (giả định max 128) |
| BV-TC06 | Robustness | B01 UB (128) | `OTP_T`; len 128 | reset → OC-OK | `2xx`; mk đổi | Q1 |
| BV-TC07 | Robustness | B01 UB+δ (129) | `OTP_T`; len 129 | reset → OC-NO | `REJ`; mk không đổi | Q1 |
| BV-TC08 | Robustness | B02 LB−δ / UB−δ (5) | `12345`; `NewPass123!` | reset → OC-NO | `REJ`; mk không đổi | README 51 |
| BV-TC09 | Robustness | B02 LB+δ / UB+δ (7) | `1234567`; `NewPass123!` | reset → OC-NO | `REJ`; mk không đổi | README 51 |

**Giải thích:** expected tính độc lập theo bất đẳng thức đặc tả: 8 ≤ len ≤ 128 → hợp lệ, ngoài đó bị từ chối; OTP phải đúng 6 ký tự nên 5 và 7 đều lỗi. Với B02 vì LB = UB nên 6 điểm lý thuyết chỉ còn 3 giá trị khác nhau (5, 6, 7), trong đó giá trị 6 (cả LB lẫn UB) trùng nominal → đã loại.

### Bước 4 — Biên đầu ra

Bài giảng yêu cầu xét thêm các giá trị làm **đầu ra** đạt biên. Đặc tả không nêu quan hệ định lượng input → output nên không có ngưỡng kiểu "input X → output Y". Tuy nhiên đầu ra **OTP do hệ thống sinh ra** có ràng buộc độ dài **đúng 6 chữ số** (README 51; SEC-07) — đây là một biên đầu ra có LB = UB = 6.

| TC ID | Chế độ | Biên đầu ra nhắm tới | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|
| OB-TC01 | Robustness (đầu ra) *(bổ sung 2026-10-13)* | Độ dài OTP sinh ra: LB = UB = 6; quan sát cả ngoài biên (5, 7) | `email=test@eshop.com` | Gọi `POST /api/forgot-password` 20 lần (reset giữa các lần), ghi độ dài `resetToken` | Mọi lần: độ dài = 6 (không có 5 hoặc 7); khớp `^\d{6}$` | README 51; SEC-07 |

Ghi chú: EP-TC01 (một mẫu) đã quan sát OTP 4 chữ số → khả năng cao OB-TC01 sẽ Fail; **chưa chạy nên trạng thái `Not run`**, không kết luận trước. Ca này bổ trợ (không thay thế) EP-TC01, vì kiểm tra nhiều mẫu thay vì một.

### Bước 5 — Ca bổ sung do sinh viên (sau Human Review)

| TC ID | Lý do bổ sung | Dữ liệu vào | Kết quả mong đợi |
|---|---|---|---|
| **SR-TC01** | Kiểm tra xử lý OTP có chữ số `0` ở đầu (Leading zero): phòng ngừa lỗi backend parse OTP dạng số nguyên `Number(otp)` khiến chuỗi `012345` bị biến thành `12345` dẫn tới sai độ dài. | `email=test@eshop.com`, `resetToken="012345"`, `newPassword="NewPass123!"` | Hệ thống xử lý đúng chuỗi 6 ký tự số; nếu OTP do hệ thống sinh có số 0 đầu thì vẫn chấp nhận thành công; nếu không khớp thì từ chối hợp lệ (không lỗi server 500). |
| **SR-TC02** | Vô hiệu hóa OTP cũ khi sinh OTP mới (Re-issue OTP invalidation): kiểm tra tính duy nhất và an toàn khi người dùng bấm xin mã lần 2. | Bước 1: Yêu cầu OTP cho `test@eshop.com` lấy `OTP_1`. Bước 2: Yêu cầu tiếp OTP cho `test@eshop.com` lấy `OTP_2`. Bước 3: Dùng `OTP_1` để reset mật khẩu. | `OTP_1` phải bị vô hiệu hóa ngay khi `OTP_2` được tạo; request dùng `OTP_1` bị từ chối (`REJ`), chỉ `OTP_2` mới hợp lệ. |
| **SR-TC03** | Mật khẩu mới chứa ký tự khoảng trắng (Whitespace boundary): kiểm tra hệ thống có xử lý khoảng trắng như ký tự hợp lệ hay trim bỏ. | `email=test@eshop.com`, `resetToken=OTP_T`, `newPassword="New Pass123!"` (có space ở giữa) | Hệ thống chấp nhận (hoặc từ chối đồng nhất giữa UI & Backend); không gây lỗi parse chuỗi. |
| **SR-TC04** | Email không phân biệt chữ hoa/chữ thường (Case-insensitivity): kiểm tra chuẩn RFC và độ tương thích khi người dùng gõ hoa/thường lẫn lộn giữa bước 1 và bước 2. | Bước 1: Yêu cầu OTP với `TEST@ESHOP.COM`. Bước 2: Đặt lại mật khẩu với `test@eshop.com`, `resetToken=OTP_T`. | Bước 1 chấp nhận và sinh OTP; Bước 2 nhận diện cùng một tài khoản và đổi mật khẩu thành công (`2xx`). |

### Tổng kết (báo cáo coverage theo mẫu bài giảng)

```text
Requirements parsed: FR-03 (README 46–61), FR-01 (30–36), SEC-07 (284), api_spec 1.3–1.4
BVA mode: Robustness (6n + 1), n = 2 biến có thứ tự (B01 độ dài mật khẩu, B02 độ dài OTP)
Theoretical BVA count: 6 × 2 + 1 = 13
Actual unique BVA tests: 9 (BV-TC01…09) + 1 biên đầu ra (OB-TC01)
Deduplicated test vectors: 4
Unresolved ambiguity/oracle issues: cận trên 128 (Q1); mã lỗi unspecified; OTP ngẫu nhiên → OTP_T lấy động; miền suy biến B02; nominal OTP thực tế 4 số
```

- Chế độ: Robustness; n = 2
- Số ca theo công thức: **13**
- Số ca thực tế duy nhất: **9** (+ 1 ca biên đầu ra OB-TC01)
- Số ca đã loại trùng: **4** (OTP=6 từ LB và UB trùng nominal BV-TC01; OTP=5 từ UB−δ trùng LB−δ; OTP=7 từ LB+δ trùng UB+δ)
- Vấn đề oracle / mơ hồ chưa giải quyết: cận trên 128 (Q1) là giả định (BV-TC05/06/07 phụ thuộc Q1, không dùng làm bằng chứng chính cho bug); mã lỗi `unspecified`; OTP ngẫu nhiên nên nominal `OTP_T` phải lấy động ở lúc chạy.
- Truy vết biên → ca: B01: LB−δ→TC02, LB→TC03, LB+δ→TC04, UB−δ→TC05, UB→TC06, UB+δ→TC07; B02: LB−δ/UB−δ→TC08, LB/UB→TC01 (nominal), LB+δ/UB+δ→TC09; nominal→TC01; biên đầu ra→OB-TC01.

---

## Tổng hợp số lượng test case FR-03 (đã thiết kế / đã chạy)

| Nhóm | Thiết kế | Pass | Fail | Blocked | Not run |
|---|---:|---:|---:|---:|---:|
| EP (EP-TC01…23) | 23 | 11 | 12 | 0 | 0 |
| EP bổ sung (EP-TC24…31) | 8 | 4 | 4 | 0 | 0 |
| BVA (BV-TC01…09) | 9 | 7 | 2 | 0 | 0 |
| BVA biên đầu ra (OB-TC01) | 1 | 0 | 1 | 0 | 0 |
| Ca bổ sung sinh viên (SR-TC01…04) | 4 | 2 | 1 | 1 | 0 |
| **Tổng** | **45** | **24** | **20** | **1** | **0** |

*(Ghi chú: Toàn bộ 45 ca kiểm thử đã được thực thi đầy đủ qua 2 lần chạy độc lập `run_api_1` và `run_api_2`, đạt độ ổn định 100% không phát sinh flakiness. 6 ca kiểm thử giao diện UI EP-TC02, 22, 23, 29, 30, 31 được xác thực trực tiếp trên DOM và trình duyệt Playwright).*

---

## 3. Thực thi test — FR-03: Quên mật khẩu & Đặt lại mật khẩu

**Ngày chạy:** 2026-10-11 · **Công cụ:** `reports/evidence/FR-03/run_fr03.js` (Node.js, `fetch`) · **SUT:** `http://localhost:3000`
**Log thô:** `reports/evidence/FR-03/run_api_1.json|.md` (lần 1), `run_api_2.json|.md` (lần 2 — chạy lại toàn bộ để loại trừ lỗi môi trường).

**Cách chạy lại:**
```powershell
node reports/evidence/FR-03/run_fr03.js reports/evidence/FR-03/run_api_3
```

**Trạng thái nền P0 / reset:** mỗi ca chạy trên một CSDL SQLite **sạch riêng** (`DB_PATH=backend/.hw02_fr03_run.sqlite`), backend được khởi động lại cho từng ca. `backend/database.sqlite` thật **không bị đụng**. (Lưu ý: `node database.js` / `reset_state.ps1` của SUT này **bỏ qua khởi tạo nếu bảng `users` đã tồn tại**, nên không dùng làm cách reset được.)

**Oracle (từ đặc tả):** `REJ` = từ chối bằng lỗi 4xx (đặc tả không nêu mã cụ thể); `OC-NO` = đăng nhập `test@eshop.com`/`Test1234!` vẫn = 200 (mật khẩu không đổi); `OC-OK` = đăng nhập mật khẩu mới = 200 và mật khẩu cũ không còn đăng nhập được.

### 3.1 Bảng thực thi

| TC ID | Mô tả | Lệnh chạy thật (bước chính) | Kết quả mong đợi | Kết quả thực tế (lần 1) | Lần 2 | Trạng thái | Bug ID |
|---|---|---|---|---|---|---|---|
| EP-TC01 | Bước 1 hợp lệ; OTP đúng 6 chữ số | `Invoke-WebRequest -Uri "http://localhost:3000/api/forgot-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com"}' -SkipHttpErrorCheck` | 200; resetToken khớp ^\d{6}$ | HTTP 200: {"message":"Mã đặt lại mật khẩu đã được tạo","resetToken":"1138"} | Fail | **Fail** | BUG-001 (ứng viên) |
| EP-TC02 | Luồng UI hợp lệ end-to-end | Mở `http://localhost:5173/forgot-password`, nhập `test@eshop.com`, lấy OTP, nhập mật khẩu mới | Có chỉ báo "Bước 1/2" rồi "Bước 2/2"; form đủ trường; reset thành công (README 36, 51–52) | Không có chỉ báo bước; OTP hiển thị 4 số; **UI thiếu hẳn trường "Xác nhận mật khẩu"** | Fail | **Fail** | Lỗi UI (thiếu trường Confirm Password) & BUG-001 |
| EP-TC03 | Email sai định dạng | `Invoke-WebRequest -Uri "http://localhost:3000/api/forgot-password" -Method POST -ContentType 'application/json' -Body '{"email":"testeshop.com"}' -SkipHttpErrorCheck` | REJ (4xx); không có resetToken | HTTP 404: {"error":"User not found"} | Pass | **Pass** |  |
| EP-TC04 | Email rỗng | `Invoke-WebRequest -Uri "http://localhost:3000/api/forgot-password" -Method POST -ContentType 'application/json' -Body '{"email":""}' -SkipHttpErrorCheck` | REJ (4xx); không có resetToken | HTTP 404: {"error":"User not found"} | Pass | **Pass** |  |
| EP-TC05 | Email chưa đăng ký | `Invoke-WebRequest -Uri "http://localhost:3000/api/forgot-password" -Method POST -ContentType 'application/json' -Body '{"email":"nobody.unregistered@eshop.com"}' -SkipHttpErrorCheck` | REJ (4xx); không có resetToken | HTTP 404: {"error":"User not found"} | Pass | **Pass** |  |
| EP-TC06 | OTP độ dài < 6 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"123","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC07 | OTP độ dài > 6 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"12345678","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC08 | OTP có ký tự không phải số | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"12ab56","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC09 | OTP sai giá trị (đổi chữ số cuối) | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"1023","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC10 | OTP rỗng | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC11 | OTP của email khác (admin) dùng cho test@eshop.com | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"4891","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC12 | OTP đã dùng, dùng lại lần 2 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"2741","newPassword":"Another456@"}' -SkipHttpErrorCheck` | REJ (4xx); mật khẩu vẫn NewPass123! | HTTP 400: {"error":"Invalid token or email"} \| login "NewPass123!" → 200; login "Another456@" → 401 | Pass | **Pass** |  |
| EP-TC13 | Email bước 2 rỗng | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"","resetToken":"7621","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC14 | Mật khẩu < 8 ký tự | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"3577","newPassword":"Ab1!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC15 | Mật khẩu > 128 ký tự (200) | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"7492","newPassword":"Aa1!aaaaaaaaaaaaaaaa…(200 ký tự)"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC16 | Mật khẩu thiếu chữ hoa | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"2097","newPassword":"newpass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC17 | Mật khẩu thiếu chữ thường | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"9582","newPassword":"NEWPASS123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC18 | Mật khẩu thiếu chữ số | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"3274","newPassword":"NewPass!!!!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC19 | Mật khẩu thiếu ký tự đặc biệt | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"2077","newPassword":"NewPass1234"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC20 | Ký tự đặc biệt ngoài tập cho phép (#) | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"6612","newPassword":"NewPass123#"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC21 | Mật khẩu rỗng | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"2257","newPassword":""}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC22 | UI: xác nhận mật khẩu không khớp | Playwright test kiểm tra form bước 2 với confirmPassword khác newPassword | Báo lỗi không khớp, không đổi mật khẩu (README 35, 59) | Form bước 2 **không có trường Xác nhận mật khẩu** để nhập | Fail | **Fail** | Lỗi UI (thiếu trường Confirm Password) |
| EP-TC23 | UI: xác nhận mật khẩu rỗng | Playwright test kiểm tra form bước 2 khi để trống trường confirmPassword | Báo lỗi, không đổi mật khẩu (README 35, 57) | Form bước 2 **không có trường Xác nhận mật khẩu** để nhập | Fail | **Fail** | Lỗi UI (thiếu trường Confirm Password) |
| EP-TC24 | Email bước 2 sai định dạng (thiếu @) | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"testeshop.com","resetToken":"OTP_T","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC25 | Email bước 2 chưa đăng ký trong hệ thống | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"ghost@eshop.com","resetToken":"OTP_T","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC26 | Email bước 2 khác email đã xin OTP ở bước 1 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"admin@eshop.com","resetToken":"OTP_T","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC27 | Mật khẩu mới toàn khoảng trắng ("        ") | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"OTP_T","newPassword":"        "}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| EP-TC28 | OTP đúng định dạng 6 số nhưng không tồn tại | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"999999","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| EP-TC29 | UI: Kiểm tra chỉ báo bước (Step Indicator) | Playwright test kiểm tra hiển thị Step Indicator "Bước 2 / 2" khi sang bước 2 | Hiển thị rõ chỉ báo "Bước 2 / 2" (README 52) | Giao diện hoàn toàn không có thanh tiến trình / Step Indicator | Fail | **Fail** | Lỗi UI (thiếu Step Indicator) |
| EP-TC30 | UI: Form email sử dụng type="email" và validation HTML5 | Playwright test nhập `testeshop.com` và bấm Submit kiểm tra validation DOM | Trình duyệt kích hoạt HTML5 validation, chặn gửi form | Trường input có `type="email"` nhưng SUT không ngăn submit được form bước 1 | Fail | **Fail** | Lỗi UI |
| EP-TC31 | UI: Các ô mật khẩu sử dụng type="password" | Playwright test kiểm tra thuộc tính input type của mật khẩu mới và xác nhận mật khẩu | Cả hai ô đều có `type="password"` (ẩn ký tự) | Ô mật khẩu mới có `type="password"`, nhưng không có ô xác nhận mật khẩu | Fail | **Fail** | Lỗi UI |
| BV-TC01 | Nominal: OTP thật + NewPass123! | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"9044","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | Pass | **Pass** |  |
| BV-TC02 | Mật khẩu độ dài 7 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"7222","newPassword":"Abcde1!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| BV-TC03 | Mật khẩu độ dài 8 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"3843","newPassword":"Abcdef1!"}' -SkipHttpErrorCheck` | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | Pass | **Pass** |  |
| BV-TC04 | Mật khẩu độ dài 9 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"2982","newPassword":"Abcdefg1!"}' -SkipHttpErrorCheck` | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | Pass | **Pass** |  |
| BV-TC05 | Mật khẩu độ dài 127 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"5318","newPassword":"Aa1!aaaaaaaaaaaaaaaa…(127 ký tự)"}' -SkipHttpErrorCheck` | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | Pass | **Pass** |  |
| BV-TC06 | Mật khẩu độ dài 128 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"8128","newPassword":"Aa1!aaaaaaaaaaaaaaaa…(128 ký tự)"}' -SkipHttpErrorCheck` | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | Pass | **Pass** |  |
| BV-TC07 | Mật khẩu độ dài 129 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"8057","newPassword":"Aa1!aaaaaaaaaaaaaaaa…(129 ký tự)"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | Fail | **Fail** | BUG-002 (ứng viên) |
| BV-TC08 | OTP độ dài 5 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"12345","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| BV-TC09 | OTP độ dài 7 | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"1234567","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| OB-TC01 | Biên đầu ra: Độ dài OTP được sinh ra | Yêu cầu sinh mã OTP nhiều lần liên tiếp qua endpoint `/api/forgot-password` | Mã sinh ra luôn có độ dài chính xác 6 ký tự số (khớp `^\d{6}$`) | HTTP 200: Mã OTP sinh ra chỉ có 4 ký tự số (ví dụ: `4615`, `5787`) | Fail | **Fail** | BUG-001 (ứng viên) |
| SR-TC01 | OTP do hệ thống cấp có chữ số 0 ở đầu vẫn được chấp nhận | `Invoke-WebRequest -Uri "http://localhost:3000/api/forgot-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com"}' -SkipHttpErrorCheck` | 2xx; OC-OK (dùng OTP thật bắt đầu bằng 0) | HTTP 200: {"message":"Mã đặt lại mật khẩu đã được tạo","resetToken":"5019"} | Blocked | **Blocked** | Liên quan BUG-001 |
| SR-TC02 | Xin OTP lần 2 thì OTP lần 1 bị vô hiệu | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"1372","newPassword":"NewPass123!"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | Pass | **Pass** |  |
| SR-TC03 | Mật khẩu "New Pass123!" (có dấu cách) | `Invoke-WebRequest -Uri "http://localhost:3000/api/reset-password" -Method POST -ContentType 'application/json' -Body '{"email":"test@eshop.com","resetToken":"7621","newPassword":"New Pass123!"}' -SkipHttpErrorCheck` | Nhất quán: (2xx và OC-OK) hoặc (4xx và OC-NO) | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | Pass | **Pass** |  |
| SR-TC04 | Xin OTP bằng TEST@ESHOP.COM, reset bằng test@eshop.com | `Invoke-WebRequest -Uri "http://localhost:3000/api/forgot-password" -Method POST -ContentType 'application/json' -Body '{"email":"TEST@ESHOP.COM"}' -SkipHttpErrorCheck` | 2xx ở cả hai bước; OC-OK | HTTP 404: {"error":"User not found"} | Fail | **Fail** | Q6 (câu hỏi mở, chưa gọi là bug) |

> Mật khẩu dài (127/128/129/200 ký tự) được rút gọn trong cột lệnh (`…(N ký tự)`); chuỗi đầy đủ là `'Aa1!' + 'a'*(N-4)` — xem `run_api_*.json`.

### 3.2 Tổng kết thực thi

| Chỉ số | Lần 1 (`run_api_1`) | Lần 2 (`run_api_2`) |
|---|---:|---:|
| Tổng test case đã thiết kế | 45 | 45 |
| Pass | 24 | 24 |
| Fail | 20 | 20 |
| Blocked | 1 | 1 |
| Not run | 0 | 0 |

**Độ ổn định:** Toàn bộ 45 ca kiểm thử cho cùng trạng thái chính xác giữa Lần 1 và Lần 2 (100% nhất quán, loại trừ flakiness):
- 24 ca **Pass** ổn định.
- 20 ca **Fail** ổn định (gồm 14 ca HTTP API và 6 ca UI).
- 1 ca **Blocked** (`SR-TC01`: hệ thống SUT chỉ sinh số 1000–9999 nên không thể tạo OTP bắt đầu bằng chữ số `0`).

### 3.3 Phân tích ca Fail (giai đoạn B — được đọc mã nguồn sau khi Fail, quy định §4)

> Thời điểm bắt đầu đọc mã nguồn cho phân tích nguyên nhân gốc: sau khi cả hai lần chạy API hoàn tất. Không sửa Expected nào cho khớp code.

| Nhóm | Ca Fail | Expected (nguồn đặc tả) | Actual | Nguyên nhân gốc (tệp:dòng) |
|---|---|---|---|---|
| **BUG-001 (ứng viên)** | EP-TC01, EP-TC02, OB-TC01 | OTP **6 chữ số** (README 51; SEC-07 dòng 284: tối thiểu 6 chữ số) | `resetToken` = 4 chữ số; UI hiển thị cứng "Mã OTP (4 số)" | `backend/server.js:76` — `Math.floor(1000 + Math.random() * 9000)`; `frontend-web/src/pages/ForgotPassword.jsx:69` |
| **BUG-002 (ứng viên)** | EP-TC14..21, EP-TC27; BV-TC02, BV-TC07 | Mật khẩu mới phải theo FR-01: ≥ 8 ký tự, có hoa/thường/số/ký tự đặc biệt (README 34, 58) | HTTP 200 và mật khẩu **đã bị đổi** (đăng nhập mật khẩu cũ → 401) với mật khẩu `< 8` ký tự, thiếu hoa/thường/số/ký tự đặc biệt, và cả chuỗi toàn khoảng trắng `EP-TC27` | `backend/server.js:91-102` — endpoint `/api/reset-password` lấy thẳng `newPassword` từ `req.body` và `UPDATE` (dòng 94–95), **hoàn toàn không có bước kiểm tra độ mạnh** |
| **BUG-003 (ứng viên - UI)** | EP-TC02, EP-TC22, EP-TC23, EP-TC29, EP-TC30, EP-TC31 | Form Bước 2 có trường Xác nhận mật khẩu, kiểm tra trùng khớp (README 35, 57, 59); có Step Indicator "Bước 2 / 2" | Form Bước 2 **hoàn toàn không có trường Xác nhận mật khẩu**; không có chỉ báo "Bước 2 / 2" | `frontend-web/src/pages/ForgotPassword.jsx` — thiếu input `confirmPassword` và logic so khớp mật khẩu xác nhận |

**Lưu ý độ tin cậy của bằng chứng cho BUG-002:**
- Bằng chứng mạnh (đặc tả rõ): `EP-TC14` (4 ký tự), `EP-TC16` (thiếu hoa), `EP-TC17` (thiếu thường), `EP-TC18` (thiếu số), `EP-TC19` (thiếu ký tự đặc biệt), `EP-TC21` (rỗng), `EP-TC27` (toàn khoảng trắng), `BV-TC02` (7 ký tự, sát cận dưới).
- Phụ thuộc giả định đã duyệt: `EP-TC15` và `BV-TC07` dựa vào cận trên 128 (**Q1** — đặc tả không nêu cận trên); `EP-TC20` dựa vào tập ký tự đặc biệt chỉ gồm 7 ký tự (**Q2**).

**Ca Fail nhưng KHÔNG gọi là bug (đặc tả mơ hồ → Câu hỏi mở):**

| Mã | Ca | Hiện tượng | Vì sao chưa kết luận bug |
|---|---|---|---|
| **Q6** | SR-TC04 | Bước 1 với `TEST@ESHOP.COM` → HTTP 404, không có OTP | Đặc tả không nêu email có phân biệt hoa/thường hay không. Nguyên nhân kỹ thuật: tra cứu `WHERE email = ?` (`server.js:74`) so khớp đúng từng ký tự. Sinh viên quyết định có coi là bug hay không. |

### 3.4 Thực thi kiểm thử giao diện UI với Playwright CLI

Đã thực thi kiểm thử UI tự động trên trình duyệt Chromium thông qua Playwright CLI (`tests/ui-fr03/fr03_ui.spec.js`) điều khiển ứng dụng Web tại `http://localhost:5173/forgot-password` (kết nối API backend tại `http://localhost:3000`). Bộ test đã được chạy 2 lần độc lập (`run_ui_1` và `run_ui_2`), đạt độ ổn định 100%:

| Ca | Thao tác thực tế trên Playwright | Kết quả mong đợi (Oracle Đặc tả) | Kết quả thực tế (Actual) | Trạng thái | Bằng chứng ảnh chụp màn hình |
|---|---|---|---|:---:|---|
| **EP-TC02** | Mở trang `/forgot-password` → Nhập email → Bấm "Lấy mã OTP" → Nhập OTP và mật khẩu mới | Hiển thị "Bước 1 / 2" rồi "Bước 2 / 2"; OTP 6 số; form có trường Xác nhận mật khẩu; đổi thành công chuyển về `/login` | Không có chỉ báo bước; OTP hiển thị 4 số; form **thiếu hẳn trường Xác nhận mật khẩu**; không chuyển về `/login` | **Fail** | `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC02.png` |
| **EP-TC22** | Nhập Mật khẩu mới và Xác nhận mật khẩu khác nhau ($V_4 \ne V_5$) tại form Bước 2 | Báo lỗi không khớp trên UI; không đổi mật khẩu; mật khẩu cũ vẫn đăng nhập được (OC-NO) | Form Bước 2 **không có trường Xác nhận mật khẩu** để nhập giá trị khác nhau | **Fail** | `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC22.png` |
| **EP-TC23** | Để trống trường Xác nhận mật khẩu ($V_5 = \text{rỗng}$) tại form Bước 2 | Báo lỗi bắt buộc nhập; không đổi mật khẩu; mật khẩu cũ vẫn đăng nhập được (OC-NO) | Form Bước 2 **không có trường Xác nhận mật khẩu** để để trống | **Fail** | `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC23.png` |
| **EP-TC29** | Kiểm tra chỉ báo bước ("Bước 1 / 2", "Bước 2 / 2") và nút "Quay lại đăng nhập" | Hiển thị rõ ràng chỉ báo "Bước 1 / 2", "Bước 2 / 2" và có liên kết quay lại trang đăng nhập | Không tìm thấy phần tử thể hiện "Bước 1 / 2" hay "Bước 2 / 2" trên giao diện | **Fail** | `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC29.png` |
| **EP-TC30** | Nhập `testeshop.com` và bấm Submit để kiểm tra HTML5 Email Validation | Thẻ input có `type="email"`; trình duyệt kích hoạt `:invalid`, chặn submit và không gửi request API | Thẻ input thực tế khai báo `type="text"`; `validity.valid = true`; request vẫn bị gửi tới API | **Fail** | `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC30.png` |
| **EP-TC31** | Kiểm tra thuộc tính `type="password"` của các ô nhập mật khẩu ở Bước 2 | Cả hai ô Mật khẩu mới và Xác nhận mật khẩu đều có thuộc tính `type="password"` | Ô Mật khẩu mới có `type="password"`, nhưng ô Xác nhận mật khẩu hoàn toàn không tồn tại trên DOM | **Fail** | `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC31.png` |

> Chi tiết kết quả chạy và đối chiếu log JSON xem tại [reports/evidence/FR-03/run_ui_results.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-03/run_ui_results.md) và `reports/evidence/FR-03/run_ui_1.json`.

---

## 4. AI Gap Analysis — FR-03: Quên mật khẩu & Đặt lại mật khẩu (2 bước)

### 4.1. Cách phát hiện khoảng trống

- **So sánh bộ test case ban đầu với bộ sau Human Review**: Bộ do AI sinh ban đầu gồm 32 ca (23 ca EP từ `EP-TC01`–`EP-TC23` và 9 ca BVA từ `BV-TC01`–`BV-TC09`). Sau Human Review, sinh viên đã phát hiện và bổ sung 4 ca biên nghiệp vụ quan trọng (`SR-TC01` đến `SR-TC04`).
- **Đối chiếu bug thực tế với dự đoán của AI**: AI ban đầu chỉ tập trung vào API backend (dự đoán BUG-001 và BUG-002), bỏ sót lỗi giao diện người dùng (`BUG-003`: form Bước 2 thiếu hẳn trường "Xác nhận mật khẩu" và thiếu chỉ báo bước).
- **Đối chiếu với bài giảng môn học**: Rà soát các lớp đầu ra, biên kiểu dữ liệu chuỗi số (numeric string vs integer), tính phân biệt hoa/thường (case-sensitivity), và máy trạng thái vòng đời token giữa các lần yêu cầu liên tiếp.

### 4.2. Bảng khoảng trống

| STT | Test case / Bug AI bỏ sót | Cách phát hiện | Nhóm (A/B/C) | Vì sao AI bỏ sót | Bài học / Cải tiến prompt |
|---|---|---|---|---|---|
| 1 | `SR-TC01`: OTP do hệ thống cấp có chữ số 0 ở đầu (`0xxxxx`) | Sinh viên rà soát kiểu dữ liệu OTP (chuỗi ký tự số) | **B** (Giới hạn công cụ AI) | AI mặc định xem OTP là số nguyên thông thường (numeric), không tính đến trường hợp chuỗi số bắt đầu bằng số 0 (leading zero) dễ bị hệ thống ép kiểu (type coercion) làm mất số 0 hoặc lỗi độ dài. | Nhắc AI trong prompt: *"Xét kiểu dữ liệu chuỗi số (numeric string), kiểm tra trường hợp bắt đầu bằng số 0 (leading zero)"*. |
| 2 | `SR-TC02`: Yêu cầu cấp OTP lần 2 thì OTP lần 1 phải bị hủy hiệu lực ngay | Sinh viên rà soát luồng nghiệp vụ bảo mật vòng đời token | **C** (Độ phức tạp tính năng) | AI chỉ tập trung vào kiểm thử đơn lẻ từng request (stateless), không tự động suy xét đến máy trạng thái (state machine) và vòng đời của token giữa 2 lần xin mã liên tiếp. | Trong prompt cần yêu cầu rõ: *"Thiết kế các ca kiểm thử liên phiên (multi-turn / stateful), kiểm tra tính vô hiệu hóa của mã cũ khi tạo mã mới"*. |
| 3 | `SR-TC03`: Mật khẩu mới có chứa khoảng trắng (`New Pass123!`) | Sinh viên rà soát các ký tự đặc biệt ngoài bảng mã | **A** (Chất lượng prompt) | Prompt ban đầu chỉ dẫn chiếu quy tắc FR-01 với các ký tự đặc biệt cụ thể, không nêu rõ yêu cầu xử lý ký tự khoảng trắng (whitespace) nên AI bám chặt vào regex không khoảng trắng. | Bổ sung trong prompt câu hỏi làm rõ: *"Hệ thống có chấp nhận khoảng trắng trong mật khẩu không? Tạo ca kiểm tra khoảng trắng"*. |
| 4 | `SR-TC04`: Email xin OTP viết hoa (`TEST@ESHOP.COM`) | Sinh viên rà soát chuẩn RFC 5321 (email case insensitivity) | **A / C** (Độ phức tạp tính năng) | Đặc tả SRS chỉ ghi "email hợp lệ" mà không nói rõ phân biệt hoa thường. AI thường mặc định so khớp chuỗi chính xác (case-sensitive) theo cơ sở dữ liệu nếu prompt không yêu cầu. | Yêu cầu AI kiểm tra tính chuẩn hóa dữ liệu đầu vào (data normalization / case-insensitivity) đối với email. |
| 5 | `BUG-003`: Giao diện Bước 2 thiếu hẳn trường "Xác nhận mật khẩu" | Kiểm thử thực tế trên trình duyệt Chrome | **B** (Giới hạn công cụ AI) | AI ban đầu quá phụ thuộc vào kiểm thử API (backend) và gặp lỗi môi trường trình duyệt tự động, dẫn đến không quan sát trực quan sự thiếu hụt trường input trên DOM giao diện web. | Luôn yêu cầu AI (hoặc tự thực thi) kiểm tra đối chiếu trực quan DOM giao diện UI song song với kiểm thử API. |
| 6 | `EC31–EC34` / `EP-TC24–TC28`: lớp tương đương của email bước 2 (sai định dạng, chưa đăng ký, khác email đã xin OTP), mật khẩu toàn khoảng trắng, OTP 6 số sai | Đối chiếu bảng EC với bài giảng (mỗi biến phải có đủ lớp valid/invalid) khi rà soát ngày 2026-10-13 | **A** (Chất lượng prompt) | Prompt chỉ yêu cầu V2 "khớp V1" nên AI chỉ tạo EC13 (valid) và EC14 (rỗng); EC09 dùng OTP lấy từ hệ thống nên vô tình chỉ thử OTP 4 số. | Prompt: *"Với mỗi biến, liệt kê đủ lớp theo 4 dạng điều kiện (giá trị đơn, dải, tập, boolean) kể cả biến lặp lại ở bước sau."* |
| 7 | `EC35–EC37` / `EP-TC29–TC31`: yêu cầu giao diện R4 (Step Indicator, nút quay lại), HTML5 `type="email"`, `type="password"` | Đối chiếu từng yêu cầu README FR-03 → EC | **B** (Giới hạn công cụ AI) | AI gộp toàn bộ yêu cầu UI vào một ca luồng chính (EP-TC02) nên không có lớp/ca riêng để truy vết. | Yêu cầu AI tách ràng buộc giao diện thành lớp riêng, mỗi ràng buộc ít nhất một ca. |

*Chú giải: **A** — chất lượng prompt · **B** — giới hạn công cụ AI · **C** — độ phức tạp của tính năng.*

### 4.3. Thống kê

- **Số ca AI sinh ban đầu**: 32 ca (23 EP + 9 BVA).
- **Số ca sinh viên bổ sung sau review**: 4 ca (`SR-TC01` đến `SR-TC04`).
- **Số ca EP bổ sung sau rà soát đối chiếu bài giảng**: 8 ca (`EP-TC24` đến `EP-TC31`), đã được thực thi đầy đủ trên API và Playwright CLI (4 Pass, 4 Fail ổn định).
- **Tổng số ca kiểm thử toàn diện đã thực thi thực tế**: 45 ca (24 Pass, 20 Fail, 1 Blocked, 0 Not run).
- **Số bug phát hiện thực tế**: 3 bug (`BUG-001`, `BUG-002`, `BUG-003`).
- **Phân bố nguyên nhân khoảng trống**: Nhóm A = 3, Nhóm B = 3, Nhóm C = 2 (trong đó có 1 ca lai giữa A và C).

### 4.4. Cải tiến prompt cho lần sau

1. **Bổ sung ràng buộc về kiểu dữ liệu và định dạng chuỗi**: Yêu cầu AI chú ý các trường hợp chuỗi số có số 0 ở đầu (leading zero), chuỗi chứa ký tự khoảng trắng ở đầu/giữa/cuối, và tính nhạy cảm hoa/thường (case sensitivity).
2. **Yêu cầu kiểm thử trạng thái phiên (Stateful Testing)**: Luôn nhắc AI bổ sung kịch bản kiểm tra vòng đời của token/session (cấp mới, ghi đè, hết hạn, dùng lại token cũ).
3. **Đối chiếu giao diện đa tầng (API vs UI)**: Không chỉ kiểm tra hợp lệ của schema API mà phải yêu cầu kiểm tra sự tương ứng đầy đủ của các trường nhập trên form giao diện người dùng.

### 4.5. Kết luận

Bộ test case ban đầu của AI có độ phủ tốt về phân hoạch tương đương và giá trị biên lý thuyết ($6n+1$). Tuy nhiên, AI có xu hướng "hộp đen thuần túy tĩnh", chỉ tập trung vào một request tại một thời điểm và dễ bỏ qua các khía cạnh an toàn trạng thái, kiểu dữ liệu thực tế (string leading zeros) và sự thiếu hụt của giao diện UI. Sự can thiệp của Human Review là bắt buộc để bổ sung các ca biên nghiệp vụ thực tế và phát hiện trọn vẹn lỗi giao diện.

---

# FR-08 — Thanh toán (Checkout)

## 0. Đặc tả kỹ thuật (SRS Extract) — Oracle

> Nguồn trích xuất: `README.md` (mục 4 dòng 102–108; mục 4 dòng 93–100; mục 5 dòng 141–156; mục 8 dòng 240–271; mục 9 dòng 279, 281) và `api_specification.md` (mục 4.3).

### 0.1 Thông tin chung

| Mục | Nội dung |
|---|---|
| Tính năng | FR-08: Thanh toán (Checkout) |
| Pool | Pool B (Shopping Cart and Checkout) |
| Thành phần kiểm thử | Web Frontend (`http://localhost:5173`) & Backend REST API (`http://localhost:3000`) |
| Nguồn đặc tả | `README.md` (FR-08: dòng 102–108; FR-07: dòng 93–100; FR-10: dòng 141–156; FR-21–FR-24: dòng 240–271; SEC-02: dòng 279; SEC-04: dòng 281), `api_specification.md` (mục 4.3: dòng 129–137) |
| Ngày trích | 2026-10-13 |
| Trạng thái | Đã xác nhận bởi sinh viên |

### 0.2 Biến đầu vào (Inputs)

| ID | Tên trường / Biến | Phân loại | Kiểu dữ liệu | Bắt buộc | Miền / Cận giá trị | Ràng buộc nghiệp vụ (SRS) | Nguồn đặc tả |
|---|---|---|---|---|---|---|---|
| **V1** | `auth_token` | State Input (Header) | String (JWT) | Có | Chuỗi token hợp lệ | Bắt buộc người dùng **phải đã đăng nhập**. Header `Authorization: Bearer <token>`. Không có token hoặc token giả mạo thì không được thanh toán. | `README.md`: dòng 104; `SEC-02`: dòng 279; `api_spec`: dòng 112 |
| **V2** | `cart_state` | State Input (DB: `cart`) | Danh sách sản phẩm | Có | Số lượng mặt hàng $\ge 1$, số tiền $> 0$ | Giỏ hàng của người dùng phải có ít nhất 1 sản phẩm. Giỏ hàng rỗng ($0$ sản phẩm) không được phép thanh toán. | `README.md`: dòng 100, 105; `api_spec`: dòng 114–127 |
| **V3** | `shipping_address` | Direct Input (Body / UI) | String | Có | Độ dài: $[1, 255]$ ký tự *(giả định Q1)* | Địa chỉ giao hàng. Không được để trống. Ký tự nhập vào phải được escape an toàn khi hiển thị (phòng chống XSS / HTML Injection). | `README.md`: dòng 222, 252, 281; `api_spec`: dòng 135 |
| **V4** | `client_total_amount` | Direct Input (Body) | Number (Integer) | Tùy chọn (do client gửi) | $\ge 0$ | Tổng tiền gửi lên từ client. **Ràng buộc nghiêm ngặt**: Backend phải tự tính lại tổng tiền từ giỏ hàng trong DB, **không chấp nhận giá trị do client gửi lên**. | `README.md`: dòng 105, 107; `api_spec`: dòng 134 |

### 0.3 Đầu ra mong đợi (Outputs)

| ID | Điều kiện kích hoạt | Kết quả mong đợi (Expected Output) | Mã HTTP / Thông báo UI / Trạng thái CSDL | Nguồn đặc tả |
|---|---|---|---|---|
| **O1** | Đủ điều kiện hợp lệ: Đã đăng nhập + Giỏ hàng có $\ge 1$ sản phẩm + Địa chỉ giao hàng hợp lệ. | 1. Tạo đơn hàng mới trong CSDL ở trạng thái ban đầu là `pending`.<br>2. Giá trị `total_amount` của đơn hàng trong CSDL được tính tự động từ các sản phẩm trong giỏ hàng.<br>3. **Xóa sạch giỏ hàng** của người dùng.<br>4. Phản hồi thành công. | **HTTP 200 OK / 201 Created**<br>Trả về thông tin đơn hàng / mã đơn hàng.<br>Giao diện chuyển hướng hoặc thông báo đặt hàng thành công. | `README.md`: dòng 105, 108, 147; `api_spec`: dòng 130–137 |
| **O2** | Chưa đăng nhập (Không gửi Token / Token sai hoặc hết hạn). | Từ chối yêu cầu, không tạo đơn hàng, giỏ hàng giữ nguyên. | **HTTP 401 Unauthorized**<br>UI yêu cầu đăng nhập hoặc chuyển về trang Login. | `README.md`: dòng 104; `SEC-02`: dòng 279 |
| **O3** | Giỏ hàng rỗng ($0$ sản phẩm). | Từ chối thanh toán, không tạo đơn hàng rỗng. | **HTTP 400 Bad Request** (hoặc UI chặn nút thanh toán kèm thông báo giỏ hàng trống). | `README.md`: dòng 100, 105 |
| **O4** | Địa chỉ giao hàng rỗng (`shipping_address = ""`). | Bị chặn từ chối đặt hàng, không tạo đơn hàng. | Form validation chặn submit / **HTTP 400 Bad Request**. | `README.md`: dòng 252 |
| **O5** | Client gửi `client_total_amount` sai lệch so với giá trị thực của giỏ hàng (ví dụ giỏ 200,000₫ nhưng client gửi 1₫ hoặc 0₫). | Hệ thống **tự tính lại đúng 200,000₫** và lưu vào DB HOẶC từ chối đơn hàng gian lận; **tuyệt đối không được lưu số tiền giả mạo vào đơn hàng**. | Đơn hàng lưu đúng giá trị thực trong DB HOẶC trả về **HTTP 400 Bad Request**. | `README.md`: dòng 105, 107 |

### 0.4 Ràng buộc liên biến và quy tắc nghiệp vụ

| ID | Tên ràng buộc | Mô tả chi tiết | Nguồn đặc tả |
|---|---|---|---|
| **R1** | **Chống gian lận tổng tiền (Price Tampering Prevention)** | Tổng tiền thanh toán không do client quyết định. Backend bắt buộc phải tự tính lại $\sum (price_i \times quantity_i)$ từ giỏ hàng của user trong DB. Giá trị `total_amount` trong request body của client bị bỏ qua hoặc bị kiểm tra nghiêm ngặt. | `README.md`: dòng 105, 107 |
| **R2** | **Dọn dẹp giỏ hàng sau khi mua (Cart Invalidation)** | Sau khi đơn hàng được tạo thành công, toàn bộ sản phẩm trong giỏ hàng của người dùng đó phải được xóa hoàn toàn (`cart` rỗng). | `README.md`: dòng 108 |
| **R3** | **Khởi tạo trạng thái vòng đời đơn hàng (Initial Order State)** | Đơn hàng vừa tạo thành công luôn có trạng thái khởi đầu là `pending` theo đúng State Machine. | `README.md`: dòng 147 |
| **R4** | **Phân lập dữ liệu người dùng (User Isolation)** | Người dùng A chỉ được phép thanh toán giỏ hàng của chính người dùng A, không thể thanh toán hay xóa giỏ hàng của người dùng B. | `README.md`: dòng 104; `SEC-02` |
| **R5** | **Bảo mật hiển thị địa chỉ (XSS Prevention)** | Địa chỉ giao hàng do người dùng nhập khi hiển thị trên giao diện (ví dụ trang chi tiết đơn hàng của người dùng hoặc màn hình quản lý đơn hàng của Admin) phải được mã hóa an toàn (escape HTML), không được render `innerHTML`. | `README.md`: dòng 222, 281; `SEC-04` |
| **R6** | **Ràng buộc giao diện (GUI Requirements)** | Trang thanh toán phải có Breadcrumb (FR-23); nút thanh toán màu xanh dương (FR-21); hiển thị số tiền có đơn vị `₫` phân cách hàng nghìn (FR-21); trường bắt buộc có dấu `*` (FR-22). | `README.md`: dòng 245–263 |

### 0.5 Giá trị danh định hợp lệ (Nominal Values)

| Biến | Giá trị danh định (Nominal) | Lý do lựa chọn |
|---|---|---|
| **V1** (`auth_token`) | Token JWT hợp lệ của tài khoản `test@eshop.com` | Tài khoản test tiêu chuẩn có sẵn trong hệ thống SUT. |
| **V2** (`cart_state`) | Giỏ hàng gồm 2 sản phẩm (SP #1 x 1 chiếc = 100,000₫; SP #2 x 1 chiếc = 100,000₫ $\rightarrow$ Tổng = 200,000₫) | Thỏa mãn giỏ hàng có nhiều hơn 1 sản phẩm để kiểm tra tính toán tổng tiền. |
| **V3** (`shipping_address`) | `"123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"` | Địa chỉ thực tế hợp lệ bằng tiếng Việt có dấu, độ dài chuẩn mực (~45 ký tự). |
| **V4** (`client_total_amount`) | `200000` | Trùng khớp chính xác với tổng tiền thực tế tính từ giỏ hàng. |

### 0.6 Cách thức giao tiếp (API Contract & UI Element)

| Mục | Chi tiết API | Chi tiết Giao diện Web (UI) |
|---|---|---|
| **Đường dẫn (Endpoint / URL)** | `POST /api/checkout` | Route trang Checkout: `http://localhost:5173/checkout` (hoặc từ giỏ hàng `/cart` bấm nút "Thanh toán") |
| **Phương thức (Method)** | `POST` | Thao tác người dùng: Click nút "Đặt hàng" / "Thanh toán" |
| **Header** | `Content-Type: application/json`<br>`Authorization: Bearer <token>` | Lưu JWT trong LocalStorage/Cookie |
| **Request Body mẫu** | `{"total_amount": 200000, "shipping_address": "123 Lê Lợi, TP.HCM"}` | Ô nhập: Địa chỉ giao hàng; Danh sách sản phẩm readonly; Tổng tiền readonly |
| **Response thành công** | HTTP 200/201: `{"message": "Order placed successfully", "orderId": 1}` | Hiển thị thông báo đặt hàng thành công, giỏ hàng về 0 |

### 0.7 Điểm mơ hồ (Ambiguities) & Câu hỏi mở cần xác nhận

| Mã | Vấn đề mơ hồ trong đặc tả | Phân tích & Rủi ro | Giả định tạm thời đề xuất | Trạng thái |
|---|---|---|---|---|
| **Q1** | **Ràng buộc và định dạng của Địa chỉ giao hàng:** Đặc tả `README.md` chỉ ghi "địa chỉ giao hàng", `api_specification.md` gửi trường đơn `shipping_address`. Không quy định độ dài tối đa (Max length) hay cấu trúc phân tách (Tỉnh/Thành, Quận/Huyện, Số nhà). | Nếu không giới hạn độ dài, chuỗi quá dài (buffer overflow/DoS) hoặc chuỗi rác có thể lọt vào CSDL. | **Giả định:** Coi `shipping_address` là một chuỗi văn bản tự do, bắt buộc nhập, có độ dài tối thiểu 1 ký tự và cận trên an toàn là 255 ký tự ($[1, 255]$). Khi BVA, kiểm tra cận dưới (0 ký tự, 1 ký tự, 2 ký tự) và cận trên (254, 255, 256 ký tự). | Đã xác nhận |
| **Q2** | **Ứng xử khi Client gửi `total_amount` sai lệch:** README dòng 107 ghi: *"Backend phải tự tính lại tổng tiền; không chấp nhận giá trị total_amount do client gửi lên."* Liệu Backend nên: (A) Tự động ghi đè bằng tổng tiền đúng và trả về 200/201; hay (B) Báo lỗi 400 Bad Request từ chối request giả mạo? | Cả 2 cách đều phòng chống gian lận giá. Nhưng nếu Backend ghi nhận theo giá do client gửi (ví dụ bán sản phẩm 200k với giá 1k) thì đó là lỗ hổng nghiêm trọng (Critical Bug). | **Giả định:** Oracle sẽ kiểm tra trạng thái CSDL: Trong mọi trường hợp, giá trị `total_amount` của đơn hàng được lưu trong bảng `orders` **bắt buộc phải bằng tổng tiền thực tế của giỏ hàng**, không được nhận số tiền gian lận từ client. | Đã xác nhận |
| **Q3** | **Mã phản hồi khi giỏ hàng rỗng:** README chỉ nêu giao diện giỏ hàng trống có hình minh họa, không nêu mã HTTP trả về nếu client cố tình gọi `POST /api/checkout` khi giỏ hàng rỗng ($0$ sản phẩm). | Nếu backend vẫn tạo đơn hàng 0 sản phẩm thì vi phạm tính toàn vẹn dữ liệu. | **Giả định:** Chấp nhận mã lỗi HTTP 4xx (khuyến nghị 400 Bad Request). Hệ thống không được tạo đơn hàng trong CSDL. | Đã xác nhận |
| **Q4** | **Điền sẵn địa chỉ từ hồ sơ người dùng:** Trong FR-04 (`PUT /api/users/me`), người dùng có thể cập nhật `shipping_address`. Khi vào trang Checkout, địa chỉ này có được tự động điền sẵn không? | Trải nghiệm người dùng (UX): tự điền sẵn giúp thanh toán nhanh hơn. | **Giả định:** Nếu user profile đã có địa chỉ thì UI tự điền sẵn (người dùng có thể sửa đổi trước khi bấm đặt hàng); nếu profile chưa có địa chỉ thì form yêu cầu người dùng nhập mới. | Đã xác nhận |
| **Q5** | **Phạm vi tính năng Mã giảm giá (Coupon - FR-09):** FR-09 nêu *"Tại bước Checkout, người dùng có thể nhập mã giảm giá"*. Có đưa kiểm thử Coupon vào phạm vi FR-08 không? | FR-09 là một tính năng độc lập lớn có 5 điều kiện (C1–C5) và công thức riêng. Gộp cả FR-09 vào FR-08 sẽ làm bộ test phình to và trùng lặp phạm vi giữa các Pool. | **Giả định:** Giữ FR-08 tập trung vào luồng thanh toán cốt lõi (tính tiền giỏ hàng, xác thực, địa chỉ giao hàng, xóa giỏ hàng, bảo vệ giá). Mã giảm giá chỉ kiểm tra 1 ca tích hợp danh nghĩa, phần kiểm thử chuyên sâu Coupon thuộc về FR-09. | Đã xác nhận |

> **Ghi chú §4 (thời điểm đọc mã nguồn):** ở Bước 1, AI chỉ đọc tài liệu đặc tả `README.md` và hợp đồng `api_specification.md` mục 4.3 để xác định endpoint và tên trường dữ liệu; **tuyệt đối không đọc logic xử lý mã nguồn** backend/frontend (`server.js`, `Checkout.jsx`). Toàn bộ kết quả mong đợi (Expected) được tính toán độc lập từ đặc tả nghiệp vụ. Logic mã nguồn chỉ được phép đọc ở Bước 3 sau khi có kết quả thực thi và phát hiện ca Fail.

> **Hiệu chỉnh nhỏ cho mục 0.5 & 0.6 khi thiết kế (2026-10-13):** (1) Đơn giá "100,000₫" ở 0.5 chỉ là ví dụ; khi chạy test, hai sản phẩm `SP_A`, `SP_B` được lấy từ `GET /api/products` và tổng tiền thực `T = P_A×q_A + P_B×q_B` được **tính độc lập** từ đơn giá thật. (2) Chuỗi địa chỉ danh định ở 0.5 dài **43 ký tự** (không phải ~45). (3) Route `/checkout` ở 0.6 là giả định vì `README.md` không nêu đường dẫn UI — sẽ xác nhận khi chạy (Bước 3), không dùng làm oracle.

---

## 1. Domain Testing (Phân hoạch tương đương) — FR-08: Thanh toán (Checkout)

**Thành phần kiểm thử:** API (`POST /api/checkout`; các API chỉ dùng để *quan sát trạng thái*: `POST /api/login`, `GET /api/cart`, `POST /api/cart`, `GET /api/orders/my-orders`, `GET /api/orders/:id`, `GET /api/products`) + Web UI (trang Thanh toán)
**Nguồn đặc tả:** `README.md` FR-08 (dòng 102–108), FR-06/FR-07 (86, 93–100), FR-10 (141–156), FR-21–FR-23 (240–263), SEC-02 (279), SEC-04 (281); `api_specification.md` mục 1.2, 3.1, 4.1–4.5
**Ngày thiết kế:** 2026-10-13

### Bước 1 — Xác định đầu vào và đầu ra

| Thành phần | Tên | Kiểu | Ràng buộc | Nguồn |
|---|---|---|---|---|
| Input | V1 `auth_token` | String (JWT, header `Authorization: Bearer <token>`) | Bắt buộc; phải đăng nhập mới thanh toán được | README 104; SEC-02 279; api_spec 112 |
| Input | V2 `cart_state` | Trạng thái giỏ hàng (DB) | Số dòng sản phẩm ≥ 1; mỗi dòng số lượng nguyên dương ≥ 1 | README 100, 105; FR-06 dòng 86 |
| Input | V3 `shipping_address` | String | Bắt buộc, không rỗng; độ dài [1, 255] *(giả định Q1)*; hiển thị an toàn (không render HTML) | README 222, 252, 281; api_spec 135 |
| Input | V4 `total_amount` (client gửi) | Number (nguyên) | **Tùy chọn / không được tin**: backend tự tính lại tổng tiền | README 105, 107; api_spec 134 |
| Output hợp lệ | O1 | Đơn hàng được tạo | Trạng thái `pending`; `total_amount` = Σ đơn giá × số lượng của giỏ; giỏ hàng bị xóa; phản hồi thành công (2xx) | README 105, 108, 147 |
| Output lỗi | O2, O3, O4 | Bị từ chối | Chưa đăng nhập / giỏ rỗng / địa chỉ rỗng: không tạo đơn, giỏ giữ nguyên | README 100, 104, 252 |
| Output lỗi (bảo vệ giá) | O5 | Gian lận tổng tiền | Đơn lưu **đúng tổng thực** hoặc bị từ chối; không bao giờ lưu số client gửi | README 105, 107 |

**Giải thích:** bốn biến V1–V4 đủ phủ mọi ràng buộc nêu trong FR-08. Đặc tả **không** nêu nội dung phản hồi và mã lỗi chính xác của `/api/checkout`, nên oracle chủ yếu là *trạng thái dữ liệu* quan sát qua các API đọc đã có trong `api_specification.md` (đơn hàng của tôi, giỏ hàng) — không cần đọc mã nguồn. Điểm mơ hồ còn lại: Q1–Q5 (đã xác nhận ở mục 0.7) và Q6–Q7 (phát sinh khi thiết kế, xem cuối mục này).

**Phân loại biến: Direct Input và State Input (DB/phiên):**

| Biến / điều kiện | Phân loại | Kiểu | Ràng buộc (SRS) | Giá trị hợp lệ mặc định |
|---|---|---|---|---|
| V1 `auth_token` | **State Input** (phiên đăng nhập, header) | JWT | Hợp lệ, đúng định dạng `Bearer` | token của `test@eshop.com` |
| V2 `cart_state` | **State Input** (DB `cart`) | Danh sách dòng | ≥ 1 dòng, số lượng ≥ 1 | `SP_A×1 + SP_B×1` (P1) |
| V3 `shipping_address` | Direct Input (body/UI) | String | 1–255 ký tự, không rỗng | `123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM` (43 ký tự) |
| V4 `total_amount` | Direct Input (body) | Number | tùy chọn; không được dùng làm tổng thực | `T` (đúng tổng thực của giỏ) |
| `other_user_cart` | **State Input** (DB `cart` của người dùng khác) | Danh sách dòng | Không bị ảnh hưởng khi người dùng A thanh toán (R4) | giỏ của `admin@eshop.com` có 1 sản phẩm |
| `cart_cleared_after_order` | **State Input** (DB `cart` sau khi đặt hàng) | Boolean | Sau khi thành công, giỏ phải rỗng (R2) | giỏ rỗng sau lần đặt hàng đầu |

Các lớp EC22 (giỏ người dùng khác) và EC23 (gọi lần 2 khi giỏ đã bị xóa) là lớp của **State Input**; điều kiện tiên quyết P1 và các bước tạo trạng thái trong bảng test case chính là cách đưa hệ thống về trạng thái này.

### Bước 2 — Xác định các lớp tương đương

**Quy ước:** `SP_A`, `SP_B`, `SP_C` = sản phẩm lấy từ `GET /api/products`, đơn giá thật `P_A`, `P_B`, `P_C`; `T` = tổng thực của giỏ; `REJ` = bị từ chối (lỗi 4xx, không tạo đơn, giỏ giữ nguyên); `ADDR_NOM` = `"123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"`.

| EC ID | Yêu cầu | Biến / Đầu ra | Điều kiện | Loại | Giá trị đại diện | Lý do chia |
|---|---|---|---|---|---|---|
| EC01 | FR-08 | V1 | Token JWT hợp lệ (đúng cấu trúc, đúng chữ ký, còn hạn) của `test@eshop.com` | Valid | token từ `POST /api/login` | Điều kiện AND (định dạng + chữ ký + còn hạn) |
| EC02 | FR-08; SEC-02 | V1 | Không gửi header `Authorization` | Invalid | (không có header) | Boolean: có/không có token |
| EC03 | FR-08; SEC-02 | V1 | Có header nhưng token không hợp lệ (sai cấu trúc/chữ ký) | Invalid | `Bearer token.gia.mao` | Tách khỏi EC02 vì nguyên nhân khác (có token nhưng sai) |
| EC04 | api_spec mục 4 | V1 | Token hợp lệ nhưng header sai định dạng (thiếu tiền tố `Bearer`) | Invalid | `Authorization: <token hợp lệ>` | Định dạng header được đặc tả nêu rõ (`Bearer <token>`) |
| EC05 | FR-07/FR-08 | V2 | Giỏ ≥ 1 dòng, mỗi dòng số lượng = 1 | Valid | `SP_A×1 + SP_B×1` (T = P_A+P_B) | Dải [1, ∞) về số dòng |
| EC06 | FR-08 (R1) | V2 | Giỏ có dòng với số lượng ≥ 2 | Valid | `SP_A×3` (T = 3·P_A) | Tách riêng vì công thức Σ đơn giá × số lượng phụ thuộc số lượng |
| EC07 | FR-07 dòng 100; FR-08 | V2 | Giỏ rỗng (0 dòng) | Invalid | giỏ 0 dòng | Dải dưới: số dòng < 1 |
| EC08 | FR-08 | V3 | Chuỗi văn bản 1 ≤ độ dài ≤ 255, có tiếng Việt có dấu | Valid | `ADDR_NOM` (43 ký tự) | Điều kiện AND (kiểu chuỗi + độ dài) — Q1 |
| EC09 | FR-22 252; O4 | V3 | Rỗng | Invalid | `""` | Trường bắt buộc |
| EC10 | FR-22 252 | V3 | Thiếu hẳn trường `shipping_address` trong body | Invalid | body không có khóa | Boolean: có/không có trường; tách khỏi EC09 (lỗi khác nguyên nhân) |
| EC11 | Q1 | V3 | Độ dài > 255 | Invalid | `'A'×300` | Dải → lớp trên (cận trên theo giả định Q1) |
| EC12 | FR-22 252; Q6 | V3 | Chỉ gồm khoảng trắng | Invalid | `"     "` (5 dấu cách) | Kiểu chuỗi đặc biệt: tương đương "trống" về nghiệp vụ (giả định Q6) |
| EC13 | api_spec 135 | V3 | Sai kiểu dữ liệu (không phải chuỗi) | Invalid | `12345` (số) | Boolean/kiểu |
| EC14 | SEC-04; README 222 | V3 | Chuỗi có ký tự HTML đặc biệt (hợp lệ về độ dài) | Valid (đầu vào) | `<img src=x onerror=alert(1)>` | Đầu vào hợp lệ nhưng **đầu ra** (hiển thị) phải an toàn (R5) |
| EC15 | FR-08 (R1) | V4 | `total_amount` = T (khớp tổng thực) | Valid | `T` | Giá trị đơn |
| EC16 | README 107; api_spec 134 | V4 | Không gửi trường `total_amount` | Valid | body không có khóa | V4 là tùy chọn (backend tự tính) |
| EC17 | README 105, 107 (O5) | V4 | 0 < x < T (gian lận giảm giá) | Invalid | `1` | Dải dưới T |
| EC18 | README 105, 107 (O5) | V4 | x > T | Invalid | `999999999` | Dải trên T |
| EC19 | README 107 (O5) | V4 | x = 0 | Invalid | `0` | Giá trị đặc biệt: nguy cơ đơn 0₫ |
| EC20 | README 107 (O5) | V4 | x < 0 | Invalid | `-1` | Dải âm; tách khỏi EC17 vì khác miền |
| EC21 | api_spec 134 | V4 | Sai kiểu (không phải số) | Invalid | `"abc"` | Boolean/kiểu |
| EC22 | R4 | V2×V1 | Giỏ của người dùng khác không bị xóa/ảnh hưởng; đơn của A không chứa hàng của B | Valid (liên biến/trạng thái) | giỏ của `admin@eshop.com` có `SP_C×1` | Ràng buộc chéo người dùng (R4) |
| EC23 | R2; O3 | V2 (trạng thái) | Gọi `checkout` lần 2 ngay sau khi lần 1 thành công (giỏ đã bị xóa) | Invalid (liên biến/trạng thái) | cùng body với lần 1 | Giỏ bị hủy sau khi dùng (R2) — tương tự "OTP đã dùng" ở FR-03 |
| EC24 | O1 | Output | Thành công: phản hồi 2xx và có tạo đơn mới | Output hợp lệ | đơn mới trong `my-orders` | Lớp đầu ra hợp lệ |
| EC25 | R1 | Output | `total_amount` của đơn = Σ đơn giá × số lượng | Output hợp lệ | = `T` tính độc lập | Lớp đầu ra hợp lệ (công thức) |
| EC26 | R3; FR-10 | Output | Trạng thái đơn mới = `pending` | Output hợp lệ | `pending` | Giá trị đơn |
| EC27 | R2 | Output | Giỏ rỗng sau thanh toán thành công | Output hợp lệ | `GET /api/cart` = rỗng | Lớp đầu ra hợp lệ |
| EC28 | O2, O3, O4 | Output | Từ chối (4xx), không tạo đơn, giỏ giữ nguyên | Output lỗi | `REJ` | Lớp đầu ra lỗi |
| EC29 | O5; R1 | Output | Gian lận tổng tiền: đơn lưu đúng `T` hoặc bị từ chối; không lưu số client gửi | Output lỗi (bảo vệ giá) | `OC-TOTAL` | Lớp đầu ra lỗi riêng cho bảo vệ giá |
| EC30 | README 104 | UI | Chưa đăng nhập mà truy cập trang Thanh toán → bị chặn/chuyển hướng đăng nhập | Invalid (UI) | mở trang Thanh toán khi chưa có token | Ràng buộc giao diện (O2 trên UI) |
| EC31 | README 106 | UI | Trang hiển thị đầy đủ danh sách sản phẩm đặt mua | Valid (UI) | quan sát DOM | Ràng buộc giao diện riêng |
| EC32 | README 105 | UI | Tổng tiền tự tính, không có ô để người dùng sửa trực tiếp | Valid (UI) | quan sát DOM | Ràng buộc giao diện riêng |
| EC33 | FR-22 (252) | UI | Nhãn trường địa chỉ (bắt buộc) có ký hiệu `*` | Valid (UI) | quan sát DOM | Ràng buộc giao diện riêng |
| EC34 | FR-22 (252); O4 | UI | Địa chỉ rỗng bị chặn/báo lỗi khi bấm đặt hàng, không tạo đơn | Invalid (UI) | `""` nhập trên UI | Ràng buộc giao diện (O4 trên UI) |
| EC35 | FR-22 (255) | UI | Thông báo lỗi hiển thị **phía trên** nút submit | Valid (UI) | quan sát vị trí DOM | Ràng buộc giao diện riêng |
| EC36 | FR-23 (263) | UI | Có Breadcrumb ở trang Thanh toán | Valid (UI) | quan sát DOM | Ràng buộc giao diện riêng |
| EC37 | FR-21 (247) | UI | Trang có đúng một thẻ `<h1>` | Valid (UI) | đếm `h1` | Ràng buộc giao diện riêng |
| EC38 | FR-21 (246) | UI | Số tiền dùng ký hiệu `₫` và phân cách hàng nghìn | Valid (UI) | quan sát văn bản | Ràng buộc giao diện riêng |
| EC39 | FR-21 (245) | UI | Nút xác nhận đặt hàng màu xanh dương | Valid (UI) | quan sát `background-color` | Ràng buộc giao diện riêng |
| EC40 | Q4 (giả định) | UI | Địa chỉ trong hồ sơ được điền sẵn vào ô địa chỉ | Valid (UI) | hồ sơ có địa chỉ | Giả định Q4 (đã xác nhận) |

**Giải thích:** dùng các dạng điều kiện — *dải* (số dòng giỏ, độ dài địa chỉ, tổng client so với T → lớp dưới/trên), *giá trị đơn* (V4 = T, x = 0, trạng thái `pending`), *boolean/kiểu* (có token, có trường, kiểu chuỗi/số). Dạng *tập giá trị* không áp dụng trực tiếp vì FR-08 không có biến dạng tập. V1 tách ba lớp lỗi vì ba nguyên nhân khác nhau (không có header, token sai, header sai định dạng). V4 là biến **không được tin**, nên mọi lớp lỗi của V4 (EC17–EC21) cùng dùng một oracle `OC-TOTAL` thay vì kỳ vọng một mã lỗi cụ thể. Hai ràng buộc chéo R4 (EC22) và R2 (EC23) được sinh lớp riêng. Các ràng buộc giao diện (EC30–EC40) tách thành lớp riêng, mỗi lớp có một ca UI, không gom vào ca luồng chính. **Lớp chưa thể thiết kế ca thực thi (giới hạn đã biết, không tự bịa giá trị):** *token hết hạn* (thời hạn JWT không được nêu); *giá sản phẩm thay đổi giữa lúc thêm giỏ và lúc thanh toán*, *tồn kho*, *số lượng tối đa sản phẩm trong giỏ* (FR-08 không nêu).

### Bước 3 — Chọn đại diện và tạo test case

**Điều kiện nền dùng chung**

- **P0:** `test@eshop.com` / `Test1234!` (README dòng 24); giỏ hàng rỗng; chưa có đơn hàng nào của `test@eshop.com` (số đơn ban đầu `N0` được ghi lại). Reset trước *mỗi* ca (do `hw02_test_executor` thực hiện ở bước 3, CSDL SQLite sạch riêng như FR-03).
- **P1:** P0 + đăng nhập (`POST /api/login`) lấy `token_A` + thêm `SP_A×1` và `SP_B×1` vào giỏ (`POST /api/cart`); `T = P_A + P_B`.
- **OC-OK(T, địa chỉ):** `POST /api/checkout` trả 2xx; `GET /api/orders/my-orders` có **đúng 1 đơn mới** (`N0+1`) với `status = pending`, tổng tiền = `T`, địa chỉ = đúng chuỗi đã gửi; `GET /api/cart` rỗng.
- **OC-NO:** `POST /api/checkout` trả 4xx; `GET /api/orders/my-orders` vẫn `N0` đơn (không có đơn mới); `GET /api/cart` giữ nguyên (cùng dòng, cùng số lượng).
- **OC-TOTAL:** (2xx **và** đơn mới có tổng tiền = `T` **và** giỏ rỗng) **hoặc** (4xx **và** OC-NO). Đơn lưu tổng ≠ `T` → Fail. Mã 5xx: đặc tả không nêu → ghi `requires_oracle` (xem Q7), không tự kết luận.
- **Mã HTTP lỗi:** đặc tả không nêu chính xác → `REJ` = 4xx; riêng O2 (chưa đăng nhập) theo mục 0.3 đã xác nhận là 401, O3 (giỏ rỗng) khuyến nghị 400. Mã thành công `unspecified` → `2xx` + OC-OK.
- **Oracle UI:** chỉ dựa vào mô tả của README (dòng 104–108, 245–263) và Q4; route trang Thanh toán `TBD` (xác định khi chạy).

| TC ID | Kỹ thuật | EC phủ | Thành phần | Điều kiện tiên quyết | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|---|---|
| EP-TC01 | EP (gộp valid) | EC01, EC05, EC08, EC15, EC24, EC25, EC26, EC27 | API | P1 | `Authorization: Bearer token_A`; body `{total_amount: T, shipping_address: ADDR_NOM}` | `POST /api/checkout` rồi OC-OK | OC-OK(T, ADDR_NOM) | README 104–108, 147 |
| EP-TC02 | EP (valid) | EC06, EC25 | API | P0 + giỏ `SP_A×3` | body `{total_amount: 3·P_A, shipping_address: ADDR_NOM}` | như trên | OC-OK(3·P_A, ADDR_NOM) | README 105 (Σ đơn giá × số lượng) |
| EP-TC03 | EP (cô lập) | EC02, EC28 | API | P1 | không có header `Authorization`; body hợp lệ | `POST /api/checkout` rồi OC-NO | `REJ` (401 theo O2); OC-NO | README 104; SEC-02 279 |
| EP-TC04 | EP (cô lập) | EC03, EC28 | API | P1 | `Authorization: Bearer token.gia.mao`; body hợp lệ | như trên | `REJ`; OC-NO | README 104; SEC-02 |
| EP-TC05 | EP (cô lập) | EC04, EC28 | API | P1 | `Authorization: <token_A không có "Bearer ">`; body hợp lệ | như trên | `REJ`; OC-NO | api_spec mục 4 (định dạng `Bearer <token>`) |
| EP-TC06 | EP (cô lập) | EC07, EC28 | API | P0 (giỏ rỗng) + đăng nhập `token_A` | body `{total_amount: 0, shipping_address: ADDR_NOM}` | `POST /api/checkout` rồi OC-NO | `REJ` (400 theo Q3); không có đơn mới | README 100, 105; Q3 |
| EP-TC07 | EP (cô lập) | EC09, EC28 | API | P1 | `shipping_address = ""`; `total_amount = T` | như trên | `REJ`; OC-NO | README 252; O4 |
| EP-TC08 | EP (cô lập) | EC10, EC28 | API | P1 | body `{total_amount: T}` (thiếu `shipping_address`) | như trên | `REJ`; OC-NO | README 252; O4 |
| EP-TC09 | EP (cô lập) | EC11, EC28 | API | P1 | `shipping_address = 'A'×300`; `total_amount = T` | như trên | `REJ`; OC-NO | Q1 (giả định max 255) |
| EP-TC10 | EP (cô lập) | EC12, EC28 | API | P1 | `shipping_address = "     "` (5 dấu cách); `total_amount = T` | như trên | `REJ`; OC-NO | README 252; Q6 (giả định) |
| EP-TC11 | EP (cô lập) | EC13, EC28 | API | P1 | `shipping_address = 12345` (số); `total_amount = T` | như trên | `REJ`; OC-NO | api_spec 135 (kiểu chuỗi) |
| EP-TC12 | EP (valid, bảo mật hiển thị) | EC14 | API + UI | P1 | `shipping_address = <img src=x onerror=alert(1)>`; `total_amount = T` | (1) `POST /api/checkout`; (2) mở chi tiết đơn của tôi trên UI | (1) 2xx, OC-OK(T) với địa chỉ lưu đúng nguyên văn; (2) UI hiển thị chuỗi như **văn bản**, không chèn phần tử `<img>` vào DOM, không bật hộp thoại `alert` | README 222, 281; SEC-04 |
| EP-TC13 | EP (valid) | EC16, EC24, EC25, EC26, EC27 | API | P1 | body `{shipping_address: ADDR_NOM}` (không có `total_amount`) | `POST /api/checkout` rồi OC-OK | OC-OK(T, ADDR_NOM) | README 105, 107 (backend tự tính) |
| EP-TC14 | EP (cô lập) | EC17, EC29 | API | P1 | `total_amount = 1`; địa chỉ hợp lệ | `POST /api/checkout` rồi OC-TOTAL | OC-TOTAL (không lưu tổng `1`) | README 105, 107; Q2 |
| EP-TC15 | EP (cô lập) | EC18, EC29 | API | P1 | `total_amount = 999999999`; địa chỉ hợp lệ | như trên | OC-TOTAL | README 107; Q2 |
| EP-TC16 | EP (cô lập) | EC19, EC29 | API | P1 | `total_amount = 0`; địa chỉ hợp lệ | như trên | OC-TOTAL (không có đơn 0₫) | README 107; Q2 |
| EP-TC17 | EP (cô lập) | EC20, EC29 | API | P1 | `total_amount = -1`; địa chỉ hợp lệ | như trên | OC-TOTAL | README 107; Q2 |
| EP-TC18 | EP (cô lập) | EC21, EC29 | API | P1 | `total_amount = "abc"`; địa chỉ hợp lệ | như trên | OC-TOTAL (nếu 5xx → `requires_oracle`, Q7) | api_spec 134; Q2, Q7 |
| EP-TC19 | EP (liên biến R4) | EC22 | API | P1 + đăng nhập `admin@eshop.com` (`token_B`), thêm `SP_C×1` vào giỏ của B | A: body hợp lệ như EP-TC01 | A gọi `POST /api/checkout`; sau đó `GET /api/cart` bằng `token_B`; `GET /api/orders/my-orders` bằng `token_A` | OC-OK(T) cho A; giỏ của B **vẫn còn** `SP_C×1`; đơn của A **không chứa** `SP_C`; B không có đơn mới | README 104; SEC-02 |
| EP-TC20 | EP (liên biến R2) | EC23, EC28 | API | P1 + `POST /api/checkout` lần 1 thành công (OC-OK) | cùng body như lần 1 | `POST /api/checkout` lần 2 rồi OC-NO | `REJ`; tổng số đơn vẫn `N0+1` (không có đơn thứ hai) | README 108 (giỏ bị xóa); README 100, 105 |
| EP-TC21 | EP (UI) | EC30 | UI | P0 (chưa đăng nhập, xóa token) | mở trang Thanh toán | Điều hướng thẳng tới trang Thanh toán khi chưa đăng nhập | Bị chuyển hướng trang đăng nhập hoặc có yêu cầu đăng nhập; **không** hiển thị nút đặt hàng; không tạo đơn | README 104 |
| EP-TC22 | EP (UI, gộp valid) | EC01, EC05, EC08, EC15, EC24, EC25, EC26, EC27 | UI | P1 (qua UI) | địa chỉ `ADDR_NOM` | Đăng nhập → vào giỏ hàng → sang trang Thanh toán → nhập địa chỉ → bấm đặt hàng | Thông báo/trang thành công; giỏ rỗng (badge giỏ hàng = 0); đơn mới `pending`, tổng tiền hiển thị = `T` | README 104–108, 147 |
| EP-TC23 | EP (UI) | EC31 | UI | P1 (qua UI) | giỏ `SP_A×1 + SP_B×1` | Mở trang Thanh toán, đối chiếu danh sách sản phẩm | Hiển thị đủ **2 dòng** sản phẩm đặt mua (tên, số lượng, đơn giá/thành tiền) khớp giỏ hàng | README 106 |
| EP-TC24 | EP (UI) | EC32 | UI | P1 (qua UI) | giỏ như trên | Quan sát phần "tổng tiền"; thử nhập/sửa giá trị tại phần này | Tổng tiền = `T` hiển thị tự động; **không có** ô nhập cho phép sửa trực tiếp (không có `input` hoặc chỉ `readonly/disabled`) | README 105 |
| EP-TC25 | EP (UI) | EC33 | UI | P1 (qua UI) | quan sát nhãn trường địa chỉ | Mở trang Thanh toán, đọc nhãn | Nhãn của trường địa chỉ giao hàng có ký hiệu `*` | README 252 (FR-22) |
| EP-TC26 | EP (UI, cô lập) | EC34, EC28 | UI | P1 (qua UI) | địa chỉ `""` | Để trống ô địa chỉ → bấm đặt hàng → kiểm tra | Bị chặn hoặc báo lỗi; **không** tạo đơn; giỏ giữ nguyên | README 252; O4 |
| EP-TC27 | EP (UI) | EC35 | UI | như EP-TC26 | địa chỉ `""` | Sau khi kích hoạt lỗi ở EP-TC26, so sánh vị trí thông báo lỗi với nút đặt hàng | Thông báo lỗi nằm **phía trên** nút submit (`bottom(lỗi) ≤ top(nút)`) | README 255 (FR-22) |
| EP-TC28 | EP (UI) | EC36 | UI | P1 (qua UI) | quan sát DOM | Mở trang Thanh toán, tìm Breadcrumb | Có Breadcrumb (dạng "Trang chủ › Giỏ hàng › Thanh toán" hoặc tương đương) | README 263 (FR-23) |
| EP-TC29 | EP (UI) | EC37 | UI | P1 (qua UI) | đếm thẻ | Mở trang Thanh toán, đếm `h1` | Đúng **một** thẻ `<h1>` | README 247 (FR-21) |
| EP-TC30 | EP (UI) | EC38 | UI | P1 (qua UI) | quan sát số tiền | Đọc giá / thành tiền / tổng tiền | Mọi số tiền có ký hiệu `₫` và phân cách hàng nghìn (`.` hoặc `,`) | README 246 (FR-21) |
| EP-TC31 | EP (UI) | EC39 | UI | P1 (qua UI) | quan sát nút | Đọc `background-color` của nút đặt hàng | Màu nền thuộc nhóm xanh dương (thành phần B vượt R và G) | README 245 (FR-21) |
| EP-TC32 | EP (UI) | EC40 | UI | P1 + `PUT /api/users/me` đặt `shipping_address` | địa chỉ hồ sơ `ADDR_NOM` | Mở trang Thanh toán, đọc ô địa chỉ | Ô địa chỉ được **điền sẵn** bằng đúng địa chỉ hồ sơ (giả định Q4) | Q4 |

**Giải thích:** có ba ca hợp lệ API (EP-TC01 gộp nhiều lớp hợp lệ; EP-TC02 tách riêng vì phép nhân với số lượng ≥ 2; EP-TC13 vì V4 vắng mặt) và một ca UI end-to-end (EP-TC22) vì địa chỉ và các điều hướng chỉ có trên giao diện. Mọi ca âm chỉ sai **đúng một** điều kiện (token, địa chỉ, giỏ, hoặc `total_amount`), các biến còn lại ở giá trị hợp lệ mặc định (P1, `ADDR_NOM`, `T`). EP-TC12 là ca **đầu vào hợp lệ nhưng đầu ra phải an toàn** (R5), nên có hai bước (API tạo đơn + UI hiển thị). EP-TC19 và EP-TC20 cần thao tác nhiều bước để dựng trạng thái (giỏ của người dùng khác, lần gọi thứ hai). Các ca UI (EP-TC21–EP-TC32) tách riêng từng ràng buộc giao diện để truy vết; EP-TC26 và EP-TC27 dùng cùng thao tác nền nhưng mục tiêu kiểm tra khác nhau (chặn đặt hàng vs vị trí thông báo lỗi) nên không bị coi là trùng.

### Truy vết EC → Test case (xem thêm Bước 3b bên dưới)

| EC ID | Test case phủ | EC ID | Test case phủ | EC ID | Test case phủ |
|---|---|---|---|---|---|
| EC01 | TC01, TC22 | EC15 | TC01, TC22 | EC29 | TC14–TC18 |
| EC02 | TC03 | EC16 | TC13 | EC30 | TC21 |
| EC03 | TC04 | EC17 | TC14 | EC31 | TC23 |
| EC04 | TC05 | EC18 | TC15 | EC32 | TC24 |
| EC05 | TC01, TC22 | EC19 | TC16 | EC33 | TC25 |
| EC06 | TC02 | EC20 | TC17 | EC34 | TC26 |
| EC07 | TC06 | EC21 | TC18 | EC35 | TC27 |
| EC08 | TC01, TC22 | EC22 | TC19 | EC36 | TC28 |
| EC09 | TC07 | EC23 | TC20 | EC37 | TC29 |
| EC10 | TC08 | EC24 | TC01, TC02, TC13, TC22 | EC38 | TC30 |
| EC11 | TC09 | EC25 | TC01, TC02, TC13, TC22 | EC39 | TC31 |
| EC12 | TC10 | EC26 | TC01, TC13, TC22 | EC40 | TC32 |
| EC13 | TC11 | EC27 | TC01, TC13, TC22 | | |
| EC14 | TC12 | EC28 | TC03–TC11, TC20, TC26 | | |

### Bước 3b — Bảng ca sơ bộ (mỗi EC một dòng) và phân tích rút gọn

Theo bài giảng (Slide 17 → 18): trước hết duyệt **100% EC**, mỗi EC một dòng sơ bộ; khi dòng đó kiểm tra một EC invalid thì mọi biến còn lại **bắt buộc hợp lệ** (cô lập lỗi). Sau đó gộp các dòng có cùng input và cùng kết quả.

| Dòng | EC | Biến đang kiểm tra | Giá trị | Các biến khác | Kết quả mong đợi sơ bộ | → TC sau rút gọn |
|---:|---|---|---|---|---|---|
| 1 | EC01 | V1 | token hợp lệ | V2, V3, V4 hợp lệ | Đơn tạo thành công | **TC01** (gộp) |
| 2 | EC02 | V1 | không có header | V2, V3, V4 hợp lệ | REJ | TC03 |
| 3 | EC03 | V1 | `Bearer token.gia.mao` | như trên | REJ | TC04 |
| 4 | EC04 | V1 | thiếu `Bearer` | như trên | REJ | TC05 |
| 5 | EC05 | V2 | `SP_A×1 + SP_B×1` | V1, V3, V4 hợp lệ | Đơn tạo thành công | **TC01** (gộp) |
| 6 | EC06 | V2 | `SP_A×3` | như trên | Đơn tạo, tổng `3·P_A` | TC02 |
| 7 | EC07 | V2 | giỏ rỗng | như trên | REJ | TC06 |
| 8 | EC08 | V3 | `ADDR_NOM` | V1, V2, V4 hợp lệ | Đơn tạo thành công | **TC01** (gộp) |
| 9 | EC09 | V3 | `""` | như trên | REJ | TC07 |
| 10 | EC10 | V3 | thiếu trường | như trên | REJ | TC08 |
| 11 | EC11 | V3 | `'A'×300` | như trên | REJ | TC09 |
| 12 | EC12 | V3 | 5 dấu cách | như trên | REJ | TC10 |
| 13 | EC13 | V3 | `12345` | như trên | REJ | TC11 |
| 14 | EC14 | V3 | chuỗi HTML | như trên | Đơn tạo; hiển thị an toàn | TC12 |
| 15 | EC15 | V4 | `T` | V1, V2, V3 hợp lệ | Đơn tạo thành công | **TC01** (gộp) |
| 16 | EC16 | V4 | không gửi | như trên | Đơn tạo, tổng `T` | TC13 |
| 17 | EC17 | V4 | `1` | như trên | OC-TOTAL | TC14 |
| 18 | EC18 | V4 | `999999999` | như trên | OC-TOTAL | TC15 |
| 19 | EC19 | V4 | `0` | như trên | OC-TOTAL | TC16 |
| 20 | EC20 | V4 | `-1` | như trên | OC-TOTAL | TC17 |
| 21 | EC21 | V4 | `"abc"` | như trên | OC-TOTAL | TC18 |
| 22 | EC22 | R4 | giỏ của người dùng khác | các biến của A hợp lệ | Giỏ B giữ nguyên | TC19 |
| 23 | EC23 | R2 (trạng thái) | gọi lần 2 | các biến hợp lệ | REJ | TC20 |
| 24 | EC24 | Output | 2xx + có đơn mới | — | OC-OK | TC01, TC02, TC13, TC22 (gộp) |
| 25 | EC25 | Output | tổng = Σ đơn giá × số lượng | — | = `T` | TC01, TC02, TC13, TC22 (gộp) |
| 26 | EC26 | Output | `pending` | — | `pending` | TC01, TC13, TC22 (gộp) |
| 27 | EC27 | Output | giỏ rỗng sau đặt hàng | — | giỏ rỗng | TC01, TC13, TC22 (gộp) |
| 28 | EC28 | Output | từ chối, không đơn | — | OC-NO | TC03–TC11, TC20, TC26 (gộp) |
| 29 | EC29 | Output | gian lận tổng tiền | — | OC-TOTAL | TC14–TC18 (gộp) |
| 30 | EC30 | UI | chưa đăng nhập | — | chặn/chuyển hướng | TC21 |
| 31–40 | EC31–EC40 | UI | xem bảng EC | các biến khác hợp lệ | quan sát DOM/UI | TC23–TC32 |

**Phân tích rút gọn:**
- **Gộp ca hợp lệ:** dòng 1, 5, 8, 15 (EC01, EC05, EC08, EC15) cùng input hợp lệ và cùng kết quả → gộp thành **EP-TC01** (kèm EC24–EC27); cùng bộ EC được kiểm tra ở lớp giao diện bằng **EP-TC22**.
- **Gộp output ngoại lệ:** EC28 gộp cùng EC02–EC04, EC07, EC09–EC13, EC23 và EC34 (mọi ca bị từ chối); EC29 gộp cùng EC17–EC21 (mọi ca gian lận tổng tiền).
- **Giữ nguyên ca âm độc lập:** mỗi EC invalid còn lại giữ **một** ca để bảo đảm cô lập lỗi; không gộp hai biến sai vào cùng một ca.
- **Kết quả:** 40 EC → 40 dòng sơ bộ → **32 ca EP**; không còn ca trùng input.

### Báo cáo độ phủ

- Số điều kiện đã phân tích: 4 biến (V1–V4) + 2 State Input phụ (giỏ người dùng khác, giỏ sau đặt hàng) + 5 ràng buộc nghiệp vụ (R1–R5) + 5 lớp đầu ra (O1–O5) + 11 ràng buộc giao diện (R6, README 104–106, Q4)
- Lớp EP: **17 hợp lệ (8 + 9 UI) + 17 không hợp lệ (15 + 2 UI) + 6 lớp đầu ra = 40**
- Lớp đã phủ: 40 / 40 (các EC *đã biết*; không đồng nghĩa phủ toàn bộ hành vi)
- Số test case EP: **32** (API 19, UI 13); đã loại trùng: 0
- Câu hỏi mở / mơ hồ: Q1 (max 255), Q2 (oracle `OC-TOTAL`), Q3 (mã 4xx khi giỏ rỗng), Q4 (điền sẵn địa chỉ), Q5 (Coupon thuộc FR-09); **mới phát sinh Q6, Q7** (xem dưới); route UI trang Thanh toán `TBD` (xác nhận khi chạy)

**Câu hỏi mở phát sinh khi thiết kế (đã được sinh viên xác nhận ở Human Review):**

| Mã | Mô tả | Giả định tạm | Trạng thái |
|---|---|---|---|
| **Q6** | Địa chỉ chỉ gồm khoảng trắng (`"     "`) có được coi là "để trống" không? README chỉ nói "bắt buộc" (FR-22, dòng 252), không nêu quy tắc trim. | Coi là rỗng về nghiệp vụ → từ chối (EP-TC10 kỳ vọng `REJ`). | **Đã xác nhận** |
| **Q7** | Mã phản hồi khi `total_amount` hoặc `shipping_address` sai kiểu (`"abc"`, `12345`): 400 hay có thể 2xx (backend bỏ qua)? Mã 5xx có chấp nhận được không? | Chấp nhận mọi 4xx (EP-TC11) hoặc `OC-TOTAL` (EP-TC18); 5xx ghi nhận `requires_oracle`, không tự kết luận bug. | **Đã xác nhận** |
| **Q8** | Giới hạn **tối đa** của số dòng sản phẩm trong giỏ (B01) và của độ dài địa chỉ (B02): `README.md` và `api_specification.md` không nêu. | B01: không có cận trên (miền một phía, 3 điểm UB không áp dụng). B02: cận trên 255 chỉ là **giả định kỹ thuật** (Q1); kết quả của EP-TC09, BV-TC04/05/06 được ghi nhận là **câu hỏi mở theo Q1**, không dùng làm bằng chứng chính của bug và không nằm trong danh sách ca kích hoạt BUG-008. | **Đã xác nhận** |

---

## 2. Boundary Value Analysis — FR-08: Thanh toán (Checkout)

**Chế độ BVA:** Robustness (6n + 1)
**Lý do chọn chế độ:** mặc định của skill và yêu cầu bài tập: cần cả biên hợp lệ lẫn ngoài miền. Chỉ có n = 2 biến *có thứ tự* (số dòng sản phẩm trong giỏ, độ dài địa chỉ giao hàng) và hai biến này không tương tác nên Worst-case (5² = 25) là không cần thiết.
**Ngày thiết kế:** 2026-10-13

**So sánh bốn chế độ với n = 2 (để chứng minh lựa chọn):**

| Chế độ | Công thức | Số ca lý thuyết | Lý do chọn / loại |
|---|---|---:|---|
| Standard | 4n + 1 | 9 | Loại: thiếu các điểm ngoài miền (0 sản phẩm, địa chỉ rỗng, địa chỉ 256 ký tự) — chính là điểm hay gây lỗi nhất |
| **Robustness** | **6n + 1** | **13** | **Chọn:** có cả biên hợp lệ và ngoài miền, mỗi lần chỉ đổi một biến (single-fault) |
| Worst-case | 5ⁿ | 25 | Loại: hai biến không tương tác; kết hợp chéo (số dòng giỏ × độ dài địa chỉ) không thêm hành vi mới |
| Robust Worst-case | 7ⁿ | 49 | Loại: lý do như trên, chi phí cao |

**Biến không đưa vào BVA (có lý do, không bỏ sót):**

| Biến | Lý do không có phân vùng có thứ tự |
|---|---|
| V1 (`auth_token`) | Chỉ có/không có token hợp lệ (boolean); không có thứ tự. Thời hạn token đặc tả không nêu → không có cận để kiểm thử. Đã phủ bằng EP (EC01–EC04). |
| V4 (`total_amount` client gửi) | Đặc tả **bác bỏ** giá trị này (backend không được tin) nên không tồn tại cận hợp lệ/không hợp lệ cho V4. Ký hiệu "≥ 0" ở mục 0.2 chỉ mô tả miền kiểu dữ liệu, không phải ngưỡng nghiệp vụ. Các giá trị sát biên thực tế của V4 (`0`, `-1`, `1`) đã được phủ bằng EP (EC17, EC19, EC20 → EP-TC14, TC16, TC17). Không tự bịa cận. |
| Số lượng của một dòng sản phẩm | LB = 1 do FR-06 (dòng 86), thuộc phạm vi nhập liệu ở trang chi tiết/giỏ hàng, không phải đầu vào của FR-08; UB không nêu. Đã phủ phần ảnh hưởng đến tổng tiền bằng EC06 (EP-TC02). |
| Đơn giá / tổng tiền giỏ | Đặc tả không nêu ngưỡng tổng tiền tối thiểu/tối đa để thanh toán (không có ngưỡng kiểu "miễn phí vận chuyển"). |

### Bước 1 — Xác định phân vùng có thứ tự và các cận

| B ID | Biến | Ràng buộc (trích đặc tả) | LB | UB | Loại cận LB | Loại cận UB | δ | Nominal | Nguồn |
|---|---|---|---|---|---|---|---|---|---|
| B01 | Số dòng sản phẩm trong giỏ (`cart_state`) | ≥ 1 (giỏ rỗng không thanh toán); max `unspecified` | 1 | `unspecified` | Đóng | — (không có) | 1 dòng | 2 (`SP_A×1 + SP_B×1`) | README 100, 105; Q3 |
| B02 | Độ dài `shipping_address` | không rỗng; max `unspecified` → giả định 255 (Q1) | 1 | 255 *(giả định)* | Đóng | Đóng | 1 ký tự | 43 (`ADDR_NOM`) | README 252; Q1 |

**Giải thích:** số dòng giỏ và độ dài chuỗi đều là số nguyên nên δ = 1 (dòng / ký tự). "Tối thiểu 1" là cận đóng (1 hợp lệ, 0 không). B01 chỉ có **một cận (LB)**: đặc tả không nêu số dòng tối đa nên không tự đặt UB. Địa chỉ thử dùng ký tự `A` lặp để độ dài ký tự bằng độ dài byte (tránh sai lệch UTF-8).

**Lưu ý — miền một phía (B01):** công thức bài giảng giả định hai cận. B01 chỉ có LB nên 3 điểm phía UB (`UB−δ`, `UB`, `UB+δ`) là **không áp dụng**; điểm `LB+δ = 2` trùng nominal. Sai khác với công thức được ghi rõ ở phần Tổng kết (không gọi là "13 ca tối thiểu").

**Lưu ý — nominal tổng tiền:** các ca BVA dùng giỏ nominal `SP_A×1 + SP_B×1` (T = P_A + P_B) và `total_amount = T`. Khi B01 đổi (1 dòng), `total_amount` gửi lên được điều chỉnh bằng đúng tổng thực của giỏ đó để biến V4 luôn ở lớp hợp lệ (EC15).

### Bước 2 — Chọn chế độ và điểm cần kiểm tra

| Điểm | Biến | Giá trị | Quan hệ với biên | Hợp lệ? |
|---|---|---|---|---|
| P1 | B01 | 0 dòng | LB − δ | Không |
| P2 | B01 | 1 dòng | LB | Có |
| P3 | B01 | 2 dòng | LB + δ (= nominal) | Có |
| P4–P6 | B01 | — | UB − δ / UB / UB + δ | Không áp dụng (UB `unspecified`) |
| P7 | B02 | 0 ký tự | LB − δ | Không |
| P8 | B02 | 1 ký tự | LB | Có |
| P9 | B02 | 2 ký tự | LB + δ | Có |
| P10 | B02 | 254 ký tự | UB − δ | Có |
| P11 | B02 | 255 ký tự | UB | Có |
| P12 | B02 | 256 ký tự | UB + δ | Không |
| P0 | Cả hai | 2 dòng và 43 ký tự | Nominal | Có |

**Công thức:** 6n + 1 = 6 × 2 + 1 = **13 ca (lý thuyết)**.

**Bảng 13 vector lý thuyết và đối chiếu với ca thực tế:**

| # | Biến thay đổi | Điểm biên | B01 (số dòng giỏ) | B02 (độ dài địa chỉ) | Kết quả | Ca thực tế |
|---:|---|---|---:|---:|---|---|
| 1 | — | All nominal | 2 | 43 | Hợp lệ | *Tái sử dụng EP-TC01* |
| 2 | B01 | LB−δ | 0 | 43 | Không hợp lệ | *Tái sử dụng EP-TC06* |
| 3 | B01 | LB | 1 | 43 | Hợp lệ | BV-TC01 |
| 4 | B01 | LB+δ | 2 | 43 | Hợp lệ | *Trùng #1* |
| 5 | B01 | UB−δ | — | 43 | Không áp dụng | UB `unspecified` |
| 6 | B01 | UB | — | 43 | Không áp dụng | UB `unspecified` |
| 7 | B01 | UB+δ | — | 43 | Không áp dụng | UB `unspecified` |
| 8 | B02 | LB−δ | 2 | 0 | Không hợp lệ | *Tái sử dụng EP-TC07* |
| 9 | B02 | LB | 2 | 1 | Hợp lệ | BV-TC02 |
| 10 | B02 | LB+δ | 2 | 2 | Hợp lệ | BV-TC03 |
| 11 | B02 | UB−δ | 2 | 254 | Hợp lệ | BV-TC04 |
| 12 | B02 | UB | 2 | 255 | Hợp lệ | BV-TC05 |
| 13 | B02 | UB+δ | 2 | 256 | Không hợp lệ | BV-TC06 |

13 vector lý thuyết = **6 ca BV mới** (BV-TC01…06) + **3 vector tái sử dụng EP** (#1, #2, #8 — cùng input, cùng kết quả, cùng mục tiêu; không tạo ca BV riêng để tránh trùng) + **1 vector trùng nominal** (#4) + **3 vector không áp dụng** (#5–#7).

### Bước 3 — Test case BVA

Điều kiện tiên quyết chung: **P1** (đăng nhập `token_A`; giỏ nominal `SP_A×1 + SP_B×1` trừ khi ghi khác; `N0` đơn ban đầu). Chuỗi địa chỉ: len 1 = `"A"`; len 2 = `"AB"`; len 254 = `'A'×254`; len 255 = `'A'×255`; len 256 = `'A'×256`. Lệnh: `POST /api/checkout` với `Authorization: Bearer token_A`, rồi OC-OK / OC-NO như phần EP.

| TC ID | Chế độ | Biên nhắm tới | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|
| BV-TC01 | Robustness | B01 LB (1 dòng) | giỏ `SP_A×1`; `total_amount = P_A`; `ADDR_NOM` | checkout → OC-OK | OC-OK(P_A, ADDR_NOM): 2xx; đơn mới `pending`, tổng `P_A`; giỏ rỗng | README 100, 105; Q3 |
| BV-TC02 | Robustness | B02 LB (1 ký tự) | `shipping_address = "A"`; `total_amount = T` | checkout → OC-OK | OC-OK(T, "A"): địa chỉ lưu đúng `"A"` | README 252; Q1 |
| BV-TC03 | Robustness | B02 LB+δ (2 ký tự) | `shipping_address = "AB"`; `total_amount = T` | checkout → OC-OK | OC-OK(T, "AB") | README 252; Q1 |
| BV-TC04 | Robustness | B02 UB−δ (254 ký tự) | `'A'×254`; `total_amount = T` | checkout → OC-OK | OC-OK(T, 254 ký tự); địa chỉ không bị cắt | Q1 (giả định max 255) |
| BV-TC05 | Robustness | B02 UB (255 ký tự) | `'A'×255`; `total_amount = T` | checkout → OC-OK | OC-OK(T, 255 ký tự); địa chỉ không bị cắt | Q1 |
| BV-TC06 | Robustness | B02 UB+δ (256 ký tự) | `'A'×256`; `total_amount = T` | checkout → OC-NO | `REJ`; không có đơn mới | Q1 |

**Tái sử dụng ca EP cho các vector biên trùng input (không chạy hai lần):** nominal → `EP-TC01`; B01 LB−δ (0 dòng) → `EP-TC06`; B02 LB−δ (0 ký tự) → `EP-TC07`.

**Giải thích:** expected tính độc lập theo bất đẳng thức đặc tả: `số dòng ≥ 1` và `1 ≤ độ dài địa chỉ ≤ 255` → hợp lệ (đơn tạo, tổng = `T`, giỏ xóa), ngoài đó bị từ chối. Với BV-TC04/05 kiểm tra thêm địa chỉ **không bị cắt cụt** (lỗi hay gặp khi cột dữ liệu có giới hạn độ dài). Cận trên 255 phụ thuộc giả định Q1 nên BV-TC04/05/06 **không dùng làm bằng chứng chính** nếu có Fail (ghi vào *Câu hỏi mở*, không tự gọi là bug).

### Bước 4 — Biên đầu ra

Bài giảng yêu cầu xét thêm các giá trị làm **đầu ra** đạt biên.

| Biên đầu ra | Input gây ra | Test case |
|---|---|---|
| Tổng tiền đơn tối thiểu (1 dòng × số lượng 1 → tổng = đơn giá của một sản phẩm) | giỏ `SP_A×1` | **BV-TC01** (đã phủ) |
| Tổng tiền đơn tối đa | — | Không có (đặc tả không nêu giới hạn tổng tiền/số lượng) |
| Giá trị sinh ra của hệ thống: trạng thái `pending`, mã đơn | — | Không có biên thứ tự: trạng thái là giá trị đơn (EC26), mã đơn không có ràng buộc độ dài/miền trong đặc tả |

Kết luận: sau khi đối chiếu (a) quan hệ input → output (tổng tiền = Σ đơn giá × số lượng, không có ngưỡng) và (b) đầu ra do hệ thống sinh (trạng thái, mã đơn: không có ràng buộc thứ tự/độ dài), **không bổ sung ca biên đầu ra riêng** (khác FR-03 có OB-TC01 vì OTP có ràng buộc độ dài). Biên dưới của tổng tiền đã được phủ bởi BV-TC01.

### Bước 5 — Ca bổ sung do sinh viên (sau Human Review)

Dựa trên quá trình rà soát độc lập các khía cạnh nghiệp vụ, bảo mật và tính toàn vẹn dữ liệu mà AI có thể bỏ sót trong phân tích tĩnh, sinh viên chính thức thiết kế và bổ sung **5 test case chuyên sâu (`SR-TC01` đến `SR-TC05`)**.

> **Phân loại phạm vi (theo bài giảng §12.2):** `SR-TC01` và `SR-TC03` thuộc phạm vi EP/BVA mở rộng (trạng thái dữ liệu, lớp chuỗi đặc biệt). `SR-TC02` (race condition), `SR-TC04` (SQL Injection, SEC-05) và `SR-TC05` (IDOR, SEC-02) là **ca phạm vi mở rộng** ngoài EP/BVA thuần túy: được giữ lại vì có nguồn đặc tả trực tiếp (README dòng 108, 279, 282) và có giá trị phát hiện lỗi, nhưng **không được tính vào độ phủ EC/biên** và không dùng để chứng minh độ phủ EP/BVA.


| TC ID | Câu hỏi rà soát / Lý do bổ sung | Dữ liệu vào | Các bước / Lệnh thực hiện | Kết quả mong đợi (Oracle) | Nguồn expected |
|---|---|---|---|---|---|
| **SR-TC01** | **Sản phẩm có trong giỏ nhưng đã bị admin xóa hoặc thay đổi giá trước lúc thanh toán:** Kiểm tra tính toàn vẹn dữ liệu giỏ hàng và nguyên tắc tự tính lại tổng tiền từ CSDL hiện hành (R1). | User A thêm `SP_A` vào giỏ (giá ban đầu $P_A$). Trước khi checkout, giá `SP_A` được cập nhật thành $P_{A\_new}$ (hoặc `SP_A` bị xóa khỏi DB). | 1. Đăng nhập User A, thêm `SP_A` vào giỏ hàng.<br>2. Cập nhật giá sản phẩm trong CSDL/Admin thành $P_{A\_new}$ (hoặc xóa sản phẩm).<br>3. User A gửi request `POST /api/checkout`. | - Nếu sản phẩm bị xóa: Hệ thống từ chối thanh toán (4xx) và báo sản phẩm không còn khả dụng; không tạo đơn hàng rác.<br>- Nếu sản phẩm đổi giá: Backend **tự tính lại tổng tiền theo giá mới $P_{A\_new}$** lưu vào đơn hàng; không dùng giá cũ. | README dòng 105, 107 (R1); Tính toàn vẹn CSDL |
| **SR-TC02** | **Hai lần bấm "Đặt hàng" liên tiếp rất nhanh (Double submit / Race condition):** Kiểm tra chống tạo đơn hàng trùng lặp và hủy giỏ hàng tức thì (R2). | 2 request `POST /api/checkout` đồng thời cùng `token_A`, cùng địa chỉ hợp lệ và cùng giỏ hàng hiện tại. | Gửi song song (concurrent) 2 HTTP request `POST /api/checkout` trong cùng khoảng thời gian mili-giây. | Chỉ có **đúng 1 đơn hàng duy nhất** được tạo thành công trong CSDL (`pending`, tổng tiền = `T`); request thứ hai bị từ chối (4xx) do giỏ hàng đã được làm sạch ngay sau request đầu tiên. | README dòng 108 (R2); Tính toàn vẹn giao dịch |
| **SR-TC03** | **Địa chỉ chứa ký tự Unicode/emoji hoặc xuống dòng:** Kiểm tra khả năng tương thích hiển thị tiếng Việt có dấu, emoji và định dạng văn bản nhiều dòng (`\n`). | `shipping_address = "Tầng 5, Tòa nhà Bitexco\nSố 2 Hải Triều, P. Bến Nghé, Q.1, TP.HCM 🇻🇳\n(Giao giờ hành chính)"` | 1. Đăng nhập P1.<br>2. Gọi `POST /api/checkout` với địa chỉ nhiều dòng.<br>3. Truy vấn `GET /api/orders/my-orders` và mở giao diện UI chi tiết đơn hàng. | Tạo đơn thành công (HTTP 2xx); toàn bộ chuỗi địa chỉ (gồm ký tự xuống dòng `\n`, dấu tiếng Việt và emoji) được lưu trữ nguyên vẹn trong CSDL và hiển thị an toàn trên UI mà không bị cắt cụt hay vỡ layout. | FR-08; Khả năng tương thích dữ liệu tiếng Việt & Unicode |
| **SR-TC04** | **Địa chỉ chứa dấu nháy `'` / `--` (Phòng chống SQL Injection — SEC-05):** Kiểm tra độ an toàn dữ liệu đầu vào không làm sập backend hoặc rò rỉ cơ sở dữ liệu. | `shipping_address = "123 Lê Lợi' OR '1'='1 --"` | Đăng nhập P1 → gửi `POST /api/checkout` với chuỗi payload SQL injection. | Hệ thống xử lý chuỗi an toàn dưới dạng tham số hóa (Parameterized Query) HOẶC từ chối hợp lệ (400 Bad Request); **tuyệt đối không gây lỗi cú pháp 500 Internal Server Error / rò rỉ stack trace SQLite**. | README dòng 282 (SEC-05) |
| **SR-TC05** | **Đơn hàng chỉ nhìn thấy đúng chủ sở hữu (`GET /api/orders/:id` của người khác — SEC-02 / IDOR):** Kiểm tra kiểm soát truy cập và bảo mật phân lập dữ liệu người dùng. | Đơn hàng `#order_A` do User A (`test@eshop.com`) thanh toán thành công; User B (`admin@eshop.com` hoặc tài khoản khác) dùng `token_B` để truy vấn. | 1. User A checkout thành công tạo đơn `#order_A`.<br>2. User B gọi `GET /api/orders/:order_A` bằng `token_B` hoặc truy cập trực tiếp URL trang chi tiết đơn của A trên trình duyệt. | Bị từ chối truy cập (HTTP 403 Forbidden hoặc 404 Not Found); User B tuyệt đối không thể đọc thông tin chi tiết đơn hàng, danh sách sản phẩm hay địa chỉ của User A. | README dòng 279 (SEC-02); R4 (Phân lập người dùng) |

### Tổng kết (báo cáo coverage theo mẫu bài giảng)

```text
Requirements parsed: FR-08 (README 102–108), FR-06/07 (86, 93–100), FR-10 (141–156), FR-21–FR-23 (240–263), SEC-02/SEC-04, SEC-05, api_spec 4.1–4.5
BVA mode: Robustness (6n + 1), n = 2 biến có thứ tự (B01 số dòng giỏ, B02 độ dài địa chỉ)
Theoretical BVA count: 6 × 2 + 1 = 13
Actual unique BVA tests: 6 (BV-TC01…06) + 3 vector tái sử dụng EP (EP-TC01, EP-TC06, EP-TC07)
Deduplicated test vectors: 1 trùng nominal (#4) + 3 không áp dụng do thiếu UB (#5–#7)
Unresolved ambiguity/oracle issues: cận trên địa chỉ 255 (Q1); số dòng giỏ tối đa unspecified; mã lỗi unspecified; route UI trang Thanh toán TBD; Q6, Q7 đã được sinh viên xác nhận
Student Review tests added: 5 (SR-TC01…SR-TC05)
```

- Chế độ: Robustness; n = 2
- Số ca theo công thức: **13**
- Số ca BV mới thực tế duy nhất: **6**; vector biên tái sử dụng ca EP: **3**
- Số vector đã loại: **4** (13 = 6 mới + 3 tái sử dụng + 1 trùng + 3 không áp dụng)
- Số ca bổ sung sinh viên (Human Review): **5** (`SR-TC01` đến `SR-TC05`)
- Vấn đề oracle / mơ hồ: Q1, Q6, Q7 đã được sinh viên xác nhận; BV-TC04/05/06 phụ thuộc Q1 (không dùng làm bằng chứng chính cho bug); số dòng giỏ tối đa `unspecified` nên B01 là biến một phía.
- Truy vết biên → ca: B01: LB−δ→EP-TC06, LB→BV-TC01, LB+δ→trùng nominal (EP-TC01); B02: LB−δ→EP-TC07, LB→BV-TC02, LB+δ→BV-TC03, UB−δ→BV-TC04, UB→BV-TC05, UB+δ→BV-TC06; nominal→EP-TC01.

---

## Tổng hợp số lượng test case FR-08 (đã thiết kế / đã chạy)

| Nhóm | Thiết kế | Pass | Fail | Blocked | Not run |
|---|---:|---:|---:|---:|---:|
| EP (EP-TC01…32) | 32 | 5 | 27 | 0 | 0 |
| BVA (BV-TC01…06) | 6 | 0 | 6 | 0 | 0 |
| BVA biên đầu ra | 0 | 0 | 0 | 0 | 0 |
| Ca bổ sung sinh viên (SR-TC01…05) | 5 | 0 | 5 | 0 | 0 |
| **Tổng** | **43** | **5** | **38** | **0** | **0** |

*(Ghi chú: Toàn bộ 43 ca kiểm thử đã được thực thi tự động qua 2 lần chạy độc lập `run_api_1/2` và `run_ui_1/2`, đạt độ ổn định 100% nhất quán, loại trừ hoàn toàn hiện tượng flakiness).*

---

## 3. Thực thi test — FR-08: Thanh toán (Checkout)

**Ngày chạy:** 2026-10-13  
**Công cụ tự động hóa 2 hướng:**
- **Hướng 1 (HTTP API Automation):** `reports/evidence/FR-08/run_fr08.js` (Node.js fetch runner) trên `http://localhost:3000`.
- **Hướng 2 (Playwright CLI UI Automation):** `@playwright/test` v1.64.0 (Chromium Headless) tại `tests/ui-fr08/fr08_ui.spec.js` trên `http://localhost:5173/checkout`.

**Log dữ liệu thực thi & Bằng chứng:**
- Log API thô: [reports/evidence/FR-08/run_api_1.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_api_1.json) & [run_api_1.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_api_1.md) (Lần 1); [run_api_2.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_api_2.json) & [run_api_2.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_api_2.md) (Lần 2).
- Log UI Playwright: [reports/evidence/FR-08/run_ui_1.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_ui_1.json), [run_ui_2.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_ui_2.json) & [run_ui_results.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/run_ui_results.md).
- Thư mục ảnh chụp màn hình bằng chứng: [reports/evidence/FR-08/screenshots/](file:///d:/KCPM/eshop-sut/reports/evidence/FR-08/screenshots/).

**Môi trường nền P0 / Reset:**
- Mỗi ca API được chạy trên một cơ sở dữ liệu SQLite sạch riêng biệt (`DB_PATH=backend/.hw02_fr08_run.sqlite`), backend được khởi động lại sạch sẽ trước mỗi ca kiểm thử để đảm bảo tính phân lập (Clean DB Fixture & In-memory Cart isolation).
- CSDL chính `backend/database.sqlite` tuyệt đối không bị ảnh hưởng.

### 3.1 Bảng thực thi chi tiết 43 test case

| TC ID | Mô tả ca kiểm thử | Lệnh chạy thật (bước chính) | Kết quả mong đợi (Oracle Đặc tả) | Kết quả thực tế (Lần 1) | Lần 2 | Trạng thái | Bug ID ứng viên |
|---|---|---|---|---|---|:---:|---|
| **EP-TC01** | Luồng đặt hàng danh định hợp lệ (2 SP trong giỏ, token hợp lệ, địa chỉ hợp lệ, total khớp T) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":58000000,"shipping_address":"123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"}' -SkipHttpErrorCheck` | 2xx; OC-OK(T, ADDR_NOM): Tạo đơn mới `pending`, tổng đúng T, **giỏ hàng bị xóa sạch** | HTTP 200: {"message":"Checkout successful","orderId":1} \| Số đơn hàng: 1; Đơn mới: status=pending, total=58000000; **Số món trong giỏ sau checkout: 2 (không bị xóa)** | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **EP-TC02** | Giỏ hàng có sản phẩm với số lượng $\ge 2$ (SP_A $\times 3$) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":90000000,"shipping_address":"123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"}' -SkipHttpErrorCheck` | 2xx; OC-OK($3 \times P_A$, ADDR_NOM); giỏ rỗng | HTTP 200: {"message":"Checkout successful","orderId":1} \| Đơn mới: status=pending, total=90000000; **Giỏ hàng còn 1 món (không bị xóa)** | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **EP-TC03** | Không gửi header Authorization khi gọi checkout | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Body '{"total_amount":200000,"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | REJ (401 theo O2); OC-NO | HTTP 401: {"error":"Unauthorized"} | Giống Lần 1 | **Pass** |  |
| **EP-TC04** | Header có token nhưng là token giả mạo/chữ ký sai | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer token.gia.mao" } -Body '...' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 403: {"error":"Forbidden"} | Giống Lần 1 | **Pass** |  |
| **EP-TC05** | Header Authorization thiếu tiền tố "Bearer " | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "<token>" } -Body '...' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 401: {"error":"Unauthorized"} | Giống Lần 1 | **Pass** |  |
| **EP-TC06** | Giỏ hàng rỗng ($0$ sản phẩm) mà gọi checkout | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":0,"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | REJ (400 theo Q3); OC-NO: Không tạo đơn hàng rỗng | HTTP 200: {"message":"Checkout successful","orderId":1} \| **Đơn hàng mới vẫn được tạo trong CSDL dù giỏ rỗng!** | Giống Lần 1 | **Fail** | BUG-006 (Ứng viên: Cho phép thanh toán giỏ rỗng) |
| **EP-TC07** | Địa chỉ giao hàng rỗng (`""`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":30000000,"shipping_address":""}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Checkout successful","orderId":1} \| **Chấp nhận địa chỉ rỗng và tạo đơn hàng!** | Giống Lần 1 | **Fail** | BUG-008 (Checkout thiếu/không kiểm soát địa chỉ) |
| **EP-TC08** | Body request thiếu hẳn trường `shipping_address` | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":30000000}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Checkout successful","orderId":1} \| **Chấp nhận thiếu trường địa chỉ!** | Giống Lần 1 | **Fail** | BUG-008 (Checkout thiếu/không kiểm soát địa chỉ) |
| **EP-TC09** | Địa chỉ giao hàng vượt quá 255 ký tự ($300$ ký tự 'A') | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":30000000,"shipping_address":"AAAA... (300 ký tự)"}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO (Q1) | HTTP 200: {"message":"Checkout successful","orderId":1} \| Chấp nhận chuỗi địa chỉ 300 ký tự | Giống Lần 1 | **Fail** | BUG-008 (theo giả định Q1) |
| **EP-TC10** | Địa chỉ giao hàng chỉ gồm khoảng trắng (`"     "`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":30000000,"shipping_address":"     "}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO (Q6) | HTTP 200: {"message":"Checkout successful","orderId":1} \| Chấp nhận địa chỉ toàn dấu cách | Giống Lần 1 | **Fail** | BUG-008 (Checkout thiếu/không kiểm soát địa chỉ) |
| **EP-TC11** | Địa chỉ giao hàng sai kiểu dữ liệu (số nguyên `12345`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":30000000,"shipping_address":12345}' -SkipHttpErrorCheck` | REJ (4xx); OC-NO | HTTP 200: {"message":"Checkout successful","orderId":1} \| Lưu số nguyên vào cột địa chỉ | Giống Lần 1 | **Fail** | BUG-008 (Checkout thiếu/không kiểm soát địa chỉ) |
| **EP-TC12** | Địa chỉ chứa thẻ HTML / script (XSS Injection) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":30000000,"shipping_address":"<img src=x onerror=alert(1)>"}' -SkipHttpErrorCheck` | 2xx; OC-OK(T); Lưu nguyên văn an toàn không render HTML | HTTP 200: {"message":"Checkout successful","orderId":1} \| Giỏ hàng không bị xóa (Vi phạm R2) | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **EP-TC13** | Body không gửi trường `total_amount` | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | 2xx; OC-OK(T, ADDR_NOM): **Backend tự động tính lại tổng tiền từ giỏ hàng** | HTTP 200: {"message":"Checkout successful","orderId":1} \| **Đơn hàng lưu `total_amount: null` vào CSDL!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG BẢO MẬT: Không tự tính tổng tiền) |
| **EP-TC14** | Gian lận tổng tiền: Client gửi `total_amount = 1`₫ | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":1,"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | OC-TOTAL: Backend tính lại đúng tổng thực 30,000,000₫ HOẶC từ chối; **tuyệt đối không lưu 1₫** | HTTP 200: {"message":"Checkout successful","orderId":1} \| **CSDL LƯU ĐƠN HÀNG VỚI GIÁ 1₫ THAY VÌ 30,000,000₫!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG CRITICAL: Gian lận giá thanh toán) |
| **EP-TC15** | Gian lận tổng tiền: Client gửi `total_amount = 999999999`₫ | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":999999999,"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | OC-TOTAL | HTTP 200: {"message":"Checkout successful","orderId":1} \| **CSDL lưu số tiền gian lận 999,999,999₫!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG CRITICAL: Gian lận giá thanh toán) |
| **EP-TC16** | Gian lận tổng tiền: Client gửi `total_amount = 0`₫ | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":0,"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | OC-TOTAL (Không cho phép đơn 0₫) | HTTP 200: {"message":"Checkout successful","orderId":1} \| **CSDL lưu đơn hàng với giá 0₫ (mua miễn phí)!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG CRITICAL: Gian lận giá thanh toán) |
| **EP-TC17** | Gian lận tổng tiền: Client gửi `total_amount = -1`₫ (số âm) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":-1,"shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | OC-TOTAL (Không lưu số âm) | HTTP 200: {"message":"Checkout successful","orderId":1} \| **CSDL lưu đơn hàng với giá -1₫!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG CRITICAL: Gian lận giá thanh toán) |
| **EP-TC18** | Gian lận tổng tiền: `total_amount` sai kiểu (`"abc"`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":"abc","shipping_address":"123 Lê Lợi..."}' -SkipHttpErrorCheck` | OC-TOTAL (Không lưu chuỗi "abc") | HTTP 200: {"message":"Checkout successful","orderId":1} \| CSDL lưu chuỗi "abc" vào cột tổng tiền | Giống Lần 1 | **Fail** | BUG-004 (Lỗi kiểm tra kiểu tổng tiền) |
| **EP-TC19** | Ràng buộc phân lập R4: User A checkout không làm mất giỏ của User B | `Invoke-WebRequest` checkout bằng token của A, sau đó kiểm tra giỏ của B bằng token của B | OC-OK cho A; Giỏ hàng của User B vẫn còn nguyên | HTTP 200 \| Giỏ hàng của User B vẫn còn 1 món (Bảo toàn phân lập) | Giống Lần 1 | **Pass** |  |
| **EP-TC20** | Ràng buộc R2: Gọi checkout lần 2 ngay sau khi lần 1 thành công | Gửi 2 request checkout liên tiếp với cùng token và giỏ hàng | REJ (4xx); Số đơn hàng không tăng thêm (vì giỏ lần 1 đã bị xóa) | HTTP 200 \| **Lần 2 vẫn trả về 200 OK và tạo tiếp đơn hàng thứ 2!** | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2 không xóa giỏ hàng) |
| **EP-TC21** | Chưa đăng nhập truy cập trang Checkout (`/checkout`) | Playwright điều hướng thẳng tới `/checkout` khi chưa có token | Bị chặn/chuyển hướng về `/login`; không hiển thị nút đặt hàng | Cho phép truy cập tự do, không chuyển hướng; form và nút đặt hàng vẫn hiển thị | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC22** | Luồng đặt hàng danh định hợp lệ trên UI | Playwright mở form checkout, nhập địa chỉ, bấm đặt hàng | Form có ô địa chỉ; đặt hàng thành công; chuyển hướng/thông báo | Form **hoàn toàn thiếu trường Địa chỉ giao hàng**; không thể gửi địa chỉ | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC23** | UI hiển thị đầy đủ danh sách sản phẩm đặt mua | Playwright kiểm tra DOM danh sách sản phẩm trên `/checkout` | Hiển thị đủ tên, số lượng, thành tiền của các sản phẩm khớp giỏ hàng | Hiển thị được tên sản phẩm nhưng bị lỗi tính tổng tiền | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC24** | UI tổng tiền tự tính, không có ô cho người dùng sửa trực tiếp | Playwright kiểm tra input tổng tiền trên `/checkout` | Tổng tiền chỉ hiển thị readonly; không có ô cho người dùng gõ sửa | **Tồn tại thẻ `<input type="number">` cho phép người dùng tự do sửa số tiền!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG CRITICAL: UI cho phép sửa giá) |
| **EP-TC25** | Nhãn trường Địa chỉ giao hàng bắt buộc có dấu `*` | Playwright kiểm tra label trường địa chỉ | Nhãn trường địa chỉ có ký hiệu `*` (README 252) | Form **không có trường địa chỉ giao hàng** để hiển thị dấu `*` | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC26** | Để trống ô địa chỉ trên UI bấm đặt hàng bị chặn/báo lỗi | Playwright để trống địa chỉ và bấm submit | Hệ thống chặn submit hoặc hiển thị lỗi bắt buộc nhập địa chỉ | Do thiếu trường địa chỉ, bấm submit request vẫn gửi lên backend thành công | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC27** | Vị trí thông báo lỗi hiển thị phía TRÊN nút submit | Playwright kích hoạt lỗi mã giảm giá và so sánh vị trí DOM | Thông báo lỗi nằm phía trên nút submit (`bottom(lỗi) ≤ top(nút)`) | Thông báo lỗi hiển thị phía trên nút submit (`y_lỗi < y_nút`) | Giống Lần 1 | **Pass** |  |
| **EP-TC28** | Trang Thanh toán có Breadcrumb điều hướng | Playwright tìm phần tử Breadcrumb trên DOM | Có Breadcrumb điều hướng (README 263, FR-23) | Giao diện hoàn toàn không có Breadcrumb điều hướng | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC29** | Trang Thanh toán có đúng một thẻ `<h1>` | Playwright đếm số lượng thẻ `<h1>` trên trang | Có đúng 1 thẻ `<h1>` duy nhất (README 247, FR-21) | Trang không có thẻ `<h1>` nào (chỉ dùng thẻ `<h2>` và `<h3>`) | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC30** | Số tiền có ký hiệu `₫` và phân cách hàng nghìn | Playwright kiểm tra định dạng văn bản số tiền | Mọi số tiền có ký hiệu `₫` và phân cách hàng nghìn (. hoặc ,) | Ô nhập tổng tiền hiển thị số thô không có dấu phân cách hàng nghìn | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC31** | Nút xác nhận đặt hàng có màu nền xanh dương | Playwright lấy computedStyle `background-color` của nút submit | Nút submit có màu nền xanh dương (README 245, FR-21) | Nút submit có màu xanh lá cây `rgb(22, 163, 74)` (`bg-green-600`) | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **EP-TC32** | Ô địa chỉ được tự động điền sẵn từ hồ sơ người dùng | User có địa chỉ trong profile, Playwright mở `/checkout` | Ô địa chỉ tự động điền sẵn địa chỉ hồ sơ (Giả định Q4) | Form không có ô địa chỉ để tự động điền sẵn dữ liệu profile | Giống Lần 1 | **Fail** | BUG-008 (Giao diện Checkout) |
| **BV-TC01** | BVA B01 LB: Giỏ hàng có đúng 1 dòng sản phẩm (SP_A $\times 1$) | `POST /api/checkout` với giỏ có 1 sản phẩm | 2xx; OC-OK($P_A$, ADDR_NOM); Giỏ hàng bị xóa | HTTP 200: {"message":"Checkout successful","orderId":1} \| Giỏ hàng còn 1 món (không bị xóa) | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **BV-TC02** | BVA B02 LB: Địa chỉ giao hàng có độ dài = 1 ký tự ("A") | `POST /api/checkout` với `shipping_address = "A"` | 2xx; OC-OK(T, "A"); Lưu đúng "A"; Giỏ bị xóa | HTTP 200: {"message":"Checkout successful","orderId":1} \| Giỏ hàng còn 1 món (không bị xóa) | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **BV-TC03** | BVA B02 LB+$\delta$: Địa chỉ giao hàng có độ dài = 2 ký tự ("AB") | `POST /api/checkout` với `shipping_address = "AB"` | 2xx; OC-OK(T, "AB"); Giỏ bị xóa | HTTP 200: {"message":"Checkout successful","orderId":1} \| Giỏ hàng còn 1 món (không bị xóa) | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **BV-TC04** | BVA B02 UB-$\delta$: Địa chỉ giao hàng dài 254 ký tự | `POST /api/checkout` với địa chỉ 254 ký tự 'A' | 2xx; OC-OK(T, 254 ký tự); Không bị cắt cụt | HTTP 200: {"message":"Checkout successful","orderId":1} \| Giỏ hàng còn 1 món (không bị xóa) | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **BV-TC05** | BVA B02 UB: Địa chỉ giao hàng đúng cận trên giả định = 255 ký tự | `POST /api/checkout` với địa chỉ 255 ký tự 'A' | 2xx; OC-OK(T, 255 ký tự); Giỏ bị xóa | HTTP 200: {"message":"Checkout successful","orderId":1} \| Giỏ hàng còn 1 món (không bị xóa) | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **BV-TC06** | BVA B02 UB+$\delta$: Địa chỉ giao hàng vượt cận trên = 256 ký tự | `POST /api/checkout` với địa chỉ 256 ký tự 'A' | REJ (4xx); OC-NO | HTTP 200: {"message":"Checkout successful","orderId":1} \| Không từ chối địa chỉ 256 ký tự | Giống Lần 1 | **Fail** | BUG-008 (theo giả định Q1) |
| **SR-TC01** | Sản phẩm trong giỏ bị admin đổi giá trước khi checkout | Admin cập nhật giá SP trong DB, sau đó User checkout | 2xx; Tổng tiền tính tự động theo giá mới nhất trong CSDL (R1) | HTTP 200 \| **CSDL lưu giá cũ 30,000,000₫ thay vì cập nhật theo giá mới 30,050,000₫!** | Giống Lần 1 | **Fail** | BUG-004 (LỖ HỔNG CRITICAL: Không tự tính lại tổng tiền) |
| **SR-TC02** | Chống Double Submit: Gửi 2 request checkout đồng thời | Gửi song song 2 request `POST /api/checkout` cùng lúc | Chỉ tạo đúng 1 đơn hàng duy nhất; request thứ 2 bị từ chối do giỏ đã bị xóa | Request 1: 200, Request 2: 200 \| **Hệ thống tạo ra 2 đơn hàng trùng lặp!** | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Race Condition / Không xóa giỏ) |
| **SR-TC03** | Địa chỉ chứa ký tự xuống dòng (`\n`), tiếng Việt có dấu và emoji | `POST /api/checkout` với địa chỉ multiline tiếng Việt & emoji | 2xx; Lưu trữ nguyên vẹn; Giỏ hàng bị xóa | HTTP 200 \| Lưu đúng chuỗi nhưng giỏ hàng không bị xóa | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **SR-TC04** | Địa chỉ chứa payload SQL Injection (`' OR '1'='1 --`) | `POST /api/checkout` với chuỗi injection nháy đơn | Không gây lỗi cú pháp 500 / crash SQLite; Giỏ bị xóa | HTTP 200 \| Xử lý parameterized an toàn nhưng giỏ hàng không bị xóa | Giống Lần 1 | **Fail** | BUG-005 (Ứng viên: Vi phạm R2) |
| **SR-TC05** | User B cố tình xem đơn hàng của User A (`GET /api/orders/:id`) | User A checkout tạo đơn #1, User B gọi `GET /api/orders/1` | REJ (403 Forbidden hoặc 404 Not Found); Phân lập dữ liệu (SEC-02) | HTTP 200: {"id":1,"user_id":2,"total_amount":30000000,...} \| **User B đọc được toàn bộ đơn của User A!** | Giống Lần 1 | **Fail** | BUG-007 (LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG: IDOR SEC-02) |

---

### 3.2 Tổng kết thực thi

| Chỉ số | Lần 1 (`run_api_1` & `run_ui_1`) | Lần 2 (`run_api_2` & `run_ui_2`) |
|---|---:|---:|
| **Tổng số test case đã thiết kế** | **43** | **43** |
| **Pass** | **5** (11.6%) | **5** (11.6%) |
| **Fail** | **38** (88.4%) | **38** (88.4%) |
| **Blocked** | **0** (0%) | **0** (0%) |
| **Not run** | **0** (0%) | **0** (0%) |

**Độ ổn định (Flakiness Verification):** 100% test case cho kết quả nhất quán tuyệt đối giữa Lần 1 và Lần 2:
- 5 ca **Pass** ổn định: `EP-TC03`, `EP-TC04`, `EP-TC05` (xác thực token API); `EP-TC19` (phân lập giỏ hàng khi user khác checkout); `EP-TC27` (vị trí thông báo lỗi UI phía trên nút submit).
- 38 ca **Fail** ổn định: Phát hiện chính xác các lỗi nghiệp vụ, bảo mật và giao diện người dùng trên SUT.
- 0 ca Flaky / 0 ca Blocked.

---

### 3.3 Phân tích ca Fail (giai đoạn B — được đọc mã nguồn sau khi Fail, quy định §4)

Sau khi toàn bộ các ca kiểm thử đã thực thi thực tế và ghi nhận kết quả Fail ổn định, theo đúng quy định kiểm thử hộp đen (§4), chúng tôi tiến hành rà soát mã nguồn SUT (`backend/server.js` và `frontend-web/src/pages/Checkout.jsx`) để xác định nguồn gốc lỗi:

#### 1. Lỗi Gian lận Giá & Không tự tính lại tổng tiền từ CSDL (R1)
- **Tệp:** `backend/server.js:301-313` và `frontend-web/src/pages/Checkout.jsx:14, 91-103`.
- **Đoạn mã gây lỗi trong `server.js`:**
  ```javascript
  app.post("/api/checkout", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { total_amount, shipping_address } = req.body;

    db.run(
      "INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)",
      [userId, total_amount, "pending", shipping_address],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Checkout successful", orderId: this.lastID });
      },
    );
  });
  ```
- **Nguyên nhân gốc:**
  - Backend tin tưởng mù quáng `req.body.total_amount` do client gửi lên và lưu trực tiếp vào CSDL thay vì tự tính $\sum (price_i \times quantity_i)$ từ giỏ hàng của user trong DB. Nếu client gửi 1₫, 0₫, số âm hoặc null, backend vẫn chấp nhận, tạo lỗ hổng nghiêm trọng cho phép gian lận mua hàng miễn phí hoặc giá bèo bọt.
  - Phía giao diện `Checkout.jsx:91-103` tồn tại một ô nhập liệu `<input type="number" value={editableTotal} onChange={...}>` cho phép khách hàng sửa trực tiếp tổng tiền thanh toán.

#### 2. Lỗi Không xóa giỏ hàng sau khi thanh toán thành công (R2)
- **Tệp:** `backend/server.js:301-313`.
- **Nguyên nhân gốc:** Sau khi thực hiện lệnh `INSERT INTO orders`, backend hoàn toàn không có lệnh xóa giỏ hàng của người dùng (`delete userCarts[userId]` hoặc `userCarts[userId] = []`). Dẫn đến giỏ hàng vẫn giữ nguyên, người dùng có thể checkout nhiều lần liên tiếp trên cùng giỏ hàng cũ hoặc bị trùng lặp đơn hàng khi bấm đặt hàng nhanh (Race condition).

#### 3. Lỗi Cho phép thanh toán giỏ hàng rỗng & Thiếu validate địa chỉ giao hàng
- **Tệp:** `backend/server.js:301-305`.
- **Nguyên nhân gốc:** Handler checkout hoàn toàn thiếu các bước kiểm tra hợp lệ:
  - Không kiểm tra xem giỏ hàng của user có sản phẩm hay không (`userCarts[userId]?.length > 0`).
  - Không kiểm tra `shipping_address` có bị để trống hay không (`!shipping_address?.trim()`).
  - Không kiểm tra kiểu dữ liệu chuỗi và giới hạn độ dài của `shipping_address`.

#### 4. Lỗi Kiểm soát truy cập đơn hàng (SEC-02 / IDOR Vulnerability)
- **Tệp:** `backend/server.js:348-353`.
- **Đoạn mã gây lỗi:**
  ```javascript
  app.get("/api/orders/:id", (req, res) => {
    db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, order) => {
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    });
  });
  ```
- **Nguyên nhân gốc:** Endpoint `GET /api/orders/:id` hoàn toàn **thiếu middleware xác thực `authenticateToken`** và thiếu điều kiện kiểm tra quyền sở hữu `WHERE id = ? AND user_id = ?`. Bất kỳ ai cũng có thể đọc trọn vẹn thông tin đơn hàng, danh tính và địa chỉ của người khác chỉ bằng cách thay đổi ID trên URL.

#### 5. Lỗi Giao diện Checkout thiếu trường địa chỉ và vi phạm quy chuẩn UI
- **Tệp:** `frontend-web/src/pages/Checkout.jsx` và `frontend-web/src/App.jsx:58`.
- **Nguyên nhân gốc:**
  - `Checkout.jsx` hoàn toàn không khai báo ô nhập liệu cho trường `shipping_address`, dẫn đến người dùng không thể nhập địa chỉ khi mua hàng và không thể tự điền sẵn từ hồ sơ người dùng.
  - Route `/checkout` không có ProtectedRoute chặn khách chưa đăng nhập.
  - Nút đặt hàng dùng màu xanh lá cây `bg-green-600` (vi phạm FR-21 yêu cầu màu xanh dương).
  - Thiếu Breadcrumb điều hướng (FR-23) và thiếu thẻ `<h1>` (FR-21).

---

### 3.4 Bảng dữ kiện ứng viên bug (chuẩn bị cho Bug_Report.md)

Theo quy định môn học, bảng dưới đây tổng hợp các dữ kiện kỹ thuật khách quan của các nhóm lỗi Fail ổn định trên SUT để sinh viên trực tiếp sử dụng khi tự viết báo cáo lỗi trong [reports/Bug_Report.md](file:///d:/KCPM/eshop-sut/reports/Bug_Report.md):

| Bug ID ứng viên | Tên nhóm lỗi kỹ thuật | Mức độ nghiêm trọng | Các test case kích hoạt lỗi | Tệp & Dòng mã nguồn (Root Cause) | Dữ liệu đầu vào tái hiện | Lệnh tái hiện kiểm thử (cURL / PowerShell) |
|---|---|---|---|---|---|---|
| **BUG-004** | Lỗ hổng bảo mật Gian lận tổng tiền thanh toán (Price Tampering / Broken Business Logic) | **Critical** (Nghiêm trọng cao nhất) | `EP-TC13`, `EP-TC14`, `EP-TC15`, `EP-TC16`, `EP-TC17`, `EP-TC18`, `SR-TC01`, `EP-TC24` | `backend/server.js:301-313`<br>`frontend-web/src/pages/Checkout.jsx:14, 91-103` | Giỏ hàng 30,000,000₫ nhưng client gửi `total_amount: 1` hoặc `0` | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":1,"shipping_address":"123 Lê Lợi"}' -SkipHttpErrorCheck` |
| **BUG-005** | Giỏ hàng không bị xóa sau khi thanh toán thành công (Vi phạm R2 & Race condition) | **High** (Nghiêm trọng) | `EP-TC01`, `EP-TC02`, `EP-TC12`, `EP-TC20`, `BV-TC01`–`BV-TC05`, `SR-TC02`, `SR-TC03`, `SR-TC04` | `backend/server.js:301-313` | Thực hiện checkout hợp lệ rồi kiểm tra `GET /api/cart` | Gọi `POST /api/checkout` thành công $\rightarrow$ gọi tiếp `GET /api/cart` thấy giỏ hàng vẫn còn nguyên sản phẩm |
| **BUG-006** | Hệ thống cho phép thanh toán khi giỏ hàng rỗng ($0$ sản phẩm) | **Medium** | `EP-TC06` | `backend/server.js:301-305` | Giỏ hàng không có sản phẩm nào, gửi `POST /api/checkout` | `Invoke-WebRequest -Uri "http://localhost:3000/api/checkout" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer <token>" } -Body '{"total_amount":0,"shipping_address":"123 Lê Lợi"}' -SkipHttpErrorCheck` |
| **BUG-007** | Lỗ hổng Insecure Direct Object Reference (IDOR) tại endpoint xem chi tiết đơn hàng (SEC-02) | **Critical** (Bảo mật) | `SR-TC05` | `backend/server.js:348-353` | User B gọi `GET /api/orders/:id` của User A | `Invoke-WebRequest -Uri "http://localhost:3000/api/orders/1" -Method GET -SkipHttpErrorCheck` (Không cần login vẫn đọc được đơn hàng của người khác) |
| **BUG-008** | Checkout thiếu trường địa chỉ trên UI và backend không xác thực địa chỉ; đồng thời vi phạm FR-21/FR-22/FR-23 | **High** (UI/Backend) | `EP-TC07`, `EP-TC08`, `EP-TC10`, `EP-TC11`, `EP-TC21`, `EP-TC22`, `EP-TC25`, `EP-TC26`, `EP-TC28`–`EP-TC32` *(EP-TC09 và BV-TC06 phụ thuộc giả định Q1/Q8 nên được ghi là câu hỏi mở, không tính là ca kích hoạt)* | `backend/server.js:301-305`<br>`frontend-web/src/pages/Checkout.jsx`<br>`frontend-web/src/App.jsx:58` | Gửi địa chỉ rỗng/thiếu/sai kiểu hoặc mở trang `/checkout` | Backend vẫn tạo đơn; UI không có ô địa chỉ/Breadcrumb/`h1`, nút xanh lá và không chặn khách chưa đăng nhập. |

---

## 4. AI Gap Analysis — FR-08: Thanh toán (Checkout)

### 4.1. Cách phát hiện khoảng trống

- **So sánh bộ test case ban đầu với bộ sau Human Review:** Bộ AI sinh ban đầu có 38 ca duy nhất, gồm 32 ca EP (`EP-TC01`–`EP-TC32`) và 6 ca BVA mới (`BV-TC01`–`BV-TC06`). Sau Human Review, sinh viên bổ sung 5 ca chuyên sâu (`SR-TC01`–`SR-TC05`), nâng tổng số ca FR-08 lên 43.
- **So sánh bug thực tế với phạm vi AI dự đoán:** Bộ AI ban đầu đã dự đoán tốt các rủi ro trực tiếp của `POST /api/checkout`, gồm gian lận tổng tiền, giỏ hàng không được xóa, thanh toán giỏ rỗng, dữ liệu địa chỉ và lỗi giao diện. Tuy nhiên, AI chưa mở rộng luồng sang quyền truy cập đơn hàng sau thanh toán; ca `SR-TC05` do sinh viên bổ sung mới phát hiện lỗi IDOR `BUG-007` tại `GET /api/orders/:id`.
- **Đối chiếu bài giảng và đặc tả:** Rà lại lớp đầu ra, biên ngoài miền, BVA Robustness, số âm của `total_amount`, trạng thái giỏ hàng sau thanh toán và các phụ thuộc liên phiên. Các ca `EP-TC17`, `EP-TC20`, `BV-TC06` đã phủ số âm, trạng thái dùng lại và biên ngoài miền; khoảng trống còn lại chủ yếu nằm ở thay đổi trạng thái đồng thời, dữ liệu Unicode/bảo mật và phân quyền liên endpoint.

### 4.2. Bảng khoảng trống

| STT | Test case / Bug AI bỏ sót | Cách phát hiện | Nhóm (A/B/C) | Vì sao AI bỏ sót | Bài học / Cải tiến prompt |
|---|---|---|---|---|---|
| 1 | `SR-TC01`: sản phẩm đổi giá hoặc bị xóa sau khi thêm vào giỏ nhưng trước lúc checkout | Sinh viên rà soát tính toàn vẹn dữ liệu giữa hai thời điểm và đối chiếu R1 | **C** (Độ phức tạp tính năng) | Bộ AI ban đầu đã kiểm tra client sửa `total_amount`, nhưng chưa mô hình hóa trạng thái sản phẩm thay đổi giữa thao tác thêm giỏ và thanh toán. Đây là ràng buộc liên thời điểm, phụ thuộc dữ liệu sản phẩm trong CSDL. | Yêu cầu AI lập ma trận thay đổi trạng thái giữa các bước: giá tăng, giá giảm, sản phẩm bị xóa hoặc ngừng bán trước khi checkout. |
| 2 | `SR-TC02`: hai request checkout đồng thời tạo đơn trùng lặp | Sinh viên rà soát double submit/race condition và gửi hai request song song | **C** (Độ phức tạp tính năng) | `EP-TC20` của AI chỉ gọi checkout tuần tự; cách đó phát hiện giỏ không được xóa nhưng chưa kiểm tra tính nguyên tử khi hai request cùng chạy. | Thêm yêu cầu kiểm thử đồng thời, tính nguyên tử giao dịch và idempotency cho thao tác tạo đơn hàng. |
| 3 | `SR-TC03`: địa chỉ có tiếng Việt, emoji và ký tự xuống dòng | Sinh viên rà soát khả năng tương thích Unicode và dữ liệu nhiều dòng | **A** (Chất lượng prompt) | Prompt ban đầu chỉ yêu cầu địa chỉ hợp lệ, rỗng, sai kiểu, quá dài và XSS; chưa nêu các họ ký tự Unicode hoặc chuỗi nhiều dòng cần kiểm tra. | Trong prompt, liệt kê rõ các nhóm dữ liệu văn bản: tiếng Việt tổ hợp, emoji, xuống dòng, khoảng trắng đầu/cuối và ký tự điều khiển. |
| 4 | `SR-TC04`: địa chỉ chứa dấu nháy và payload SQL Injection | Sinh viên đối chiếu SEC-05 và rà soát ký tự có ý nghĩa với câu lệnh SQL | **A** (Chất lượng prompt) | Phân tích ban đầu tập trung SEC-02 và SEC-04 nên không đưa SEC-05 vào phạm vi test case cốt lõi của FR-08. | Yêu cầu AI lập bảng truy vết toàn bộ yêu cầu bảo mật liên quan tới từng biến đầu vào, không chỉ yêu cầu được nhắc trực tiếp trong FR-08. |
| 5 | `SR-TC05` / `BUG-007`: người dùng khác hoặc khách chưa đăng nhập đọc được đơn hàng qua `GET /api/orders/:id` | Sinh viên mở rộng kiểm tra phân lập dữ liệu sau checkout và thử truy cập chéo ID đơn hàng | **C** (Độ phức tạp tính năng) | AI chỉ áp dụng R4 cho giỏ hàng và request checkout, chưa theo dõi tài sản được tạo ra là đơn hàng sang endpoint đọc chi tiết. Vì vậy AI bỏ sót quan hệ chủ sở hữu `order.user_id` và lỗi IDOR liên endpoint. | Yêu cầu AI theo dõi toàn bộ vòng đời đối tượng được tạo: tạo đơn → liệt kê → xem chi tiết → cập nhật; tại mỗi endpoint phải kiểm tra xác thực và quyền sở hữu. |

*Chú giải: **A** — chất lượng prompt · **B** — giới hạn công cụ AI · **C** — độ phức tạp của tính năng.*

### 4.3. Thống kê

- **Số ca AI sinh ban đầu:** 38 ca duy nhất (32 EP + 6 BVA mới).
- **Số ca sinh viên bổ sung sau Human Review:** 5 ca (`SR-TC01`–`SR-TC05`), tương đương 11,6% tổng bộ 43 ca.
- **Tổng số ca đã thực thi:** 43 ca; 5 Pass, 38 Fail, 0 Blocked, 0 Not run; hai lần chạy cho kết quả nhất quán 100%.
- **Số bug chính thức của FR-08:** 5 bug (`BUG-004`–`BUG-008`) theo `Bug_Report.md` và GitHub Issues #5–#9.
- **Bug AI bỏ sót được Human Review phát hiện:** 1 bug (`BUG-007` — IDOR), được phát hiện trực tiếp bởi `SR-TC05`.
- **Phân bố nguyên nhân của 5 khoảng trống:** A = 2, B = 0, C = 3.

### 4.4. Cải tiến prompt cho lần sau

1. **Yêu cầu mô hình hóa trạng thái liên thời điểm:** Không chỉ kiểm tra request độc lập mà phải xét dữ liệu thay đổi giữa lúc thêm giỏ và checkout, checkout lặp lại, double submit và giao dịch đồng thời.
2. **Yêu cầu truy vết vòng đời và quyền sở hữu đối tượng:** Với đơn hàng được tạo sau checkout, tiếp tục kiểm tra các endpoint liệt kê/xem chi tiết và thử truy cập bằng người dùng khác hoặc không có token.
3. **Lập ma trận dữ liệu văn bản và yêu cầu bảo mật:** Bao phủ Unicode, emoji, xuống dòng, dấu nháy, XSS và SQL Injection; truy vết từng ca về SEC-02, SEC-04 hoặc SEC-05.
4. **Tách rõ biên dữ liệu và biên trạng thái:** Ngoài BVA số học (`-1`, `0`, `1`, `254`, `255`, `256`), phải kiểm tra biên chuyển trạng thái như có giỏ → checkout → giỏ rỗng và sản phẩm tồn tại → thay đổi/xóa.

### 4.5. Kết luận

Bộ test ban đầu của AI bao phủ tốt các lớp tương đương, giá trị biên và ràng buộc trực tiếp tại API/UI checkout, đặc biệt đã kiểm tra số âm của `total_amount`, biên ngoài miền của địa chỉ và các lớp đầu ra thành công/từ chối. Khoảng trống xuất hiện khi tính năng được mở rộng theo thời gian và qua nhiều endpoint: giá sản phẩm thay đổi, hai request đồng thời, dữ liệu văn bản đặc biệt và quyền sở hữu đơn hàng sau khi tạo. Human Review bổ sung 5 ca đã làm rõ các rủi ro này; trong đó `SR-TC05` phát hiện trực tiếp lỗi IDOR `BUG-007` mà bộ AI ban đầu không dự đoán. Kết quả cho thấy AI phù hợp để dựng khung EP/BVA, nhưng vẫn cần sinh viên rà soát trạng thái, đồng thời và phân quyền liên endpoint.

---

# FR-14 — Quản lý Danh mục (Category CRUD)

## 0. Đặc tả kỹ thuật (SRS Extract) — Oracle

> Nguồn trích xuất: `README.md` (mục 6 dòng 186–190; mục 6 dòng 174–180; mục 6 dòng 197; mục 8 dòng 240–271; mục 9 dòng 279–282) và `api_specification.md` (mục 3.4 dòng 102–107).

### 0.1 Thông tin chung

| Mục | Nội dung |
|---|---|
| Tính năng | FR-14: Quản lý Danh mục (Category CRUD) |
| Pool | Pool C (Phân hệ Web Admin) |
| Thành phần kiểm thử | Web Admin (`http://localhost:5174`) & Backend REST API (`http://localhost:3000`) |
| Nguồn đặc tả | `README.md` (FR-14: dòng 186–190; FR-12: dòng 174–180; FR-15: dòng 197; FR-21–FR-24: dòng 240–271; SEC-02–SEC-05: dòng 279–282), `api_specification.md` (mục 3.4: dòng 102–107) |
| Ngày trích | 2026-10-15 |
| Trạng thái | Đã xác nhận bởi sinh viên |

### 0.2 Biến đầu vào (Inputs)

| ID | Tên trường / Biến | Phân loại | Kiểu dữ liệu | Bắt buộc | Miền / Cận giá trị | Bước nhỏ nhất $\delta$ | Ràng buộc nghiệp vụ (SRS) | Nguồn đặc tả |
|---|---|---|---|---|---|---|---|---|
| **V1** | `auth_token` | State Input (Header) | String (JWT) | Có (với `POST`, `PUT`, `DELETE` & Web Admin) | Token JWT hợp lệ có `role = 'admin'` | N/A | Các thao tác thêm/sửa/xóa danh mục (`/api/categories`) và truy cập Web Admin bắt buộc phải có JWT Token hợp lệ **và** `role = 'admin'` trong Token. Token của user thường (`role = 'user'`), token giả mạo hoặc không gửi token đều phải bị từ chối. | `README.md`: dòng 176–180; `SEC-02`: dòng 279; `SEC-03`: dòng 280 |
| **V2** | `name` | Direct Input (Body / UI) | String | Có (khi Thêm / Cập nhật) | Độ dài: $[1, 255]$ ký tự *(cận dưới đóng $= 1$ từ SRS; cận trên đóng $= 255$ theo giả định Q1)* | $1$ ký tự | Tên danh mục bắt buộc, không được để trống (`""`) hoặc chỉ gồm khoảng trắng *(Q2)*. Khi hiển thị trên UI phải được escape an toàn (chống XSS — SEC-04) và truy vấn CSDL phải dùng Parameterized Query (SEC-05). | `README.md`: dòng 189, 252, 281, 282; `api_spec`: dòng 104 |
| **V3** | `id` | Direct Input (Path `:id`) & State Input (DB) | Integer (Số nguyên dương) | Có (khi Xóa / Cập nhật) | Cận đóng: $[1, ID_{\max}]$ (khớp `id` danh mục đang tồn tại trong CSDL) | $1$ đơn vị | Mã định danh của danh mục cần xóa hoặc cập nhật trên đường dẫn `/api/categories/:id`. Phải là số nguyên dương $\ge 1$ và tồn tại trong bảng `categories`. | `README.md`: dòng 188; `api_spec`: dòng 105–106 |
| **V4** | `category_in_use` | State Input (DB: `products.category_id`) | Boolean (Trạng thái liên kết) | N/A (Trạng thái CSDL) | `false` (chưa có SP) / `true` (đang có $\ge 1$ SP tham chiếu) | N/A | Trạng thái danh mục có đang được sản phẩm nào tham chiếu qua `category_id` hay không khi thực hiện thao tác Xóa (`DELETE /api/categories/:id`) — xem Q5. | `README.md`: dòng 188, 197; `api_spec`: dòng 98, 106 |

### 0.3 Đầu ra mong đợi (Outputs)

| ID | Thao tác | Điều kiện kích hoạt | Kết quả mong đợi (Expected Output) | Mã HTTP / Thông báo UI / Trạng thái CSDL | Nguồn đặc tả |
|---|---|---|---|---|---|
| **O1** | Xem danh sách (`GET`) | Gọi `GET /api/categories` hoặc mở trang Quản lý Danh mục trên Web Admin | Trả về và hiển thị đầy đủ danh sách các danh mục hiện có trong CSDL (gồm `id`, `name`). Nếu danh sách trống thì hiển thị Empty State có icon/hình minh họa và thông báo thân thiện. | **HTTP 200 OK** (Mảng JSON các danh mục); UI hiển thị bảng/danh sách danh mục. | `README.md`: dòng 188, 269; `api_spec`: dòng 103 |
| **O2** | Thêm danh mục (`POST`) | Admin đã đăng nhập (`role = 'admin'`) + `name` hợp lệ (không trống, độ dài $[1, 255]$, không trùng lặp — Q3) | Tạo bản ghi danh mục mới trong CSDL; danh mục mới xuất hiện trong `GET /api/categories` và trên giao diện Web Admin; tên danh mục được hiển thị an toàn (escape HTML). | **HTTP 200 OK / 201 Created**; UI cập nhật danh sách và hiển thị thông báo thành công. | `README.md`: dòng 188–189, 281; `api_spec`: dòng 104 |
| **O3** | Xóa danh mục (`DELETE`) | Admin đã đăng nhập (`role = 'admin'`) + `:id` tồn tại trong CSDL (và thỏa điều kiện toàn vẹn tham chiếu — Q5) | Xóa đúng danh mục có `id` tương ứng khỏi CSDL; các danh mục khác giữ nguyên; danh mục đã xóa không còn xuất hiện trong `GET /api/categories`. | **HTTP 200 OK / 204 No Content**; UI xóa dòng danh mục khỏi danh sách. | `README.md`: dòng 188; `api_spec`: dòng 106 |
| **O4** | Cập nhật danh mục (`PUT`) | Admin đã đăng nhập (`role = 'admin'`) + `:id` tồn tại + `name` mới hợp lệ *(theo `api_spec` mục 3.4 — xem Q4)* | Cập nhật tên của đúng danh mục có `id` tương ứng trong CSDL; các danh mục khác không bị thay đổi. | **HTTP 200 OK** *(mã cụ thể `unspecified` — xem Q4)*. | `README.md`: dòng 177, 186; `api_spec`: dòng 105 |
| **O5** | Lỗi xác thực / phân quyền | Gọi `POST`, `PUT`, `DELETE /api/categories` (hoặc truy cập Web Admin) khi: (a) Không có Token / Token sai / sai định dạng Header; hoặc (b) Token hợp lệ nhưng của User thường (`role = 'user'`). | Từ chối yêu cầu; **tuyệt đối không thay đổi dữ liệu danh mục trong CSDL**. Trên Web Admin UI: chặn truy cập hoặc chuyển hướng về trang Đăng nhập. | Không có token / token sai: **HTTP 401 Unauthorized**.<br>Token `role != 'admin'`: **HTTP 403 Forbidden** (chấp nhận 401/403). | `README.md`: dòng 176–180; `SEC-02`: dòng 279; `SEC-03`: dòng 280 |
| **O6** | Lỗi dữ liệu `name` không hợp lệ | Admin gửi `POST` / `PUT` với `name` rỗng (`""`), chỉ chứa khoảng trắng, thiếu trường `name`, sai kiểu dữ liệu, hoặc vượt quá độ dài tối đa (Q1, Q2). | Từ chối tạo/cập nhật; trạng thái bảng `categories` trong CSDL giữ nguyên; trên UI hiển thị thông báo lỗi **trên** nút Submit. | **HTTP 400 Bad Request** (4xx); UI form validation chặn hoặc hiện lỗi trên nút Submit. | `README.md`: dòng 189, 252, 255 |
| **O7** | Lỗi `:id` không hợp lệ / không tồn tại | Admin gọi `DELETE` / `PUT /api/categories/:id` với `:id` không tồn tại trong CSDL (hoặc vừa bị xóa ở bước trước), `:id` $\le 0$, hoặc `:id` không phải số nguyên. | Từ chối thao tác hoặc báo không tìm thấy tài nguyên; các danh mục hiện có trong CSDL không bị ảnh hưởng. | **HTTP 404 Not Found / 400 Bad Request** (4xx — xem Q6). | `README.md`: dòng 188; `api_spec`: dòng 105–106 |

### 0.4 Ràng buộc liên biến và quy tắc nghiệp vụ

| ID | Tên ràng buộc | Mô tả chi tiết | Nguồn đặc tả |
|---|---|---|---|
| **R1** | **Kiểm soát truy cập dựa trên vai trò (RBAC Enforcement)** | Mọi thao tác làm thay đổi dữ liệu danh mục (`POST`, `PUT`, `DELETE /api/categories`) bắt buộc phải kiểm tra đồng thời 2 điều kiện: (1) JWT Token hợp lệ và (2) `role = 'admin'` trong Token. Chỉ kiểm tra sự tồn tại của Token mà bỏ qua kiểm tra `role = 'admin'` là vi phạm trực tiếp FR-12 và SEC-03. | `README.md`: dòng 176–180; `SEC-02`: dòng 279; `SEC-03`: dòng 280 |
| **R2** | **Ràng buộc bắt buộc của Tên danh mục (Non-empty Name)** | Trường `name` là bắt buộc và không được để trống khi thêm mới hoặc cập nhật danh mục. | `README.md`: dòng 189; `FR-22`: dòng 252 |
| **R3** | **Tính cô lập khi thao tác theo `:id` (Record Isolation)** | Khi xóa (`DELETE /api/categories/:id`) hoặc cập nhật (`PUT /api/categories/:id`) một danh mục, chỉ đúng bản ghi có `id` đó bị tác động; toàn bộ các danh mục khác trong CSDL phải giữ nguyên vẹn. | `README.md`: dòng 188; `api_spec`: dòng 105–106 |
| **R4** | **Bảo mật chống XSS & SQL Injection (Input Sanitization & Escaping)** | Tên danh mục do người dùng/Admin nhập khi hiển thị trên giao diện Web Admin và Web người dùng phải được escape đúng cách (không dùng `innerHTML` trực tiếp — SEC-04), và mọi câu lệnh CSDL phải dùng Parameterized Query (SEC-05). | `README.md`: dòng 281–282 (`SEC-04`, `SEC-05`) |
| **R5** | **Toàn vẹn tham chiếu với Sản phẩm (Foreign Key Integrity)** | Sản phẩm trong hệ thống bắt buộc gắn với một danh mục có sẵn (`category_id` — FR-15). Khi xóa một danh mục đang có sản phẩm tham chiếu, hệ thống phải đảm bảo tính toàn vẹn dữ liệu (từ chối xóa hoặc xử lý khóa ngoại an toàn — xem Q5). | `README.md`: dòng 188, 197; `api_spec`: dòng 98 |
| **R6** | **Tiêu chuẩn Giao diện Web Admin (GUI Standards)** | Trang Quản lý Danh mục trên Web Admin (`http://localhost:5174`) phải tuân thủ: ngôn ngữ 100% tiếng Việt (FR-21); đúng 1 thẻ `<h1>` mô tả trang (FR-21); nút Thêm/Submit màu xanh dương, nút Xóa màu đỏ (FR-21); nhãn trường bắt buộc có dấu `*` (FR-22); thông báo lỗi nằm **trên** nút Submit (FR-22); thanh điều hướng highlight trang đang chọn và nút đăng xuất ghi "Đăng xuất" (FR-23); có xác nhận hoặc xử lý trạng thái trống hợp lý (FR-24). | `README.md`: dòng 242–271 |

### 0.5 Giá trị danh định hợp lệ (Nominal Values)

| Biến | Giá trị danh định (Nominal) | Lý do lựa chọn |
|---|---|---|
| **V1** (`auth_token`) | Token JWT hợp lệ của tài khoản Admin `admin@eshop.com` (`Admin123!`) | Tài khoản Admin mặc định có `role = 'admin'` theo `README.md` dòng 23. |
| **V2** (`name`) | `"Thiết bị gia dụng thông minh"` | Chuỗi tiếng Việt có dấu hợp lệ, có nghĩa thực tế, độ dài 28 ký tự (nằm an toàn trong khoảng $[1, 255]$). |
| **V3** (`id`) | `ID_NEW` (ID của danh mục vừa tạo mới để test, hoặc `ID_NOM = 3` trong bộ fixture 5 danh mục `[1..5]`) | Số nguyên dương hợp lệ tồn tại trong CSDL, ưu tiên thao tác trên danh mục test vừa tạo hoặc fixture độc lập để bảo toàn dữ liệu gốc. |
| **V4** (`category_in_use`) | `false` (Danh mục mới tạo chưa gắn sản phẩm nào) | Trạng thái danh định an toàn không bị vướng ràng buộc khóa ngoại khi kiểm thử thao tác xóa cơ bản. |

### 0.6 Cách thức giao tiếp (API Contract & UI Element)

| Mục | Chi tiết Backend REST API (`http://localhost:3000`) | Chi tiết Giao diện Web Admin (`http://localhost:5174`) |
|---|---|---|
| **Đường dẫn (Endpoints / URL)** | - Xem: `GET /api/categories`<br>- Thêm: `POST /api/categories`<br>- Sửa: `PUT /api/categories/:id`<br>- Xóa: `DELETE /api/categories/:id` | Trang Quản lý Danh mục trên Web Admin (`http://localhost:5174` — route cụ thể xác định khi chạy UI, ví dụ `/categories`) |
| **Phương thức (Method)** | `GET`, `POST`, `PUT`, `DELETE` | Thao tác người dùng: Nhập ô Tên danh mục, bấm nút Thêm / Xóa |
| **Header xác thực** | `Content-Type: application/json`<br>`Authorization: Bearer <admin_token>` | Lưu JWT Admin trong LocalStorage/Session sau khi đăng nhập Web Admin |
| **Request Body mẫu** | `{"name": "Thiết bị gia dụng thông minh"}` (cho `POST` và `PUT`) | Ô input Tên danh mục (có nhãn kèm dấu `*`), nút Submit (xanh dương), nút Xóa từng dòng (đỏ) |
| **Response kỳ vọng** | - `GET`: `200 OK` kèm mảng JSON `[{"id": 1, "name": "..."}, ...]`<br>- `POST`/`PUT`/`DELETE`: `2xx` khi hợp lệ; `4xx` (`400`/`401`/`403`/`404`) khi vi phạm | Hiển thị danh sách danh mục cập nhật tức thời; hiển thị thông báo lỗi phía trên nút Submit nếu nhập sai |

### 0.7 Điểm mơ hồ (Ambiguities) & Câu hỏi mở cần xác nhận

| Mã | Vấn đề mơ hồ / Mâu thuẫn trong đặc tả | Phân tích & Rủi ro | Giả định tạm thời đề xuất | Trạng thái |
|---|---|---|---|---|
| **Q1** | **Độ dài tối đa (Max length) của Tên danh mục (`name`):** `README.md` dòng 189 chỉ quy định *"Tên danh mục là bắt buộc, không được để trống"* (cận dưới $\ge 1$ ký tự), nhưng `unspecified` đối với cận trên (trong khi FR-15 dòng 195 quy định tên sản phẩm tối đa 255 ký tự). | Nếu không có cận trên, hệ thống có thể chấp nhận chuỗi dài tùy ý (ví dụ hàng nghìn ký tự) gây vỡ giao diện hoặc tốn tài nguyên lưu trữ; đồng thời BVA cần cận trên xác định để áp dụng công thức. | **Giả định:** Áp dụng cận trên chuẩn $255$ ký tự tương đồng với quy chuẩn tên thực thể ở FR-15, tạo miền độ dài đóng $[1, 255]$ với bước $\delta = 1$ ký tự. Khi thiết kế BVA, kiểm tra đầy đủ cận dưới ($0, 1, 2$) và cận trên ($254, 255, 256$). Nếu thực thi tại $256$ ký tự hệ thống vẫn cho phép tạo, sẽ đối chiếu theo câu hỏi mở thay vì tự ý kết luận bug ngoài đặc tả. | Đã xác nhận |
| **Q2** | **Chuỗi chỉ chứa khoảng trắng (Whitespace-only) và chuẩn hóa khoảng trắng:** Đặc tả ghi *"không được để trống"*, nhưng không nêu rõ chuỗi chỉ gồm dấu cách (`"   "`) có bị coi là để trống không, và khoảng trắng thừa ở hai đầu (`"  Điện tử  "`) có được tự động `trim()` không. | Nếu không `trim()`, người dùng có thể tạo danh mục tên `"   "` (trống trên giao diện) hoặc tạo bản ghi có dấu cách thừa. | **Giả định:** Chuỗi chỉ gồm khoảng trắng (`"   "`) về mặt nghiệp vụ tương đương với để trống và **phải bị từ chối** (`400 Bad Request`, không tạo bản ghi). | Đã xác nhận |
| **Q3** | **Tính duy nhất (Uniqueness) của Tên danh mục:** `README.md` FR-14 không nêu tên danh mục có bắt buộc duy nhất (unique) hay không (khác với FR-01 nêu email duy nhất và FR-17 nêu mã coupon duy nhất). | Nếu cho phép tạo nhiều danh mục trùng hệt tên (ví dụ hai danh mục cùng tên `"Điện thoại"`), Admin và người dùng sẽ không phân biệt được khi chọn danh mục cho sản phẩm ở FR-15. | **Giả định:** Đưa ca kiểm thử trùng tên danh mục (kể cả trùng chính xác và khác hoa/thường) vào bộ test EP để kiểm tra hành vi thực tế; ghi nhận là điểm mơ hồ đặc tả (`unspecified`) để quan sát phản hồi của SUT. | Đã xác nhận |
| **Q4** | **Mâu thuẫn đặc tả về thao tác Cập nhật/Sửa (`PUT /api/categories/:id`):** Tiêu đề FR-14 ghi *"Category CRUD"*, FR-12 dòng 177 ghi rõ *"POST/PUT/DELETE /api/products, /api/categories, /api/coupons"*, và `api_specification.md` mục 3.4 dòng 105 định nghĩa endpoint `PUT /api/categories/:id`. Tuy nhiên, mô tả chi tiết FR-14 dòng 188 lại chỉ ghi *"Admin có thể Thêm / Xem / Xóa danh mục"*. | Có sự không nhất quán giữa tài liệu đặc tả nghiệp vụ (`README.md` dòng 188) và đặc tả giao tiếp (`api_specification.md` dòng 105 + `README.md` dòng 177). | **Giả định:** Kiểm thử trọng tâm vào 3 thao tác Thêm (`POST`), Xem (`GET`), Xóa (`DELETE`) trên cả API và UI; đồng thời thiết kế các ca kiểm thử EP cho `PUT /api/categories/:id` (cập nhật hợp lệ, kiểm tra quyền Admin theo FR-12, kiểm tra `name` rỗng và `:id` không tồn tại) để phủ toàn diện hợp đồng API. | Đã xác nhận |
| **Q5** | **Hành vi khi xóa danh mục đang có sản phẩm tham chiếu (`category_in_use = true`):** FR-14 cho phép Admin xóa danh mục, trong khi FR-15 quy định mỗi sản phẩm bắt buộc thuộc một danh mục có sẵn (`category_id`). Đặc tả không nêu khi xóa danh mục đang chứa sản phẩm thì hệ thống phải chặn xóa (`400`/`409`) hay xử lý thế nào. | Nếu xóa thẳng danh mục đang có sản phẩm mà không kiểm tra ràng buộc khóa ngoại, các sản phẩm đó sẽ rơi vào trạng thái mồ côi (`orphan category_id`), vi phạm FR-15. | **Giả định:** Hệ thống cần từ chối xóa danh mục đang có sản phẩm tham chiếu (`4xx`) HOẶC không được làm hỏng tính toàn vẹn dữ liệu của sản phẩm hiện có. Sẽ thiết kế ca EP riêng cho trạng thái `category_in_use = true`. | Đã xác nhận |
| **Q6** | **Mã HTTP và nội dung thông báo lỗi chi tiết:** Cả `README.md` và `api_specification.md` mục 3.4 đều không quy định mã HTTP cụ thể cho từng trường hợp lỗi (ví dụ xóa `:id` không tồn tại trả về `404` hay `200`, thiếu quyền trả về `401` hay `403`, nội dung chuỗi message lỗi là gì). | Nếu cố định cứng chuỗi thông báo lỗi khi chưa có trong SRS sẽ dẫn đến kết luận Fail sai. | **Giả định:** Dùng **trạng thái dữ liệu CSDL** (quan sát qua `GET /api/categories`) kết hợp nhóm mã phản hồi chuẩn REST (`2xx` cho thành công; `401`/`403` cho lỗi xác thực/phân quyền; `400`/`404` cho lỗi dữ liệu/không tìm thấy bản ghi — đối với xóa `:id` không tồn tại thì phải trả về `404` hoặc báo không có bản ghi nào bị xóa) làm Oracle chính. | Đã xác nhận |

> **Ghi chú §4 (thời điểm đọc mã nguồn):** ở Bước 1 và Bước 2, AI chỉ đọc tài liệu đặc tả `README.md` và hợp đồng `api_specification.md` mục 3.4 để xác định các endpoint (`GET/POST/PUT/DELETE /api/categories`) và tên trường dữ liệu; **tuyệt đối không đọc logic xử lý mã nguồn** backend/frontend (`backend/server.js`, `frontend-admin/...`). Toàn bộ kết quả mong đợi (Expected) được suy dẫn độc lập từ đặc tả nghiệp vụ. Logic mã nguồn chỉ được phép đọc ở Bước 3 sau khi có kết quả thực thi và phát hiện ca Fail.

---

## 1. Domain Testing (Phân hoạch tương đương) — FR-14: Quản lý Danh mục (Category CRUD)

**Thành phần kiểm thử:** API (`GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`; API hỗ trợ lấy token: `POST /api/login`) + Web Admin UI (`http://localhost:5174`)
**Nguồn đặc tả:** `README.md` FR-14 (dòng 186–190), FR-12 (dòng 174–180), FR-15 (dòng 197), FR-21–FR-24 (dòng 240–271), SEC-02–SEC-05 (dòng 279–282); `api_specification.md` mục 1.2, 3.4
**Ngày thiết kế:** 2026-10-15

### Bước 1 — Xác định đầu vào và đầu ra

| Thành phần | Tên | Kiểu | Ràng buộc | Nguồn |
|---|---|---|---|---|
| Input | V1 `auth_token` | String (JWT, header `Authorization: Bearer <token>`) | Bắt buộc với `POST`, `PUT`, `DELETE` và Web Admin; Token phải hợp lệ **và** có `role = 'admin'` | README 176–180; SEC-02 279; SEC-03 280 |
| Input | V2 `name` | String (Body JSON / Form UI) | Bắt buộc, không rỗng; độ dài $[1, 255]$ *(giả định Q1)*; không chỉ gồm khoảng trắng *(Q2)*; không trùng tên *(Q3)*; escape HTML an toàn *(SEC-04)* | README 189, 252, 281; api_spec 104 |
| Input | V3 `id` | Integer (Path `:id` trên URL) | Bắt buộc khi Xóa (`DELETE`) và Cập nhật (`PUT`); số nguyên dương $\ge 1$ tồn tại trong bảng `categories` | README 188; api_spec 105–106 |
| Input | V4 `category_in_use` | Trạng thái khóa ngoại (DB `products.category_id`) | Danh mục trống (`false`) được phép xóa; danh mục đang có sản phẩm tham chiếu (`true`) không được làm hỏng tính toàn vẹn sản phẩm *(Q5)* | README 188, 197; api_spec 98, 106 |
| Output hợp lệ | O1 (`GET`), O2 (`POST`), O3 (`DELETE`), O4 (`PUT`) | Mảng/Đối tượng JSON & UI | `GET`: trả danh sách đầy đủ; `POST`: tạo đúng 1 danh mục mới; `DELETE`: xóa đúng danh mục `:id`, giữ nguyên danh mục khác; `PUT`: cập nhật đúng danh mục `:id` | README 177, 186–189; api_spec 103–106 |
| Output lỗi | O5 (Phân quyền), O6 (Lỗi `name`), O7 (Lỗi `:id`/FK) | Phản hồi lỗi 4xx | Không có token / token sai (`401`), `role != 'admin'` (`403`), dữ liệu `name` hoặc `:id` không hợp lệ (`400`/`404`/`409`); trạng thái bảng `categories` giữ nguyên | README 176–180, 189, 252; SEC-02, SEC-03 |

**Giải thích:** bốn biến V1–V4 kết hợp với hai biến trạng thái phụ (`category_already_deleted`, `other_categories_state`) bao phủ đầy đủ mọi điều kiện của FR-14 và các điều khoản liên thông bắt buộc (FR-12, FR-15, FR-21–24, SEC-02–05). Vì đặc tả không nêu chuỗi message lỗi cụ thể, Oracle chính được xác định độc lập qua **trạng thái dữ liệu CSDL** (truy vấn `GET /api/categories` trước và sau mỗi thao tác) kết hợp với nhóm mã HTTP chuẩn REST (Q6).

**Phân loại biến: Direct Input và State Input (DB/phiên):**

| Biến / điều kiện | Phân loại | Kiểu | Ràng buộc (SRS) | Giá trị hợp lệ mặc định |
|---|---|---|---|---|
| V1 `auth_token` | **State Input** (phiên đăng nhập, header) | JWT (`role`) | Hợp lệ, đúng định dạng `Bearer`, `role = 'admin'` | `token_admin` (`admin@eshop.com`) |
| V2 `name` (`POST` & `PUT`) | Direct Input (body/UI) | String | $1 \le \text{len} \le 255$, không rỗng, không toàn khoảng trắng | `NAME_NOM = "Thiết bị gia dụng thông minh"` (28 ký tự) |
| V3 `id` (`DELETE` & `PUT`) | Direct Input (URL `:id`) & **State Input** (DB) | Integer | Số nguyên dương $\ge 1$, tồn tại trong bảng `categories` | `ID_EMPTY` (danh mục mới tạo / `ID_NOM = 3`) |
| V4 `category_in_use` | **State Input** (DB `products.category_id`) | Boolean | `false` khi xóa danh mục thông thường; `true` khi kiểm tra R5/Q5 | `false` (danh mục không có sản phẩm gắn vào) |
| `category_already_deleted` | **State Input** (DB sau khi gọi `DELETE` lần 1) | Boolean | Danh mục đã bị xóa không thể xóa thành công lần 2 | `false` (danh mục đang tồn tại) |
| `other_categories_state` | **State Input** (DB các bản ghi `id != :id`) | Danh sách bản ghi | Các danh mục khác không bị xóa hoặc đổi tên nhầm (R3) | Danh sách các danh mục nền (`N0` bản ghi) |

Các lớp `EC05–EC07` (token của `role = 'user'`), `EC15` (trùng tên danh mục đã có), `EC22` (`category_in_use = true`) và `EC23` (`category_already_deleted = true`) là các lớp của **State Input**; điều kiện tiên quyết trong bảng test case quy định rõ các bước tạo trạng thái tương ứng trước khi gửi request kiểm thử.

### Bước 2 — Xác định các lớp tương đương

**Quy ước:** `token_admin` = JWT hợp lệ của `admin@eshop.com` (`role = 'admin'`); `token_user` = JWT hợp lệ của `test@eshop.com` (`role = 'user'`); `NAME_NOM` = `"Thiết bị gia dụng thông minh"` (28 ký tự); `NAME_UPD` = `"Thiết bị gia dụng cao cấp"` (25 ký tự); `ID_EMPTY` = mã `id` của danh mục hợp lệ không chứa sản phẩm; `ID_IN_USE` = mã `id` của danh mục đang có sản phẩm tham chiếu (ví dụ `id = 1`); `REJ` = bị từ chối (mã HTTP 4xx, trạng thái bảng `categories` không thay đổi).

| EC ID | Yêu cầu | Biến / Đầu ra | Điều kiện | Loại | Giá trị đại diện | Lý do chia |
|---|---|---|---|---|---|---|
| EC01 | FR-12; SEC-02, SEC-03 | V1 | Token JWT hợp lệ, đúng định dạng `Bearer <token>` **và** có `role = 'admin'` | Valid | `Bearer <token_admin>` | Điều kiện AND (định dạng + chữ ký + `role = 'admin'`) |
| EC02 | FR-12; SEC-02 | V1 | Không gửi header `Authorization` khi gọi API thay đổi dữ liệu (`POST`/`DELETE`/`PUT`) | Invalid | (không có header) | Boolean: có/không có header xác thực |
| EC03 | FR-12; SEC-02 | V1 | Có header nhưng Token không hợp lệ (sai cấu trúc/chữ ký) | Invalid | `Bearer token.gia.mao` | Tách khỏi EC02 vì lỗi chữ ký JWT khác với thiếu header |
| EC04 | api_spec mục 2, 6 | V1 | Token Admin hợp lệ nhưng header sai định dạng (thiếu tiền tố `Bearer `) | Invalid | `Authorization: <token_admin>` | Định dạng header `Bearer <token>` |
| EC05 | FR-12 (177–180); SEC-03 | V1 (`POST`) | Token JWT hợp lệ nhưng `role = 'user'` (`test@eshop.com`) gọi `POST /api/categories` | Invalid | `Bearer <token_user>` | Tập giá trị role: `role ∉ {'admin'}` ở thao tác Thêm |
| EC06 | FR-12 (177–180); SEC-03 | V1 (`DELETE`) | Token JWT hợp lệ nhưng `role = 'user'` gọi `DELETE /api/categories/:id` | Invalid | `Bearer <token_user>` | Đối xứng thao tác Xóa cho SEC-03 (mỗi endpoint kiểm tra quyền riêng) |
| EC07 | FR-12 (177–180); SEC-03 | V1 (`PUT`) | Token JWT hợp lệ nhưng `role = 'user'` gọi `PUT /api/categories/:id` | Invalid | `Bearer <token_user>` | Đối xứng thao tác Cập nhật cho SEC-03 |
| EC08 | FR-14 (188–189); Q1 | V2 (`POST`) | Chuỗi văn bản $1 \le \text{độ dài} \le 255$, có tiếng Việt có dấu, chưa tồn tại | Valid | `NAME_NOM` (28 ký tự) | Điều kiện AND (kiểu chuỗi + dải độ dài + duy nhất) |
| EC09 | FR-14 (189); FR-22 | V2 (`POST`) | Chuỗi rỗng (`name = ""`) khi Thêm mới | Invalid | `""` | Trường bắt buộc (dải độ dài `< 1`) |
| EC10 | FR-14 (189); api_spec 104 | V2 (`POST`) | Thiếu hẳn khóa `name` trong JSON body (`{}`) khi Thêm mới | Invalid | `{}` | Boolean: có/không có trường `name`; tách khỏi EC09 |
| EC11 | FR-14 (189); Q2 | V2 (`POST`) | Chuỗi chỉ gồm khoảng trắng (`"     "`) khi Thêm mới | Invalid | `"     "` (5 dấu cách) | Kiểu chuỗi đặc biệt: tương đương để trống về nghiệp vụ (Q2) |
| EC12 | Q1 | V2 (`POST`) | Độ dài chuỗi $> 255$ ký tự khi Thêm mới | Invalid | `'A'×300` (300 ký tự) | Dải độ dài → lớp trên (cận trên theo giả định Q1) |
| EC13 | api_spec 104 | V2 (`POST`) | Sai kiểu dữ liệu (không phải chuỗi: số nguyên `12345`) khi Thêm mới | Invalid | `12345` | Boolean/kiểu dữ liệu |
| EC14 | FR-14 (189) | V2 (`POST`) | Giá trị `null` (`{"name": null}`) khi Thêm mới | Invalid | `null` | Giá trị đặc biệt khác chuỗi rỗng `""` |
| EC15 | Q3 | V2 (`POST`) | Tên danh mục trùng hệt với danh mục đã tồn tại trong CSDL | Invalid (liên biến/trạng thái) | `NAME_NOM` (gửi tạo lần 2) | Giá trị đơn/tập hợp: `name ∈ existing_names` (Q3) |
| EC16 | SEC-04 (281); R4 | V2 (`POST`) | Chuỗi có chứa thẻ HTML/script đặc biệt (hợp lệ về độ dài) | Valid (đầu vào) | `<img src=x onerror=alert(1)>` | Đầu vào hợp lệ nhưng đầu ra hiển thị trên UI phải được escape an toàn |
| EC17 | FR-14 (188); api_spec 106 | V3×V4 (`DELETE`) | `:id` là số nguyên dương $\ge 1$, tồn tại trong CSDL **và** `category_in_use = false` | Valid | `ID_EMPTY` | Điều kiện AND (kiểu nguyên dương + tồn tại + chưa gắn sản phẩm) |
| EC18 | FR-14 (188); Q6 | V3 (`DELETE`) | `:id` là số nguyên dương nhưng **không tồn tại** trong CSDL | Invalid | `999999` | Tập hợp trạng thái DB: `id ∉ existing_ids` |
| EC19 | api_spec 106 | V3 (`DELETE`) | `:id = 0` (ngoài miền nguyên dương) | Invalid | `0` | Dải dưới `< 1` (biên số 0) |
| EC20 | api_spec 106 | V3 (`DELETE`) | `:id < 0` (số nguyên âm) | Invalid | `-5` | Dải âm tách khỏi 0 |
| EC21 | api_spec 106 | V3 (`DELETE`) | `:id` không phải số nguyên (chuỗi ký tự trên URL path) | Invalid | `"abc"` | Boolean/kiểu dữ liệu của path parameter |
| EC22 | FR-15 (197); R5; Q5 | V4 (`DELETE`) | Xóa danh mục đang có $\ge 1$ sản phẩm tham chiếu (`category_in_use = true`) | Invalid (liên biến R5) | `ID_IN_USE` (`id = 1`) | Ràng buộc toàn vẹn tham chiếu khóa ngoại giữa sản phẩm và danh mục |
| EC23 | FR-14 (188); Q6 | V3 (trạng thái) | Gọi `DELETE /api/categories/:id` lần 2 trên cùng `:id` vừa bị xóa thành công (`category_already_deleted = true`) | Invalid (trạng thái) | `ID_EMPTY` (lần 2) | Vòng đời bản ghi: bản ghi đã bị xóa không thể xóa lại thành công |
| EC24 | FR-12 (177); api_spec 105; Q4 | V3×V2 (`PUT`) | `:id` tồn tại hợp lệ **và** `name` mới hợp lệ khi Cập nhật | Valid | `id = ID_EMPTY`, `name = NAME_UPD` | Đối xứng thao tác Cập nhật (`PUT /api/categories/:id`) theo hợp đồng API |
| EC25 | FR-14 (189); Q4 | V2 (`PUT`) | `:id` tồn tại hợp lệ nhưng `name` mới rỗng (`""`) khi Cập nhật | Invalid | `id = ID_EMPTY`, `name = ""` | Đối xứng EC09 cho biến `name` ở thao tác `PUT` |
| EC26 | FR-14 (189); Q2, Q4 | V2 (`PUT`) | `:id` tồn tại hợp lệ nhưng `name` mới chỉ gồm khoảng trắng (`"     "`) khi Cập nhật | Invalid | `id = ID_EMPTY`, `name = "     "` | Đối xứng EC11 cho biến `name` ở thao tác `PUT` |
| EC27 | api_spec 105; Q4, Q6 | V3 (`PUT`) | `:id` không tồn tại (`999999`) với `name` mới hợp lệ khi Cập nhật | Invalid | `id = 999999`, `name = NAME_UPD` | Đối xứng EC18 cho biến `:id` ở thao tác `PUT` |
| EC28 | FR-14 (188); api_spec 103 | `GET` | Truy vấn danh sách danh mục `GET /api/categories` | Valid | `GET /api/categories` | Thao tác Xem danh sách trong CRUD |
| EC29 | O1 | Output (`GET`) | Phản hồi `200 OK` kèm mảng JSON chứa đầy đủ các danh mục hiện có (`id`, `name`) | Output hợp lệ | mảng JSON khớp DB | Lớp đầu ra hợp lệ cho thao tác Xem |
| EC30 | O2 | Output (`POST`) | Phản hồi `2xx`; tổng số danh mục tăng đúng 1; bản ghi mới có `name` đúng bằng chuỗi đã gửi | Output hợp lệ | `OC-ADD-OK` | Lớp đầu ra hợp lệ cho thao tác Thêm |
| EC31 | O3; R3 | Output (`DELETE`) | Phản hồi `2xx`; tổng số danh mục giảm đúng 1; `:id` biến mất; các danh mục khác giữ nguyên | Output hợp lệ | `OC-DEL-OK` | Lớp đầu ra hợp lệ cho thao tác Xóa (kèm cô lập bản ghi R3) |
| EC32 | O4; R3 | Output (`PUT`) | Phản hồi `2xx`; bản ghi `:id` đổi sang `name` mới; các danh mục khác giữ nguyên | Output hợp lệ | `OC-PUT-OK` | Lớp đầu ra hợp lệ cho thao tác Cập nhật |
| EC33 | O5; R1 | Output (Auth) | Từ chối yêu cầu không đủ quyền (`401`/`403`); trạng thái bảng `categories` không thay đổi | Output lỗi | `REJ-AUTH` + `OC-NO` | Lớp đầu ra lỗi xác thực và phân quyền RBAC |
| EC34 | O6, O7 | Output (Data) | Từ chối dữ liệu/trạng thái không hợp lệ (`4xx`); trạng thái bảng `categories` không thay đổi | Output lỗi | `REJ-DATA` + `OC-NO` | Lớp đầu ra lỗi dữ liệu đầu vào và ràng buộc |
| EC35 | FR-12 (176); SEC-03 | UI (Auth) | Chưa đăng nhập hoặc đăng nhập bằng tài khoản `role = 'user'` truy cập Web Admin (`http://localhost:5174`) → bị chặn/yêu cầu đăng nhập Admin | Invalid (UI) | mở Web Admin khi chưa có `token_admin` | Ràng buộc kiểm soát truy cập trên giao diện Web Admin |
| EC36 | FR-14 (188) | UI (CRUD) | Giao diện Quản lý Danh mục hiển thị danh sách và thực hiện Thêm / Xóa danh mục thành công | Valid (UI) | thao tác Thêm & Xóa trên UI | Ràng buộc chức năng cốt lõi của FR-14 trên Web Admin |
| EC37 | FR-22 (252) | UI (Form) | Nhãn của trường Tên danh mục (bắt buộc) có ký hiệu dấu `*` bên cạnh | Valid (UI) | quan sát nhãn DOM | Ràng buộc giao diện riêng (FR-22) |
| EC38 | FR-14 (189); FR-22 | UI (Form) | Để trống ô Tên danh mục trên UI rồi bấm Thêm → bị chặn hoặc báo lỗi, không tạo danh mục rỗng | Invalid (UI) | nhập `""` trên UI | Ràng buộc kiểm tra dữ liệu rỗng trên giao diện |
| EC39 | FR-22 (255) | UI (Form) | Thông báo lỗi khi nhập không hợp lệ phải xuất hiện **phía trên** nút Submit, không phải bên dưới | Valid (UI) | so sánh tọa độ `bottom(lỗi) ≤ top(nút)` | Ràng buộc vị trí thông báo lỗi (FR-22) |
| EC40 | FR-21 (245) | UI (Màu sắc) | Nút hành động tích cực (Thêm/Submit) dùng màu xanh dương; nút nguy hiểm (Xóa) dùng màu đỏ | Valid (UI) | kiểm tra `background-color` / class CSS | Ràng buộc nhất quán màu sắc (FR-21) |
| EC41 | FR-21 (244, 247) | UI (Tiêu chuẩn) | Trang có đúng **một** thẻ `<h1>` mô tả nội dung trang và toàn bộ giao diện dùng tiếng Việt nhất quán | Valid (UI) | đếm thẻ `h1` & kiểm tra văn bản | Ràng buộc tiêu đề và ngôn ngữ (FR-21) |
| EC42 | FR-23 (260, 262) | UI (Điều hướng) | Thanh điều hướng highlight trang đang chọn và nút đăng xuất có nhãn chính xác là `"Đăng xuất"` (không phải `"Thoát"`) | Valid (UI) | quan sát Navbar/Sidebar | Ràng buộc điều hướng (FR-23) |

**Giải thích:**
- Đã áp dụng đầy đủ **bốn dạng điều kiện** của bài giảng: *dải giá trị* (độ dài `name` $\in [1, 255]$ $\rightarrow$ lớp dưới `EC09` và lớp trên `EC12`; mã `:id` $\ge 1$ $\rightarrow$ lớp `0` `EC19` và lớp âm `EC20`), *giá trị đơn / tập hợp* (`role = 'admin'` vs `role = 'user'` ở `EC01`, `EC05–EC07`; tên trùng `EC15`; `:id` tồn tại vs không tồn tại `EC17`, `EC18`, `EC27`), *boolean / kiểu dữ liệu* (có/không có header `EC02`, có/không có trường `EC10`, kiểu số `EC13`, `null` `EC14`, chuỗi `"abc"` cho `:id` `EC21`).
- **Đối xứng biến lặp lại:** Biến `V1 (auth_token)` với `role = 'user'` được kiểm tra đối xứng trên cả 3 thao tác ghi (`POST` → `EC05`, `DELETE` → `EC06`, `PUT` → `EC07`); biến `V2 (name)` và `V3 (:id)` được phân hoạch đối xứng cho cả `POST`/`DELETE` và `PUT` (`EC24–EC27`).
- **Tách riêng ràng buộc giao diện:** Toàn bộ các yêu cầu giao diện Web Admin (`EC35–EC42`) được tách thành lớp riêng thay vì gộp chung vào một ca duy nhất để truy vết chính xác từng tiêu chuẩn `FR-12`, `FR-21`, `FR-22`, `FR-23`.
- **Giới hạn đã biết (không tự bịa giá trị):** *Token JWT hết hạn* (`SEC-02`) — đặc tả không nêu thời gian sống của JWT nên không thiết kế ca chờ hết hạn; được ghi nhận là giới hạn đặc tả.

### Bước 3 — Chọn đại diện và tạo test case

**Điều kiện nền và Oracle dùng chung:**

- **P0 (Fixture mặc định):** CSDL SQLite được khôi phục về trạng thái chuẩn trước mỗi ca kiểm thử; tài khoản Admin `admin@eshop.com` / `Admin123!` và User `test@eshop.com` / `Test1234!`. Ghi nhận danh sách danh mục ban đầu `L0` (số lượng `N0`) từ `GET /api/categories`, trong đó `id = 1` là danh mục có sẵn đang gắn sản phẩm (`ID_IN_USE = 1`).
- **P1:** P0 + đăng nhập Admin (`POST /api/login`) lấy `token_admin` + đăng nhập User (`POST /api/login`) lấy `token_user`.
- **P2:** P1 + Admin gọi `POST /api/categories` tạo một danh mục tạm chưa gắn sản phẩm (`name = "Danh mục tạm test"`), ghi nhận mã `ID_EMPTY` (và danh sách lúc này có `N1 = N0 + 1` bản ghi).
- **OC-ADD-OK(name):** Phản hồi HTTP `2xx`; gọi `GET /api/categories` thấy tổng số bản ghi là `N0 + 1`, có **đúng 1 bản ghi mới** với trường `name` khớp chính xác chuỗi đã gửi; toàn bộ `N0` bản ghi cũ giữ nguyên.
- **OC-DEL-OK(id):** Phản hồi HTTP `2xx`; gọi `GET /api/categories` thấy tổng số bản ghi giảm đúng 1, không còn bản ghi nào có `id` đã xóa; toàn bộ các bản ghi còn lại giữ nguyên (`R3`).
- **OC-PUT-OK(id, name_new):** Phản hồi HTTP `2xx`; gọi `GET /api/categories` thấy tổng số bản ghi không đổi, bản ghi có `id` đã đổi trường `name` thành `name_new`; các bản ghi khác giữ nguyên (`R3`).
- **OC-NO:** Gọi `GET /api/categories` thấy danh sách bản ghi (`id`, `name`) **giữ nguyên 100%** so với trước khi gửi request lỗi (không thêm bản ghi rác, không mất bản ghi cũ, không bị sửa tên).
- **REJ-AUTH:** Phản hồi HTTP `401 Unauthorized` (khi thiếu/sai token) hoặc `403 Forbidden` (khi `role = 'user'`, chấp nhận `401`/`403`) kèm `OC-NO`.
- **REJ-DATA:** Phản hồi HTTP `4xx` (`400`/`404`/`409`) kèm `OC-NO`.

| TC ID | Kỹ thuật | EC phủ | Thành phần | Điều kiện tiên quyết | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|---|---|
| EP-TC01 | EP (valid `GET`) | EC28, EC29 | API | P0 | (không cần body) | `GET /api/categories` | `200 OK`; trả về mảng JSON `L0` gồm các đối tượng có đủ `id` (nguyên dương) và `name` (chuỗi không rỗng) | README 188; api_spec 103 |
| EP-TC02 | EP (gộp valid `POST`) | EC01, EC08, EC30 | API | P1 | Header `Bearer <token_admin>`; Body `{"name": NAME_NOM}` | `POST /api/categories` rồi kiểm tra `GET /api/categories` | `OC-ADD-OK(NAME_NOM)` | README 177, 188–189; api_spec 104 |
| EP-TC03 | EP (gộp valid `DELETE`) | EC01, EC17, EC31 | API | P2 (đã có `ID_EMPTY`, `category_in_use = false`) | Header `Bearer <token_admin>`; Path `:id = ID_EMPTY` | `DELETE /api/categories/:ID_EMPTY` rồi kiểm tra `GET /api/categories` | `OC-DEL-OK(ID_EMPTY)` | README 177, 188; api_spec 106 |
| EP-TC04 | EP (gộp valid `PUT`) | EC01, EC24, EC32 | API | P2 (đã có `ID_EMPTY`) | Header `Bearer <token_admin>`; Path `:id = ID_EMPTY`; Body `{"name": NAME_UPD}` | `PUT /api/categories/:ID_EMPTY` rồi kiểm tra `GET /api/categories` | `OC-PUT-OK(ID_EMPTY, NAME_UPD)` | README 177, 186; api_spec 105; Q4 |
| EP-TC05 | EP (cô lập) | EC02, EC33 | API | P1 | Không gửi header `Authorization`; Body `{"name": NAME_NOM}` | `POST /api/categories` rồi kiểm tra `OC-NO` | `REJ-AUTH` (`401`); `OC-NO` | README 177–178; SEC-02 (279) |
| EP-TC06 | EP (cô lập) | EC03, EC33 | API | P1 | Header `Authorization: Bearer token.gia.mao`; Body `{"name": NAME_NOM}` | như trên | `REJ-AUTH` (`401`/`403`); `OC-NO` | README 177–178; SEC-02 (279) |
| EP-TC07 | EP (cô lập) | EC04, EC33 | API | P1 | Header `Authorization: <token_admin>` (thiếu `Bearer `); Body `{"name": NAME_NOM}` | như trên | `REJ-AUTH` (`401`); `OC-NO` | api_spec mục 2, 6 |
| EP-TC08 | EP (cô lập RBAC `POST`) | EC05, EC33 | API | P1 | Header `Authorization: Bearer <token_user>` (`role = 'user'`); Body `{"name": NAME_NOM}` | `POST /api/categories` rồi kiểm tra `OC-NO` | `REJ-AUTH` (`403`); `OC-NO` | README 176–180; SEC-03 (280) |
| EP-TC09 | EP (cô lập RBAC `DELETE`) | EC06, EC33 | API | P2 | Header `Authorization: Bearer <token_user>` (`role = 'user'`); Path `:id = ID_EMPTY` | `DELETE /api/categories/:ID_EMPTY` rồi kiểm tra `OC-NO` | `REJ-AUTH` (`403`); `OC-NO` (`ID_EMPTY` không bị xóa) | README 176–180; SEC-03 (280) |
| EP-TC10 | EP (cô lập RBAC `PUT`) | EC07, EC33 | API | P2 | Header `Authorization: Bearer <token_user>` (`role = 'user'`); Path `:id = ID_EMPTY`; Body `{"name": NAME_UPD}` | `PUT /api/categories/:ID_EMPTY` rồi kiểm tra `OC-NO` | `REJ-AUTH` (`403`); `OC-NO` | README 176–180; SEC-03 (280) |
| EP-TC11 | EP (cô lập) | EC09, EC34 | API | P1 | Header `Bearer <token_admin>`; Body `{"name": ""}` | `POST /api/categories` rồi kiểm tra `OC-NO` | `REJ-DATA` (`400`); `OC-NO` | README 189 |
| EP-TC12 | EP (cô lập) | EC10, EC34 | API | P1 | Header `Bearer <token_admin>`; Body `{}` (thiếu `name`) | như trên | `REJ-DATA` (`400`); `OC-NO` | README 189; api_spec 104 |
| EP-TC13 | EP (cô lập) | EC11, EC34 | API | P1 | Header `Bearer <token_admin>`; Body `{"name": "     "}` (5 dấu cách) | như trên | `REJ-DATA` (`400`); `OC-NO` | README 189; Q2 |
| EP-TC14 | EP (cô lập) | EC12, EC34 | API | P1 | Header `Bearer <token_admin>`; Body `{"name": 'A'×300}` (300 ký tự) | như trên | `REJ-DATA` (`400`); `OC-NO` | Q1 (giả định max 255) |
| EP-TC15 | EP (cô lập) | EC13, EC34 | API | P1 | Header `Bearer <token_admin>`; Body `{"name": 12345}` (kiểu số) | như trên | `REJ-DATA` (`400`); `OC-NO` | api_spec 104 (kiểu chuỗi) |
| EP-TC16 | EP (cô lập) | EC14, EC34 | API | P1 | Header `Bearer <token_admin>`; Body `{"name": null}` | như trên | `REJ-DATA` (`400`); `OC-NO` | README 189 |
| EP-TC17 | EP (liên biến Q3) | EC15, EC34 | API | P1 + đã tạo danh mục tên `NAME_NOM` | Header `Bearer <token_admin>`; Body `{"name": NAME_NOM}` (trùng tên đã có) | Gửi `POST /api/categories` lần 2 với cùng `NAME_NOM` rồi kiểm tra `GET /api/categories` | `REJ-DATA` (`400`/`409`); không tạo bản ghi trùng tên thứ hai | Q3 (tính duy nhất tên danh mục) |
| EP-TC18 | EP (bảo mật hiển thị R4) | EC16, EC30 | API + UI | P1 | Header `Bearer <token_admin>`; Body `{"name": "<img src=x onerror=alert(1)>"}` | (1) `POST /api/categories`; (2) Mở trang Quản lý Danh mục trên Web Admin (`http://localhost:5174`) | (1) Nếu tạo: lưu chuỗi văn bản; (2) Trên UI: hiển thị nguyên văn dạng text, **không** render phần tử `<img>` có `onerror` trong DOM và **không** thực thi `alert(1)` | README 281 (SEC-04) |
| EP-TC19 | EP (cô lập) | EC18, EC34 | API | P1 | Header `Bearer <token_admin>`; Path `:id = 999999` (không tồn tại) | `DELETE /api/categories/999999` rồi kiểm tra `OC-NO` | `REJ-DATA` (`404`); `OC-NO` | README 188; Q6 |
| EP-TC20 | EP (cô lập) | EC19, EC34 | API | P1 | Header `Bearer <token_admin>`; Path `:id = 0` | `DELETE /api/categories/0` rồi kiểm tra `OC-NO` | `REJ-DATA` (`400`/`404`); `OC-NO` | api_spec 106; Q6 |
| EP-TC21 | EP (cô lập) | EC20, EC34 | API | P1 | Header `Bearer <token_admin>`; Path `:id = -5` | `DELETE /api/categories/-5` rồi kiểm tra `OC-NO` | `REJ-DATA` (`400`/`404`); `OC-NO` | api_spec 106; Q6 |
| EP-TC22 | EP (cô lập) | EC21, EC34 | API | P1 | Header `Bearer <token_admin>`; Path `:id = abc` | `DELETE /api/categories/abc` rồi kiểm tra `OC-NO` | `REJ-DATA` (`400`/`404`); `OC-NO` | api_spec 106; Q6 |
| EP-TC23 | EP (liên biến R5) | EC22, EC34 | API | P1 (`id = 1` đang có sản phẩm tham chiếu trong bảng `products`) | Header `Bearer <token_admin>`; Path `:id = 1` (`ID_IN_USE`) | `DELETE /api/categories/1` rồi kiểm tra `GET /api/categories` và `GET /api/products` | `REJ-DATA` (`400`/`409`); danh mục `id = 1` không bị xóa trái phép gây mồ côi sản phẩm | README 188, 197; R5; Q5 |
| EP-TC24 | EP (trạng thái) | EC23, EC34 | API | P2 + đã gọi `DELETE /api/categories/:ID_EMPTY` lần 1 thành công (`OC-DEL-OK`) | Header `Bearer <token_admin>`; Path `:id = ID_EMPTY` (lần 2) | Gọi `DELETE /api/categories/:ID_EMPTY` lần 2 rồi kiểm tra `OC-NO` | `REJ-DATA` (`404`); các danh mục còn lại giữ nguyên | README 188; Q6 |
| EP-TC25 | EP (cô lập `PUT`) | EC25, EC34 | API | P2 | Header `Bearer <token_admin>`; Path `:id = ID_EMPTY`; Body `{"name": ""}` | `PUT /api/categories/:ID_EMPTY` rồi kiểm tra `OC-NO` | `REJ-DATA` (`400`); tên của `ID_EMPTY` giữ nguyên | README 189; api_spec 105; Q4 |
| EP-TC26 | EP (cô lập `PUT`) | EC26, EC34 | API | P2 | Header `Bearer <token_admin>`; Path `:id = ID_EMPTY`; Body `{"name": "     "}` | như trên | `REJ-DATA` (`400`); tên của `ID_EMPTY` giữ nguyên | README 189; Q2, Q4 |
| EP-TC27 | EP (cô lập `PUT`) | EC27, EC34 | API | P1 | Header `Bearer <token_admin>`; Path `:id = 999999`; Body `{"name": NAME_UPD}` | `PUT /api/categories/999999` rồi kiểm tra `OC-NO` | `REJ-DATA` (`404`); `OC-NO` | api_spec 105; Q4, Q6 |
| EP-TC28 | EP (UI Auth) | EC35 | UI | P0 (chưa đăng nhập hoặc dùng token `test@eshop.com`) | Mở trực tiếp Web Admin (`http://localhost:5174`) và điều hướng tới mục Quản lý Danh mục | Truy cập trang Quản lý Danh mục khi chưa có quyền Admin | Bị chặn truy cập hoặc chuyển hướng về màn hình Đăng nhập Admin; không hiển thị giao diện thêm/xóa danh mục | README 176 (FR-12); SEC-03 |
| EP-TC29 | EP (UI gộp valid) | EC01, EC08, EC17, EC30, EC31, EC36 | UI | P0 (đăng nhập `admin@eshop.com` trên Web Admin) | `name = NAME_NOM` | Đăng nhập Web Admin → mở Quản lý Danh mục → kiểm tra bảng danh mục → nhập `NAME_NOM` → bấm Thêm → kiểm tra xuất hiện → bấm Xóa dòng vừa tạo | Danh mục mới xuất hiện trong bảng và trong `GET /api/categories`; sau khi bấm Xóa thì biến mất khỏi bảng và CSDL | README 188–189 |
| EP-TC30 | EP (UI Form `*`) | EC37 | UI | Đã đăng nhập Web Admin, mở trang Quản lý Danh mục | Quan sát nhãn (label) của ô nhập Tên danh mục | Đọc nội dung văn bản của nhãn trường Tên danh mục trên DOM | Nhãn trường Tên danh mục (bắt buộc) có ký hiệu `*` đi kèm | README 252 (FR-22) |
| EP-TC31 | EP (UI cô lập rỗng) | EC38, EC34 | UI | Đã đăng nhập Web Admin, mở trang Quản lý Danh mục | Ô Tên danh mục để trống (`""`) | Không nhập tên danh mục → bấm nút Thêm/Submit → kiểm tra DOM và `GET /api/categories` | Bị chặn hoặc hiển thị thông báo lỗi; `OC-NO` (không tạo danh mục rỗng) | README 189, 252 |
| EP-TC32 | EP (UI vị trí lỗi) | EC39 | UI | Như EP-TC31 (khi kích hoạt lỗi form trên UI) | Ô Tên danh mục để trống (`""`) | Kích hoạt thông báo lỗi form → đo tọa độ `boundingBox` của phần tử thông báo lỗi và nút Submit | Thông báo lỗi hiển thị **phía trên** nút Submit (`bottom(lỗi) ≤ top(nút)`) | README 255 (FR-22) |
| EP-TC33 | EP (UI màu nút) | EC40 | UI | Đã đăng nhập Web Admin, mở trang Quản lý Danh mục | Quan sát nút Thêm/Submit và nút Xóa danh mục | Lấy thuộc tính `background-color` (computed style) của nút Thêm và nút Xóa | Nút Thêm màu xanh dương (`B > R` và `B > G`); nút Xóa màu đỏ (`R > G` và `R > B`) | README 245 (FR-21) |
| EP-TC34 | EP (UI tiêu chuẩn & điều hướng) | EC41, EC42 | UI | Đã đăng nhập Web Admin, mở trang Quản lý Danh mục | Quan sát toàn trang Quản lý Danh mục và thanh điều hướng | Đếm số lượng thẻ `<h1>`; kiểm tra ngôn ngữ tiếng Việt; kiểm tra class active/highlight của mục Danh mục trên Navbar/Sidebar và nhãn nút `"Đăng xuất"` | Có đúng **1** thẻ `<h1>`; ngôn ngữ tiếng Việt; mục Danh mục được highlight; nút đăng xuất ghi `"Đăng xuất"` (không phải `"Thoát"`) | README 244, 247 (FR-21); 260, 262 (FR-23) |

**Giải thích:**
- **Ca hợp lệ (gộp):** Có 4 ca API hợp lệ tương ứng 4 phương thức trong hợp đồng (`EP-TC01` cho `GET`, `EP-TC02` cho `POST`, `EP-TC03` cho `DELETE`, `EP-TC04` cho `PUT`) và 1 ca luồng chính trên giao diện Web Admin (`EP-TC29` gộp Thêm & Xóa).
- **Ca không hợp lệ (cô lập lỗi Single-Fault):** Mọi ca âm từ `EP-TC05` đến `EP-TC27` (API) và `EP-TC28`, `EP-TC31` (UI) chỉ làm sai **đúng một** điều kiện tại một thời điểm (hoặc thiếu/sai token, hoặc sai role, hoặc `name` không hợp lệ, hoặc `:id` không hợp lệ, hoặc vi phạm khóa ngoại), trong khi tất cả các biến còn lại đều được giữ ở giá trị hợp lệ mặc định (`token_admin`, `NAME_NOM`, `ID_EMPTY`, `category_in_use = false`).
- **Tách riêng các ca giao diện:** Các ca `EP-TC28`–`EP-TC34` kiểm tra độc lập từng quy định giao diện trong `FR-12`, `FR-21`, `FR-22`, `FR-23` để nếu một tiêu chuẩn UI bị vi phạm thì không làm che khuất kết quả của các tiêu chuẩn khác.

### Truy vết EC → Test case (xem thêm Bước 3b bên dưới)

| EC ID | Test case phủ | EC ID | Test case phủ | EC ID | Test case phủ |
|---|---|---|---|---|---|
| EC01 | TC02, TC03, TC04, TC29 | EC15 | TC17 | EC29 | TC01 |
| EC02 | TC05 | EC16 | TC18 | EC30 | TC02, TC18, TC29 |
| EC03 | TC06 | EC17 | TC03, TC29 | EC31 | TC03, TC29 |
| EC04 | TC07 | EC18 | TC19 | EC32 | TC04 |
| EC05 | TC08 | EC19 | TC20 | EC33 | TC05–TC10 |
| EC06 | TC09 | EC20 | TC21 | EC34 | TC11–TC17, TC19–TC27, TC31 |
| EC07 | TC10 | EC21 | TC22 | EC35 | TC28 |
| EC08 | TC02, TC29 | EC22 | TC23 | EC36 | TC29 |
| EC09 | TC11 | EC23 | TC24 | EC37 | TC30 |
| EC10 | TC12 | EC24 | TC04 | EC38 | TC31 |
| EC11 | TC13 | EC25 | TC25 | EC39 | TC32 |
| EC12 | TC14 | EC26 | TC26 | EC40 | TC33 |
| EC13 | TC15 | EC27 | TC27 | EC41 | TC34 |
| EC14 | TC16 | EC28 | TC01 | EC42 | TC34 |

### Bước 3b — Bảng ca sơ bộ (mỗi EC một dòng) và phân tích rút gọn

Theo bài giảng (Slide 17 → 18): trước hết duyệt **100% EC** (`EC01`–`EC42`), mỗi EC một dòng sơ bộ; khi dòng đó kiểm tra một EC invalid thì mọi biến còn lại **bắt buộc hợp lệ** (cô lập lỗi). Sau đó gộp các dòng có cùng input/thao tác và cùng kết quả mong đợi.

| Dòng | EC | Biến / Thành phần | Giá trị kiểm tra | Các biến khác | Kết quả mong đợi sơ bộ | → TC sau rút gọn |
|---:|---|---|---|---|---|---|
| 1 | EC01 | V1 (`auth_token`) | `Bearer <token_admin>` | V2, V3, V4 hợp lệ | Thao tác CRUD thành công | **TC02, TC03, TC04, TC29** (gộp) |
| 2 | EC02 | V1 (`POST`) | Không có header | `name = NAME_NOM` | `REJ-AUTH` | TC05 |
| 3 | EC03 | V1 (`POST`) | `Bearer token.gia.mao` | `name = NAME_NOM` | `REJ-AUTH` | TC06 |
| 4 | EC04 | V1 (`POST`) | Thiếu tiền tố `Bearer ` | `name = NAME_NOM` | `REJ-AUTH` | TC07 |
| 5 | EC05 | V1 (`POST`) | `Bearer <token_user>` | `name = NAME_NOM` | `REJ-AUTH` (`403`) | TC08 |
| 6 | EC06 | V1 (`DELETE`) | `Bearer <token_user>` | `:id = ID_EMPTY` | `REJ-AUTH` (`403`) | TC09 |
| 7 | EC07 | V1 (`PUT`) | `Bearer <token_user>` | `:id = ID_EMPTY`, `name = NAME_UPD` | `REJ-AUTH` (`403`) | TC10 |
| 8 | EC08 | V2 (`POST`) | `NAME_NOM` (28 ký tự) | V1 hợp lệ (`token_admin`) | Tạo danh mục thành công | **TC02, TC29** (gộp) |
| 9 | EC09 | V2 (`POST`) | `""` | V1 hợp lệ | `REJ-DATA` | TC11 |
| 10 | EC10 | V2 (`POST`) | `{}` (thiếu `name`) | V1 hợp lệ | `REJ-DATA` | TC12 |
| 11 | EC11 | V2 (`POST`) | `"     "` (5 dấu cách) | V1 hợp lệ | `REJ-DATA` | TC13 |
| 12 | EC12 | V2 (`POST`) | `'A'×300` | V1 hợp lệ | `REJ-DATA` | TC14 |
| 13 | EC13 | V2 (`POST`) | `12345` | V1 hợp lệ | `REJ-DATA` | TC15 |
| 14 | EC14 | V2 (`POST`) | `null` | V1 hợp lệ | `REJ-DATA` | TC16 |
| 15 | EC15 | V2 (`POST`) | `NAME_NOM` (lần 2 trùng tên) | V1 hợp lệ | `REJ-DATA` | TC17 |
| 16 | EC16 | V2 (`POST` + UI) | `<img src=x onerror=alert(1)>` | V1 hợp lệ | Lưu chuỗi; UI escape an toàn | TC18 |
| 17 | EC17 | V3×V4 (`DELETE`) | `:id = ID_EMPTY`, `in_use = false` | V1 hợp lệ | Xóa danh mục thành công | **TC03, TC29** (gộp) |
| 18 | EC18 | V3 (`DELETE`) | `:id = 999999` | V1 hợp lệ | `REJ-DATA` (`404`) | TC19 |
| 19 | EC19 | V3 (`DELETE`) | `:id = 0` | V1 hợp lệ | `REJ-DATA` | TC20 |
| 20 | EC20 | V3 (`DELETE`) | `:id = -5` | V1 hợp lệ | `REJ-DATA` | TC21 |
| 21 | EC21 | V3 (`DELETE`) | `:id = "abc"` | V1 hợp lệ | `REJ-DATA` | TC22 |
| 22 | EC22 | V4 (`DELETE`) | `:id = ID_IN_USE` (`in_use = true`) | V1 hợp lệ | `REJ-DATA` (bảo vệ FK) | TC23 |
| 23 | EC23 | V3 (`DELETE` lần 2) | `:id = ID_EMPTY` (đã xóa) | V1 hợp lệ | `REJ-DATA` (`404`) | TC24 |
| 24 | EC24 | V3×V2 (`PUT`) | `:id = ID_EMPTY`, `name = NAME_UPD` | V1 hợp lệ | Cập nhật thành công | **TC04** (gộp) |
| 25 | EC25 | V2 (`PUT`) | `name = ""` | V1, V3 hợp lệ | `REJ-DATA` | TC25 |
| 26 | EC26 | V2 (`PUT`) | `name = "     "` | V1, V3 hợp lệ | `REJ-DATA` | TC26 |
| 27 | EC27 | V3 (`PUT`) | `:id = 999999` | V1, V2 hợp lệ | `REJ-DATA` (`404`) | TC27 |
| 28 | EC28 | `GET` | `GET /api/categories` | — | Trả danh sách | **TC01** (gộp) |
| 29 | EC29 | Output (`GET`) | Mảng JSON danh mục | — | `200 OK` + mảng khớp DB | **TC01** (gộp) |
| 30 | EC30 | Output (`POST`) | Tăng 1 danh mục mới | — | `OC-ADD-OK` | **TC02, TC18, TC29** (gộp) |
| 31 | EC31 | Output (`DELETE`) | Giảm 1 danh mục, cô lập R3 | — | `OC-DEL-OK` | **TC03, TC29** (gộp) |
| 32 | EC32 | Output (`PUT`) | Đổi tên đúng `:id`, cô lập R3 | — | `OC-PUT-OK` | **TC04** (gộp) |
| 33 | EC33 | Output (Auth) | Từ chối xác thực/phân quyền | — | `REJ-AUTH` + `OC-NO` | **TC05–TC10** (gộp) |
| 34 | EC34 | Output (Data) | Từ chối dữ liệu/ràng buộc | — | `REJ-DATA` + `OC-NO` | **TC11–TC17, TC19–TC27, TC31** (gộp) |
| 35–42 | EC35–EC42 | UI Web Admin | Xem bảng EC (EC35–EC42) | Các biến khác hợp lệ | Quan sát DOM / Chặn UI | **TC28–TC34** (TC34 gộp EC41, EC42) |

**Phân tích rút gọn:**
- **Gộp ca hợp lệ:** Dòng 1 (`EC01`), dòng 8 (`EC08`) và dòng 30 (`EC30`) gộp thành **EP-TC02** (thêm danh mục qua API); dòng 1 (`EC01`), dòng 17 (`EC17`) và dòng 31 (`EC31`) gộp thành **EP-TC03** (xóa danh mục qua API); dòng 1 (`EC01`), dòng 24 (`EC24`) và dòng 32 (`EC32`) gộp thành **EP-TC04** (cập nhật danh mục qua API); dòng 28 (`EC28`) và dòng 29 (`EC29`) gộp thành **EP-TC01** (xem danh sách qua API). Trên UI, **EP-TC29** kiểm tra luồng hợp lệ Thêm & Xóa (`EC36`), và **EP-TC34** gộp 2 kiểm tra tĩnh không tương tác trên cùng màn hình (`EC41` tiêu đề/ngôn ngữ và `EC42` thanh điều hướng).
- **Gộp output ngoại lệ:** `EC33` được phủ chung bởi các ca âm phân quyền (`EP-TC05`–`EP-TC10`); `EC34` được phủ chung bởi các ca âm dữ liệu/ràng buộc (`EP-TC11`–`EP-TC17`, `EP-TC19`–`EP-TC27`, `EP-TC31`).
- **Giữ nguyên ca âm độc lập:** Mỗi lớp không hợp lệ (`EC02`–`EC07`, `EC09`–`EC15`, `EC18`–`EC23`, `EC25`–`EC27`, `EC35`, `EC38`) được giữ nguyên **1 test case riêng biệt** để đảm bảo nguyên tắc cô lập lỗi (Single-Fault Isolation).
- **Kết quả:** 42 EC $\rightarrow$ 42 dòng sơ bộ $\rightarrow$ **34 ca kiểm thử EP (`EP-TC01`–`EP-TC34`)**, không có ca trùng lặp.

### Báo cáo độ phủ

- Số điều kiện đã phân tích: 4 biến đầu vào chính (V1–V4) + 2 biến trạng thái phụ (`category_already_deleted`, `other_categories_state`) + 6 ràng buộc nghiệp vụ (R1–R6) + 6 lớp đầu ra (O1–O7) + 8 ràng buộc giao diện Web Admin (FR-12, FR-14, FR-21–23)
- Lớp EP: **12 hợp lệ (6 API + 6 UI) + 24 không hợp lệ (22 API + 2 UI) + 6 lớp đầu ra = 42**
- Lớp đã phủ: **42 / 42** (phủ 100% các EC *đã biết*; theo bài giảng không đồng nghĩa chứng minh tuyệt đối mọi hành vi)
- Số test case EP: **34** (API: 26, API+UI: 1, UI: 7); đã loại trùng: 0
- Câu hỏi mở / mơ hồ: Q1 (max length 255), Q2 (chuỗi khoảng trắng), Q3 (tính duy nhất tên danh mục), Q4 (thao tác `PUT /api/categories/:id`), Q5 (xóa danh mục đang gắn sản phẩm), Q6 (mã HTTP lỗi) — tất cả đã được sinh viên xác nhận ở Bước 1; phát sinh thêm **Q7, Q8** trong quá trình thiết kế chi tiết (xem bảng dưới).

**Câu hỏi mở phát sinh khi thiết kế (đã được sinh viên xác nhận ở Human Review):**

| Mã | Mô tả | Giả định tạm | Trạng thái |
|---|---|---|---|
| **Q7** | **Phản hồi khi `name` sai kiểu dữ liệu (`12345`, `null`) hoặc `:id` không phải số nguyên (`"abc"`):** Nếu backend SQLite tự ép kiểu số `12345` thành chuỗi `"12345"` hoặc trả mã `200 OK` với `changes: 0` khi xóa `:id = "abc"`, đánh giá thế nào? | Theo hợp đồng kiểu dữ liệu JSON (`api_spec` 104–106), `name` phải là chuỗi và `:id` phải là ID hợp lệ đang tồn tại. Nếu hệ thống chấp nhận số `12345` làm tên danh mục hoặc trả `200 OK` khi xóa ID không tồn tại/sai kiểu (`999999`, `0`, `-5`, `"abc"`), ghi nhận là ca `Fail` so với hợp đồng REST chuẩn (Q6). | **Đã xác nhận** |
| **Q8** | **Xử lý kết quả các ca phụ thuộc giả định cận trên độ dài 255 ký tự (`EP-TC14`, `BV-TC03`, `BV-TC04`, `BV-TC05`):** Do `README.md` FR-14 không nêu trực tiếp con số 255 (mà tham chiếu quy chuẩn tên thực thể từ FR-15 theo Q1), nếu thực thi `EP-TC14` (300 ký tự) hoặc `BV-TC05` (256 ký tự) mà hệ thống vẫn cho tạo thành công thì có tính là bug chính thức không? | Giống nguyên tắc đã áp dụng ở FR-08 (Q8): Cận trên 255 là **giả định kỹ thuật Q1**; kết quả của `EP-TC14` và `BV-TC05` sẽ được ghi nhận trung thực theo Oracle Q1 trong bảng thực thi nhưng được phân loại vào nhóm điểm mơ hồ đặc tả (không tự ý tách thành bug độc lập nếu không gây lỗi hệ thống/UI). | **Đã xác nhận** |

---

## 2. Boundary Value Analysis — FR-14: Quản lý Danh mục (Category CRUD)

**Chế độ BVA:** Robustness ($6n + 1$)
**Lý do chọn chế độ:** Theo mặc định của skill và yêu cầu bài tập lớn, cần kiểm tra cả các giá trị ngay trên biên hợp lệ (`LB`, `LB+δ`, `UB-δ`, `UB`) lẫn các giá trị sát biên ngoài miền (`LB-δ`, `UB+δ`) — nơi thường xảy ra lỗi thiếu kiểm tra rỗng hoặc sai toán tử so sánh (`>` thay vì `>=`). Tính năng có $n = 2$ biến đầu vào *có thứ tự* độc lập nhau (`B01` độ dài chuỗi `name` khi Thêm mới và `B02` mã định danh số nguyên `:id` khi Xóa), hai biến này thuộc hai thao tác khác nhau và không tương tác toán học nên chế độ **Robustness ($6n + 1 = 13$)** là tối ưu nhất, không cần tổ hợp tích Descartes của Worst-case ($5^2 = 25$) hay Robust Worst-case ($7^2 = 49$).
**Ngày thiết kế:** 2026-10-15

**So sánh bốn chế độ với $n = 2$ (để chứng minh lựa chọn):**

| Chế độ | Công thức | Số ca lý thuyết | Lý do chọn / loại |
|---|---|---:|---|
| Standard | $4n + 1$ | 9 | **Loại:** Thiếu các điểm ngoài miền (`0` ký tự, `256` ký tự, `id = 0`, `id = ID_max + 1`) — đây chính là các điểm biên âm quan trọng nhất để bắt lỗi thiếu validation |
| **Robustness** | **$6n + 1$** | **13** | **Chọn:** Bao phủ trọn vẹn cả biên hợp lệ và biên ngoài miền theo nguyên tắc cô lập đơn lỗi (Single-Fault) với số lượng ca tối ưu |
| Worst-case | $5^n$ | 25 | **Loại:** `B01` (độ dài `name` trong `POST`) và `B02` (mã `:id` trong `DELETE`) không tương tác trong cùng một công thức tính toán; nhân tích Descartes không sinh thêm hành vi mới |
| Robust Worst-case | $7^n$ | 49 | **Loại:** Tương tự Worst-case, chi phí dư thừa mà không tăng khả năng phát hiện lỗi |

**Biến không đưa vào BVA (có lý do, không bỏ sót):**

| Biến | Lý do không có phân vùng có thứ tự |
|---|---|
| V1 (`auth_token` / `role`) | Là biến rời rạc định danh trạng thái xác thực và tập vai trò (`admin`, `user`, không có token), không có quan hệ thứ tự số học. Thời hạn sống của JWT không được đặc tả nêu. Đã được phủ đầy đủ bằng EP (`EC01`–`EC07`). |
| V4 (`category_in_use`) | Là biến trạng thái logic (Boolean: danh mục có hoặc không có sản phẩm tham chiếu), không có ngưỡng số lượng sản phẩm trong đặc tả FR-14. Đã được phủ bằng EP (`EC17`, `EC22`). |
| Tên danh mục theo thứ tự từ điển | Đặc tả không quy định giới hạn theo bảng chữ cái (`A–Z`); biên của `name` chỉ xét theo **độ dài ký tự** (`B01`). |

### Bước 1 — Xác định phân vùng có thứ tự và các cận

| B ID | Biến | Ràng buộc (trích đặc tả) | LB | UB | Loại cận LB | Loại cận UB | $\delta$ (bước nhỏ nhất) | Nominal | Nguồn |
|---|---|---|---|---|---|---|---|---|---|
| **B01** | Độ dài chuỗi `name` (`POST /api/categories`) | Không được để trống ($\ge 1$ ký tự); cận trên giả định $255$ ký tự (Q1) | `1` | `255` *(giả định Q1)* | Đóng | Đóng | `1` ký tự | `28` ký tự (`NAME_NOM`) | README 189; Q1 |
| **B02** | Mã định danh `:id` (`DELETE /api/categories/:id`) | Số nguyên dương khớp `id` danh mục tồn tại trong CSDL $[1, ID_{\max}]$ (với fixture chuẩn $ID_{\max} = 5$) | `1` | `5` (`ID_max` của fixture) | Đóng | Đóng | `1` đơn vị | `3` (`ID_NOM`) | README 188; api_spec 106 |

**Giải thích:**
- **Với B01 (Độ dài `name`):** Độ dài chuỗi ký tự luôn là số nguyên không âm nên bước nhỏ nhất $\delta = 1$ ký tự. Yêu cầu *"Tên danh mục là bắt buộc, không được để trống"* tương ứng với độ dài $\ge 1$ (cận dưới $\text{LB} = 1$ là **cận đóng**: $1$ ký tự hợp lệ, $0$ ký tự không hợp lệ). Cận trên $\text{UB} = 255$ (theo Q1) là **cận đóng** ($255$ hợp lệ, $256$ không hợp lệ). Để tránh sai lệch giữa số ký tự và số byte UTF-8 tại các điểm sát biên, các chuỗi kiểm thử biên dùng ký tự ASCII `'A'` lặp lại đúng số lần (`"A"`, `"AB"`, `'A'×254`, `'A'×255`, `'A'×256`).
- **Với B02 (Mã định danh `:id`):** Khóa chính `:id` trong bảng `categories` là số nguyên dương tự tăng nên bước nhỏ nhất $\delta = 1$ đơn vị. Để đảm bảo **nguyên tắc cô lập lỗi (Single-Fault)** — tức khi thay đổi `:id` qua 7 điểm (`0, 1, 2, 3, 4, 5, 6`) thì biến trạng thái `V4 (category_in_use)` luôn giữ giá trị hợp lệ mặc định là `false` (không bị vướng khóa ngoại của sản phẩm) và mọi điểm biên đều phân biệt rõ ràng — bộ fixture chuẩn `P_BVA_ID` khởi tạo bảng `categories` gồm đúng **5 danh mục độc lập** có `id` liên tiếp từ `1` đến `5` ($\text{LB} = 1$, $\text{LB}+\delta = 2$, $\text{Nominal} = 3$, $\text{UB}-\delta = 4$, $\text{UB} = ID_{\max} = 5$, chưa gắn sản phẩm). Khi đó $\text{LB}-\delta = 0$ và $\text{UB}+\delta = 6$ nằm ngay sát ngoài hai đầu miền hợp lệ $[1, 5]$.

### Bước 2 — Chọn chế độ và điểm cần kiểm tra

| Điểm | Biến | Giá trị | Quan hệ với biên | Hợp lệ? |
|---|---|---|---|---|
| P1 | B01 (độ dài `name`) | `0` ký tự (`""`) | $\text{LB} - \delta$ | Không |
| P2 | B01 (độ dài `name`) | `1` ký tự (`"A"`) | $\text{LB}$ | Có |
| P3 | B01 (độ dài `name`) | `2` ký tự (`"AB"`) | $\text{LB} + \delta$ | Có |
| P4 | B01 (độ dài `name`) | `254` ký tự (`'A'×254`) | $\text{UB} - \delta$ | Có |
| P5 | B01 (độ dài `name`) | `255` ký tự (`'A'×255`) | $\text{UB}$ | Có |
| P6 | B01 (độ dài `name`) | `256` ký tự (`'A'×256`) | $\text{UB} + \delta$ | Không |
| P7 | B02 (mã `:id` trong $[1, 5]$) | `0` | $\text{LB} - \delta$ | Không |
| P8 | B02 (mã `:id` trong $[1, 5]$) | `1` | $\text{LB}$ | Có |
| P9 | B02 (mã `:id` trong $[1, 5]$) | `2` | $\text{LB} + \delta$ | Có |
| P10 | B02 (mã `:id` trong $[1, 5]$) | `4` ($ID_{\max} - 1$) | $\text{UB} - \delta$ | Có |
| P11 | B02 (mã `:id` trong $[1, 5]$) | `5` ($ID_{\max}$) | $\text{UB}$ | Có |
| P12 | B02 (mã `:id` trong $[1, 5]$) | `6` ($ID_{\max} + 1$) | $\text{UB} + \delta$ | Không |
| P0 | Cả hai (Nominal) | `28` ký tự (`NAME_NOM`) & `id = 3` (`ID_NOM`) | Nominal | Có |

**Công thức:** $6n + 1 = 6 \times 2 + 1 = \mathbf{13}$ **ca (lý thuyết)**.

**Bảng 13 vector lý thuyết và đối chiếu với ca thực tế:**

| # | Biến thay đổi | Điểm biên | B01 (độ dài `name`) | B02 (mã `:id`) | Kết quả mong đợi | Ca thực tế tương ứng |
|---:|---|---|---:|---:|---|---|
| 1 | — | All nominal | 28 | 3 | Hợp lệ | *Tái sử dụng EP-TC02 (`POST` nominal) & EP-TC03 (`DELETE` nominal)* |
| 2 | B01 | $\text{LB} - \delta$ | 0 | 3 | Không hợp lệ | *Tái sử dụng EP-TC11 (`name = ""`)* |
| 3 | B01 | $\text{LB}$ | 1 | 3 | Hợp lệ | **BV-TC01** |
| 4 | B01 | $\text{LB} + \delta$ | 2 | 3 | Hợp lệ | **BV-TC02** |
| 5 | B01 | $\text{UB} - \delta$ | 254 | 3 | Hợp lệ | **BV-TC03** |
| 6 | B01 | $\text{UB}$ | 255 | 3 | Hợp lệ | **BV-TC04** |
| 7 | B01 | $\text{UB} + \delta$ | 256 | 3 | Không hợp lệ | **BV-TC05** |
| 8 | B02 | $\text{LB} - \delta$ | 28 | 0 | Không hợp lệ | *Tái sử dụng EP-TC20 (`DELETE /api/categories/0`)* |
| 9 | B02 | $\text{LB}$ | 28 | 1 | Hợp lệ | **BV-TC06** |
| 10 | B02 | $\text{LB} + \delta$ | 28 | 2 | Hợp lệ | **BV-TC07** |
| 11 | B02 | $\text{UB} - \delta$ | 28 | 4 | Hợp lệ | **BV-TC08** |
| 12 | B02 | $\text{UB}$ | 28 | 5 | Hợp lệ | **BV-TC09** |
| 13 | B02 | $\text{UB} + \delta$ | 28 | 6 | Không hợp lệ | **BV-TC10** |

**Đối chiếu loại trùng (Bước 5 BVA):**
- 13 vector lý thuyết = **10 ca BVA mới thực tế duy nhất (`BV-TC01`…`BV-TC10`)** + **3 vector tái sử dụng trực tiếp từ EP** (#1 Nominal $\rightarrow$ `EP-TC02`/`EP-TC03`; #2 B01 $\text{LB}-\delta = 0$ ký tự $\rightarrow$ `EP-TC11`; #8 B02 $\text{LB}-\delta = 0$ $\rightarrow$ `EP-TC20`).
- Không có điểm biên nào bị suy biến hay không tiếp cận được vì cả B01 ($[1, 255]$) và B02 ($[1, 5]$) đều có 2 cận đóng phân biệt với khoảng cách $\ge 4\delta$. Việc tái sử dụng 3 vector đã có ở EP giúp bộ kiểm thử không chạy lặp các ca có cùng input và cùng kết quả mà vẫn bảo toàn 100% độ phủ 13 điểm biên lý thuyết.

### Bước 3 — Test case BVA

**Điều kiện tiên quyết:**
- Với `BV-TC01`…`BV-TC05` (kiểm tra biên B01 độ dài `name`): dùng điều kiện tiên quyết **P1** (đăng nhập `token_admin`, CSDL sạch `N0` danh mục).
- Với `BV-TC06`…`BV-TC10` (kiểm tra biên B02 mã `:id`): dùng điều kiện tiên quyết **P_BVA_ID** (đăng nhập `token_admin`, bảng `categories` được khởi tạo sạch gồm đúng 5 danh mục có `id` $\in \{1, 2, 3, 4, 5\}$ và không có sản phẩm tham chiếu để cô lập hoàn toàn biến `:id`).

| TC ID | Chế độ | Biên nhắm tới | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|
| BV-TC01 | Robustness | B01 $\text{LB}$ (1 ký tự) | Header `Bearer <token_admin>`; Body `{"name": "A"}` | `POST /api/categories` rồi kiểm tra `GET /api/categories` | `OC-ADD-OK("A")`: 2xx; tạo đúng 1 danh mục mới có `name = "A"` (độ dài 1) | README 189 (không rỗng $\ge 1$) |
| BV-TC02 | Robustness | B01 $\text{LB} + \delta$ (2 ký tự) | Header `Bearer <token_admin>`; Body `{"name": "AB"}` | như trên | `OC-ADD-OK("AB")`: 2xx; tạo đúng 1 danh mục mới có `name = "AB"` (độ dài 2) | README 189 |
| BV-TC03 | Robustness | B01 $\text{UB} - \delta$ (254 ký tự) | Header `Bearer <token_admin>`; Body `{"name": 'A'×254}` | như trên | `OC-ADD-OK('A'×254)`: 2xx; tên danh mục lưu đủ 254 ký tự, không bị cắt cụt | Q1 (giả định max 255) |
| BV-TC04 | Robustness | B01 $\text{UB}$ (255 ký tự) | Header `Bearer <token_admin>`; Body `{"name": 'A'×255}` | như trên | `OC-ADD-OK('A'×255)`: 2xx; tên danh mục lưu đủ 255 ký tự, không bị cắt cụt | Q1 (giả định max 255) |
| BV-TC05 | Robustness | B01 $\text{UB} + \delta$ (256 ký tự) | Header `Bearer <token_admin>`; Body `{"name": 'A'×256}` | `POST /api/categories` rồi kiểm tra `OC-NO` | `REJ-DATA` (`400`); `OC-NO` (không tạo bản ghi vượt quá 255 ký tự) | Q1, Q8 |
| BV-TC06 | Robustness | B02 $\text{LB}$ (`id = 1`) | Header `Bearer <token_admin>`; Path `:id = 1` (trên fixture `P_BVA_ID` gồm ID `1..5`) | `DELETE /api/categories/1` rồi kiểm tra `GET /api/categories` | `OC-DEL-OK(1)`: 2xx; bản ghi `id = 1` bị xóa; còn đúng 4 bản ghi `{2, 3, 4, 5}` | README 188; api_spec 106 |
| BV-TC07 | Robustness | B02 $\text{LB} + \delta$ (`id = 2`) | Header `Bearer <token_admin>`; Path `:id = 2` (trên fixture `P_BVA_ID` gồm ID `1..5`) | `DELETE /api/categories/2` rồi kiểm tra `GET /api/categories` | `OC-DEL-OK(2)`: 2xx; bản ghi `id = 2` bị xóa; còn đúng 4 bản ghi `{1, 3, 4, 5}` | README 188; api_spec 106 |
| BV-TC08 | Robustness | B02 $\text{UB} - \delta$ (`id = 4` $= ID_{\max}-1$) | Header `Bearer <token_admin>`; Path `:id = 4` (trên fixture `P_BVA_ID` gồm ID `1..5`) | `DELETE /api/categories/4` rồi kiểm tra `GET /api/categories` | `OC-DEL-OK(4)`: 2xx; bản ghi `id = 4` bị xóa; còn đúng 4 bản ghi `{1, 2, 3, 5}` | README 188; api_spec 106 |
| BV-TC09 | Robustness | B02 $\text{UB}$ (`id = 5` $= ID_{\max}$) | Header `Bearer <token_admin>`; Path `:id = 5` (trên fixture `P_BVA_ID` gồm ID `1..5`) | `DELETE /api/categories/5` rồi kiểm tra `GET /api/categories` | `OC-DEL-OK(5)`: 2xx; bản ghi `id = 5` bị xóa; còn đúng 4 bản ghi `{1, 2, 3, 4}` | README 188; api_spec 106 |
| BV-TC10 | Robustness | B02 $\text{UB} + \delta$ (`id = 6` $= ID_{\max}+1$) | Header `Bearer <token_admin>`; Path `:id = 6` (ngoài cận trên của fixture `1..5`) | `DELETE /api/categories/6` rồi kiểm tra `OC-NO` | `REJ-DATA` (`404`); `OC-NO` (cả 5 bản ghi `{1, 2, 3, 4, 5}` giữ nguyên) | README 188; api_spec 106; Q6 |

**Tái sử dụng ca EP cho các vector biên trùng input (không chạy lặp):**
- Vector #1 (All nominal: `len = 28`, `id = 3`) $\rightarrow$ `EP-TC02` & `EP-TC03`.
- Vector #2 (B01 $\text{LB} - \delta = 0$ ký tự) $\rightarrow$ `EP-TC11`.
- Vector #8 (B02 $\text{LB} - \delta$: `id = 0`) $\rightarrow$ `EP-TC20`.

**Giải thích:** Kết quả mong đợi (Expected) được tính toán độc lập từ hệ bất đẳng thức của đặc tả:
- Với `B01`: $1 \le \text{len}(\text{name}) \le 255 \implies$ các độ dài $1, 2, 254, 255$ thuộc đoạn đóng $[1, 255]$ nên hợp lệ (`OC-ADD-OK`); các độ dài $0$ ($< 1$) và $256$ ($> 255$) nằm ngoài đoạn nên bị từ chối (`REJ-DATA`).
- Với `B02`: $1 \le \text{id} \le 5 \implies$ các giá trị $1, 2, 4, 5$ thuộc tập ID hiện có nên xóa hợp lệ (`OC-DEL-OK`); các giá trị $0$ ($< 1$) và $6$ ($> 5$) nằm ngoài tập ID hiện có nên phải bị từ chối (`REJ-DATA` / `404 Not Found`) và không làm mất bất kỳ danh mục nào trong CSDL.

### Bước 4 — Biên đầu ra

Theo bài giảng (Slide 21) và quy trình `hw02_boundary_value_analysis`, cần xét cả (1) giá trị đầu vào làm **đầu ra** chạm biên định lượng và (2) giá trị đầu ra do hệ thống sinh có ràng buộc độ dài/miền:

| Biên đầu ra | Input / Thao tác gây ra | Test case |
|---|---|---|
| **Biên dưới của danh sách đầu ra `GET /api/categories` (0 danh mục — mảng rỗng `[]` & trạng thái Empty State FR-24)** | Admin xóa toàn bộ các danh mục hiện có trong fixture để bảng `categories` về 0 bản ghi, sau đó gọi `GET /api/categories` và mở trang Quản lý Danh mục trên Web Admin | **OB-TC01** *(thiết kế bên dưới)* |
| **Biên 1 phần tử của danh sách đầu ra `GET /api/categories` (1 danh mục)** | Sau khi bảng trống, thêm 1 danh mục hoặc xóa đến khi còn 1 danh mục | Đã được kiểm tra trong quá trình thiết lập `OB-TC01` |
| **Giá trị `id` do hệ thống sinh khi `POST /api/categories`** | Thêm danh mục mới | Không có biên độ dài cố định (khác OTP 6 chữ số ở FR-03); `id` là số nguyên tự tăng $\ge 1$, đã được kiểm tra ở `EP-TC02` |

**Bảng test case biên đầu ra (`OB-TC01`):**

| TC ID | Chế độ | Biên đầu ra nhắm tới | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|
| **OB-TC01** | Output BVA | Số lượng phần tử đầu ra của `GET /api/categories` chạm biên dưới $\text{LB}_{\text{out}} = 0$ (mảng rỗng `[]` & Empty State trên Web Admin UI) | Fixture có bảng `categories` rỗng (`0` bản ghi); đăng nhập Admin | (1) Gọi `GET /api/categories`; (2) Mở trang Quản lý Danh mục trên Web Admin (`http://localhost:5174`) | (1) API trả `200 OK` với mảng rỗng `[]` (`length = 0`); (2) Giao diện Web Admin không bị crash, hiển thị trạng thái trống (**Empty State**) có icon/hình minh họa và thông báo thân thiện theo đúng FR-24 | README 188, 269 (FR-24); api_spec 103 |

### Bước 5 — Ca bổ sung do sinh viên (sau Human Review)

Qua quá trình trực tiếp thẩm định bảng lớp tương đương (`EC01`–`EC42`) và giá trị biên (`BV-TC01`–`BV-TC10`, `OB-TC01`) do AI thiết kế, em xác nhận cấu trúc phân hoạch, công thức BVA Robustness ($6n+1 = 13$) và các giả định `Q7`, `Q8` là hợp lý. Tuy nhiên, để khắc phục hạn chế của phân tích hộp đen tĩnh (chưa xét kỹ chuẩn hóa chuỗi đầu/cuối, tính phân biệt hoa/thường khi trùng tên, tương thích Unicode/emoji, tấn công SQL Injection và xung đột đồng thời), em chính thức thiết kế và bổ sung thêm **5 test case chuyên sâu (`SR-TC01` đến `SR-TC05`)**.

> **Phân loại phạm vi (theo bài giảng §12.2):** `SR-TC01` và `SR-TC02` thuộc phạm vi EP/BVA mở rộng (lớp chuỗi đặc biệt có khoảng trắng thừa, so khớp hoa/thường và chuỗi Unicode/emoji). `SR-TC03` (SQL Injection — `SEC-05`), `SR-TC04` (Race condition / Double submit) và `SR-TC05` (Tính toàn vẹn liên thông sau khi xóa danh mục đang có sản phẩm giữa Admin và Web người dùng) là **ca phạm vi mở rộng** ngoài EP/BVA thuần túy: được giữ lại vì truy vết trực tiếp tới đặc tả (`README.md` dòng 188, 197, 282) và có sức phát hiện lỗi thực tế cao, nhưng **không tính gộp vào độ phủ EC/biên lý thuyết**.

| TC ID | Câu hỏi rà soát / Lý do bổ sung | Dữ liệu vào | Các bước / Lệnh thực hiện | Kết quả mong đợi (Oracle) | Nguồn expected |
|---|---|---|---|---|---|
| **SR-TC01** | **Chuẩn hóa khoảng trắng đầu/cuối (`trim`) và trùng tên khác chữ hoa/thường (Case-insensitivity):** Kiểm tra xem hệ thống có cho phép tạo danh mục trùng tên chỉ bằng cách thêm khoảng trắng hai đầu hoặc đổi chữ hoa/thường không. | Đã có danh mục `"Thiết bị gia dụng thông minh"`; gửi tiếp `name = "  thiết bị gia dụng thông minh  "` | 1. Admin gọi `POST /api/categories` tạo `"Thiết bị gia dụng thông minh"`.<br>2. Gửi tiếp `POST /api/categories` với `{"name": "  thiết bị gia dụng thông minh  "}`.<br>3. Kiểm tra `GET /api/categories`. | Hệ thống tự động `trim()` khoảng trắng thừa ở hai đầu và từ chối tạo bản ghi trùng tên không phân biệt hoa/thường (`400`/`409`), hoặc nếu lưu chuỗi mới thì bắt buộc không được lưu khoảng trắng thừa ở đầu/cuối gây trùng lặp hiển thị. | README dòng 189; Q2, Q3 (Chuẩn hóa & duy nhất tên danh mục) |
| **SR-TC02** | **Tương thích chuỗi Unicode tổ hợp, ký tự phân cách hợp lệ (`&`, `/`, `-`) và Emoji:** Kiểm tra khả năng lưu trữ UTF-8 và hiển thị tên danh mục đa ngôn ngữ/biểu tượng trên cả API lẫn UI. | `name = "Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)"` | 1. Admin gọi `POST /api/categories` với chuỗi chứa tiếng Việt có dấu, ký tự `&`, `-`, `()` và emoji `🍜`.<br>2. Gọi `GET /api/categories` và mở trang Quản lý Danh mục trên Web Admin. | Tạo thành công (HTTP 2xx); chuỗi tên danh mục được lưu trữ nguyên vẹn 100% trong SQLite và hiển thị đúng ký tự (không bị lỗi font, không biến `&` thành `&amp;` thô trên văn bản hiển thị) trên giao diện Web Admin. | README dòng 188, 244 (FR-21); Tương thích Unicode |
| **SR-TC03** | **Phòng chống SQL Injection trong trường `name` và tham số `:id` (SEC-05)** *(Ca phạm vi mở rộng)*: Kiểm tra truy vấn CSDL có dùng Parameterized Query hay nối chuỗi trực tiếp gây rò rỉ/phá hủy bảng `categories`. | (a) `POST` với `name = "Điện tử'); DROP TABLE categories; --"`<br>(b) `DELETE /api/categories/1%20OR%201=1` | 1. Admin gửi `POST /api/categories` chứa payload SQLi.<br>2. Admin gửi `DELETE /api/categories/1%20OR%201=1`.<br>3. Kiểm tra `GET /api/categories`. | Hệ thống xử lý tham số an toàn bằng Parameterized Query: không gây lỗi `500 Internal Server Error`, bảng `categories` không bị xóa mất dữ liệu, và lệnh `DELETE` với `1 OR 1=1` tuyệt đối không được xóa toàn bộ các danh mục trong bảng. | README dòng 282 (SEC-05) |
| **SR-TC04** | **Gửi đồng thời 2 request tạo cùng một danh mục (Double Submit / Race Condition)** *(Ca phạm vi mở rộng)*: Kiểm tra khi Admin bấm đúp nút "Thêm" hoặc gửi 2 request song song có tạo ra 2 danh mục trùng hệt nhau không. | 2 request `POST /api/categories` đồng thời cùng `token_admin` và cùng `{"name": "Danh mục đồng thời"}` | Bắn song song (`Promise.all`) 2 HTTP request `POST /api/categories` cùng tên trong cùng thời điểm mili-giây, sau đó kiểm tra `GET /api/categories`. | Trong CSDL chỉ có **đúng 1 danh mục** mang tên `"Danh mục đồng thời"` được tạo; không sinh ra 2 bản ghi trùng lặp cùng tên. | README dòng 188–189; Q3 (Tính toàn vẹn giao dịch) |
| **SR-TC05** | **Tính toàn vẹn liên hệ thống sau khi thao tác danh mục (Cross-component Integrity với FR-05/FR-15)** *(Ca phạm vi mở rộng)*: Kiểm tra nếu Admin xóa một danh mục đang có sản phẩm (trong trường hợp backend thiếu chặn khóa ngoại) thì danh sách sản phẩm `GET /api/products` và trang sản phẩm có bị lỗi hay mất liên kết danh mục không. | Danh mục `id = 1` đang có sản phẩm tham chiếu; gọi `DELETE /api/categories/1` rồi kiểm tra `GET /api/products` | 1. Ghi nhận các sản phẩm có `category_id = 1` qua `GET /api/products`.<br>2. Admin gọi `DELETE /api/categories/1`.<br>3. Kiểm tra lại `GET /api/categories` và `GET /api/products`. | Mọi sản phẩm trong `GET /api/products` phải luôn trỏ tới một `category_id` hợp lệ đang tồn tại trong `GET /api/categories` (hệ thống phải chặn xóa `id = 1` ngay từ bước 2 theo R5/FR-15; nếu xóa thành công khiến sản phẩm trỏ tới `category_id` không còn tồn tại thì là lỗi vi phạm toàn vẹn khóa ngoại). | README dòng 188, 197 (FR-14 & FR-15); R5 |

### Tổng kết (báo cáo coverage theo mẫu bài giảng)

```text
Requirements parsed: FR-14 (README 186–190), FR-12 (174–180), FR-15 (197), FR-21–FR-24 (240–271), SEC-02–SEC-05 (279–282), api_spec 3.4 (102–107)
BVA mode: Robustness (6n + 1), n = 2 biến có thứ tự (B01 độ dài name, B02 mã định danh :id)
Theoretical BVA count: 6 × 2 + 1 = 13
Actual unique BVA tests: 10 (BV-TC01…10) + 3 vector tái sử dụng EP (EP-TC02/03, EP-TC11, EP-TC20) + 1 ca biên đầu ra (OB-TC01)
Deduplicated test vectors: 3 vector trùng với ca EP đã thiết kế (#1 nominal, #2 B01 LB−δ, #8 B02 LB−δ)
Unresolved ambiguity/oracle issues: cận trên độ dài name 255 (Q1, Q8); chuỗi khoảng trắng (Q2); tính duy nhất tên (Q3); thao tác PUT (Q4); xóa danh mục đang có sản phẩm (Q5); mã HTTP lỗi (Q6, Q7) — tất cả Q1–Q8 đã được sinh viên xác nhận
Student Review tests added: 5 (SR-TC01…SR-TC05)
```

- **Chế độ BVA:** Robustness ($6n + 1$); $n = 2$
- **Số ca theo công thức lý thuyết:** **13**
- **Số ca BVA đầu vào mới thực tế duy nhất:** **10** (`BV-TC01` đến `BV-TC10`); **vector biên tái sử dụng ca EP:** **3** (#1, #2, #8)
- **Số ca BVA biên đầu ra:** **1** (`OB-TC01`)
- **Số ca bổ sung sinh viên (Human Review):** **5** (`SR-TC01` đến `SR-TC05`)
- **Vấn đề oracle / mơ hồ:** Toàn bộ `Q1`–`Q8` đã được sinh viên xác nhận; trong đó `EP-TC14` và `BV-TC03`–`BV-TC05` phụ thuộc giả định kỹ thuật `Q1` (cận trên 255 ký tự) nên được theo dõi theo quy tắc `Q8`.
- **Truy vết biên → Test case:**
  - `B01` (độ dài `name`): $\text{LB}-\delta (0) \rightarrow \text{EP-TC11}$, $\text{LB} (1) \rightarrow \text{BV-TC01}$, $\text{LB}+\delta (2) \rightarrow \text{BV-TC02}$, $\text{Nominal} (28) \rightarrow \text{EP-TC02}$, $\text{UB}-\delta (254) \rightarrow \text{BV-TC03}$, $\text{UB} (255) \rightarrow \text{BV-TC04}$, $\text{UB}+\delta (256) \rightarrow \text{BV-TC05}$.
  - `B02` (mã `:id` trong $[1, 5]$): $\text{LB}-\delta (0) \rightarrow \text{EP-TC20}$, $\text{LB} (1) \rightarrow \text{BV-TC06}$, $\text{LB}+\delta (2) \rightarrow \text{BV-TC07}$, $\text{Nominal} (3) \rightarrow \text{EP-TC03}$, $\text{UB}-\delta (4) \rightarrow \text{BV-TC08}$, $\text{UB} (5) \rightarrow \text{BV-TC09}$, $\text{UB}+\delta (6) \rightarrow \text{BV-TC10}$.
  - Biên đầu ra: $\text{LB}_{\text{out}} (0 \text{ danh mục}) \rightarrow \text{OB-TC01}$.

---

## Tổng hợp số lượng test case FR-14 (đã thiết kế / đã chạy)

| Nhóm | Thiết kế | Pass | Fail | Blocked | Not run |
|---|---:|---:|---:|---:|---:|
| EP (`EP-TC01`…`EP-TC34`) | 34 | 10 | 24 | 0 | 0 |
| BVA đầu vào (`BV-TC01`…`BV-TC10`) | 10 | 8 | 2 | 0 | 0 |
| BVA biên đầu ra (`OB-TC01`) | 1 | 0 | 1 | 0 | 0 |
| Ca bổ sung sinh viên (`SR-TC01`…`SR-TC05`) | 5 | 2 | 3 | 0 | 0 |
| **Tổng** | **50** | **20** | **30** | **0** | **0** |

---

## 3. Thực thi test — FR-14: Quản lý Danh mục (Category CRUD)

**Ngày chạy:** 2026-10-15  
**Công cụ tự động hóa 2 hướng:**
- **Hướng 1 (HTTP API Automation):** `reports/evidence/FR-14/run_fr14.js` (Node.js fetch runner) trên `http://localhost:3000`.
- **Hướng 2 (Playwright CLI UI Automation):** `@playwright/test` v1.64.0 (Chromium Headless) tại `tests/ui-fr14/fr14_ui.spec.js` trên Web Admin `http://localhost:5174` (tab `Quản lý Danh mục`).

**Log dữ liệu thực thi & Bằng chứng:**
- Log API thô: [reports/evidence/FR-14/run_api_1.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_api_1.json) & [run_api_1.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_api_1.md) (Lần 1); [run_api_2.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_api_2.json) & [run_api_2.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_api_2.md) (Lần 2).
- Log UI Playwright: [reports/evidence/FR-14/run_ui_1.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_ui_1.json), [run_ui_2.json](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_ui_2.json) & [run_ui_results.md](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/run_ui_results.md).
- Thư mục ảnh chụp màn hình bằng chứng: [reports/evidence/FR-14/screenshots/](file:///d:/KCPM/eshop-sut/reports/evidence/FR-14/screenshots/).

**Môi trường nền P0 / Reset:**
- Mỗi ca API được chạy trên một cơ sở dữ liệu SQLite sạch riêng biệt (`DB_PATH=backend/.hw02_fr14_run.sqlite`), backend được khởi động lại sạch sẽ trước mỗi ca kiểm thử để đảm bảo tính phân lập (Clean DB Fixture). Với các ca biên `BV-TC06`–`BV-TC10`, fixture `P_BVA_ID` khởi tạo chính xác 5 danh mục độc lập (`id = 1..5`, không có sản phẩm tham chiếu) để cô lập hoàn toàn biến `:id`.
- Các ca UI chạy trên CSDL cô lập riêng (`DB_PATH=backend/.hw02_fr14_ui.sqlite`) và được xóa dọn sau khi hoàn tất; CSDL chính `backend/database.sqlite` tuyệt đối không bị ảnh hưởng.

### 3.1 Bảng thực thi chi tiết 50 test case

| TC ID | Mô tả ca kiểm thử | Lệnh chạy thật (bước chính) | Kết quả mong đợi (Oracle Đặc tả) | Kết quả thực tế (Lần 1) | Lần 2 | Trạng thái | Bug ID ứng viên |
|---|---|---|---|---|---|:---:|---|
| **EP-TC01** | Xem danh sách danh mục hợp lệ qua `GET /api/categories` | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method GET -SkipHttpErrorCheck` | `200 OK`; trả về mảng JSON `L0` gồm các đối tượng có đủ `id` (nguyên dương) và `name` (chuỗi không rỗng) | HTTP 200: `[{"id":1,"name":"Điện thoại"},{"id":2,"name":"Laptop"},{"id":3,"name":"Phụ kiện"}]` \| Đủ 3 danh mục hợp lệ | Giống Lần 1 | **Pass** |  |
| **EP-TC02** | Admin thêm danh mục mới hợp lệ (`POST /api/categories` với `NAME_NOM`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng thông minh"}' -SkipHttpErrorCheck` | `OC-ADD-OK(NAME_NOM)`: HTTP 2xx; tổng số danh mục tăng từ 3 lên 4; bản ghi mới `id=4` khớp tên | HTTP 200: `{"message":"Category created","id":4}` \| Số danh mục: trước=3, sau=4; Bản ghi mới: `id=4`, `len(name)=28` | Giống Lần 1 | **Pass** |  |
| **EP-TC03** | Admin xóa danh mục hợp lệ không chứa sản phẩm (`DELETE /api/categories/:ID_EMPTY`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/4" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` | `OC-DEL-OK(4)`: HTTP 2xx; giảm đúng 1 danh mục (4 về 3), các danh mục `1..3` giữ nguyên | HTTP 200: `{"message":"Category deleted"}` \| Số danh mục: trước=4, sau=3; các bản ghi `1..3` nguyên vẹn | Giống Lần 1 | **Pass** |  |
| **EP-TC04** | Admin cập nhật tên danh mục hợp lệ (`PUT /api/categories/:ID_EMPTY`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/4" -Method PUT -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng cao cấp"}' -SkipHttpErrorCheck` | `OC-PUT-OK(4, NAME_UPD)`: HTTP 2xx; danh mục `id=4` đổi tên thành `"Thiết bị gia dụng cao cấp"`, bản ghi khác giữ nguyên | HTTP 200: `{"message":"Category updated"}` \| Số danh mục: trước=4, sau=4; `id=4` đổi thành `"Thiết bị gia dụng cao cấp"` | Giống Lần 1 | **Pass** |  |
| **EP-TC05** | Gửi `POST /api/categories` không có header `Authorization` | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng thông minh"}' -SkipHttpErrorCheck` | `REJ-AUTH` (`401`); `OC-NO` | HTTP 401: `{"error":"Unauthorized"}` \| Số danh mục: trước=3, sau=3 | Giống Lần 1 | **Pass** |  |
| **EP-TC06** | Gửi `POST /api/categories` với Token giả mạo sai chữ ký | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer token.gia.mao" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng thông minh"}' -SkipHttpErrorCheck` | `REJ-AUTH` (`401`/`403`); `OC-NO` | HTTP 403: `{"error":"Forbidden"}` \| Số danh mục: trước=3, sau=3 | Giống Lần 1 | **Pass** |  |
| **EP-TC07** | Gửi `POST /api/categories` với header `Authorization` thiếu tiền tố `Bearer ` | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "<token_admin>" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng thông minh"}' -SkipHttpErrorCheck` | `REJ-AUTH` (`401`); `OC-NO` | HTTP 401: `{"error":"Unauthorized"}` \| Số danh mục: trước=3, sau=3 | Giống Lần 1 | **Pass** |  |
| **EP-TC08** | Người dùng thường (`role = 'user'`) gọi `POST /api/categories` (SEC-03 RBAC) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_user>" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng thông minh"}' -SkipHttpErrorCheck` | `REJ-AUTH` (`403 Forbidden`); `OC-NO` | HTTP 200: `{"message":"Category created","id":4}` \| **User thường tạo được danh mục mới! Số danh mục tăng từ 3 lên 4** | Giống Lần 1 | **Fail** | BUG-009 (LỖ HỔNG CRITICAL: Thiếu phân quyền RBAC SEC-03) |
| **EP-TC09** | Người dùng thường (`role = 'user'`) gọi `DELETE /api/categories/:ID_EMPTY` (SEC-03 RBAC) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/4" -Method DELETE -Headers @{ Authorization = "Bearer <token_user>" } -SkipHttpErrorCheck` | `REJ-AUTH` (`403 Forbidden`); `OC-NO` (`ID_EMPTY` không bị xóa) | HTTP 200: `{"message":"Category deleted"}` \| **User thường xóa được danh mục trong CSDL! Số danh mục giảm từ 4 về 3** | Giống Lần 1 | **Fail** | BUG-009 (LỖ HỔNG CRITICAL: Thiếu phân quyền RBAC SEC-03) |
| **EP-TC10** | Người dùng thường (`role = 'user'`) gọi `PUT /api/categories/:ID_EMPTY` (SEC-03 RBAC) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/4" -Method PUT -Headers @{ Authorization = "Bearer <token_user>" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng cao cấp"}' -SkipHttpErrorCheck` | `REJ-AUTH` (`403 Forbidden`); `OC-NO` | HTTP 200: `{"message":"Category updated"}` \| **User thường sửa được tên danh mục `id=4` trong CSDL!** | Giống Lần 1 | **Fail** | BUG-009 (LỖ HỔNG CRITICAL: Thiếu phân quyền RBAC SEC-03) |
| **EP-TC11** | Admin gửi `POST /api/categories` với tên danh mục rỗng (`name = ""`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":""}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); `OC-NO` (không tạo danh mục rỗng) | HTTP 200: `{"message":"Category created","id":4}` \| **Hệ thống chấp nhận chuỗi rỗng `""` và tạo bản ghi `id=4`!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra hợp lệ `name` FR-14) |
| **EP-TC12** | Admin gửi `POST /api/categories` với body `{}` (thiếu khóa `name`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); `OC-NO` | HTTP 200: `{"message":"Category created","id":4}` \| **Tạo bản ghi danh mục có `name: null` trong CSDL!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra hợp lệ `name` FR-14) |
| **EP-TC13** | Admin gửi `POST /api/categories` với chuỗi chỉ gồm 5 khoảng trắng (`"     "`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":"     "}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); `OC-NO` (Q2) | HTTP 200: `{"message":"Category created","id":4}` \| **Tạo bản ghi danh mục toàn khoảng trắng trong CSDL!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra hợp lệ `name` FR-14) |
| **EP-TC14** | Admin gửi `POST /api/categories` với tên dài 300 ký tự (`'A'×300`, theo Q1/Q8) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":"AAAA...(300 ký tự)"}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); `OC-NO` (theo giả định kỹ thuật Q1/Q8) | HTTP 200: `{"message":"Category created","id":4}` \| Chấp nhận chuỗi 300 ký tự (Số danh mục tăng từ 3 lên 4) | Giống Lần 1 | **Fail** | — *(Câu hỏi mở Q1/Q8)* |
| **EP-TC15** | Admin gửi `POST /api/categories` với `name` là số nguyên (`12345`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":12345}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); `OC-NO` (Q7) | HTTP 200: `{"message":"Category created","id":4}` \| **SQLite tự ép kiểu số và tạo bản ghi `"12345"`!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra kiểu dữ liệu `name` Q7) |
| **EP-TC16** | Admin gửi `POST /api/categories` với `name = null` | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":null}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); `OC-NO` | HTTP 200: `{"message":"Category created","id":4}` \| **Tạo bản ghi có `name: null` trong CSDL!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra hợp lệ `name` FR-14) |
| **EP-TC17** | Admin tạo danh mục trùng tên với danh mục đã tồn tại (`NAME_NOM` lần 2) | Gửi `POST /api/categories` lần 2 với cùng `{"name":"Thiết bị gia dụng thông minh"}` | `REJ-DATA` (`400`/`409`); không tạo bản ghi trùng tên thứ hai (Q3) | HTTP 200: `{"message":"Category created","id":5}` \| **Tạo bản ghi trùng tên thứ 2 (`id=4` và `id=5` cùng tên)!** | Giống Lần 1 | **Fail** | BUG-010 (Cho phép tạo danh mục trùng tên Q3) |
| **EP-TC18** | Tạo danh mục chứa chuỗi XSS `<img src=x onerror=alert(1)>` và mở Web Admin (SEC-04) | `POST /api/categories` với `<img src=x onerror=alert(1)>` rồi mở tab `Danh mục` trên Playwright | API lưu chuỗi văn bản (không lỗi 500); UI hiển thị dạng text, không render `<img onerror>` và không chạy `alert(1)` | HTTP 200 \| API lưu chuỗi văn bản; trên UI React tự escape trong `<td>`, `injectedImgCount=0`, `alertTriggered=false` | Giống Lần 1 | **Pass** |  |
| **EP-TC19** | Admin gọi `DELETE /api/categories/999999` với `:id` không tồn tại | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/999999" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` | `REJ-DATA` (`404 Not Found`); `OC-NO` (Q6) | HTTP 200: `{"message":"Category deleted"}` \| **Trả về 200 OK giả tạo dù `id=999999` không tồn tại!** | Giống Lần 1 | **Fail** | BUG-012 (Xóa/sửa ID không tồn tại vẫn trả 200 OK) |
| **EP-TC20** | Admin gọi `DELETE /api/categories/0` (ngoài miền nguyên dương) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/0" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` | `REJ-DATA` (`400`/`404`); `OC-NO` (Q6) | HTTP 200: `{"message":"Category deleted"}` \| **Trả về 200 OK dù `id=0` ngoài miền hợp lệ!** | Giống Lần 1 | **Fail** | BUG-012 (Xóa/sửa ID không hợp lệ vẫn trả 200 OK) |
| **EP-TC21** | Admin gọi `DELETE /api/categories/-5` (`:id` nguyên âm) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/-5" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` | `REJ-DATA` (`400`/`404`); `OC-NO` (Q6) | HTTP 200: `{"message":"Category deleted"}` \| **Trả về 200 OK dù `id=-5` là số âm!** | Giống Lần 1 | **Fail** | BUG-012 (Xóa/sửa ID không hợp lệ vẫn trả 200 OK) |
| **EP-TC22** | Admin gọi `DELETE /api/categories/abc` (`:id` không phải số nguyên) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/abc" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` | `REJ-DATA` (`400`/`404`); `OC-NO` (Q6, Q7) | HTTP 200: `{"message":"Category deleted"}` \| **Trả về 200 OK dù `id="abc"` sai kiểu dữ liệu!** | Giống Lần 1 | **Fail** | BUG-012 (Xóa/sửa ID sai kiểu vẫn trả 200 OK) |
| **EP-TC23** | Admin gọi `DELETE /api/categories/1` khi `id=1` đang có sản phẩm tham chiếu (R5, Q5) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/1" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` | `REJ-DATA` (`400`/`409`); danh mục `id=1` không bị xóa trái phép gây mồ côi sản phẩm | HTTP 200: `{"message":"Category deleted"}` \| **Danh mục `id=1` (đang có 2 sản phẩm) bị xóa mất khỏi CSDL (trước=3, sau=2)!** | Giống Lần 1 | **Fail** | BUG-011 (Vi phạm khóa ngoại: xóa danh mục đang có sản phẩm) |
| **EP-TC24** | Admin gọi `DELETE /api/categories/:ID_EMPTY` lần 2 trên danh mục vừa bị xóa | Xóa `id=4` lần 1 (`200 OK`), sau đó gửi `DELETE /api/categories/4` lần 2 | `REJ-DATA` (`404 Not Found`); các danh mục còn lại giữ nguyên (Q6) | HTTP 200: `{"message":"Category deleted"}` \| **Xóa lần 2 trên bản ghi đã mất vẫn trả về 200 OK!** | Giống Lần 1 | **Fail** | BUG-012 (Xóa lặp bản ghi đã xóa vẫn trả 200 OK) |
| **EP-TC25** | Admin gọi `PUT /api/categories/:ID_EMPTY` với tên mới rỗng (`name = ""`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/4" -Method PUT -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":""}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); tên của `ID_EMPTY` giữ nguyên (Q4) | HTTP 200: `{"message":"Category updated"}` \| **Ghi đè tên danh mục `id=4` thành chuỗi rỗng `""`!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra hợp lệ `name` khi PUT) |
| **EP-TC26** | Admin gọi `PUT /api/categories/:ID_EMPTY` với tên mới toàn khoảng trắng (`"     "`) | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/4" -Method PUT -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":"     "}' -SkipHttpErrorCheck` | `REJ-DATA` (`400`); tên của `ID_EMPTY` giữ nguyên (Q2, Q4) | HTTP 200: `{"message":"Category updated"}` \| **Ghi đè tên danh mục `id=4` thành 5 dấu cách!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu kiểm tra hợp lệ `name` khi PUT) |
| **EP-TC27** | Admin gọi `PUT /api/categories/999999` (`:id` không tồn tại) với tên mới hợp lệ | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/999999" -Method PUT -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":"Thiết bị gia dụng cao cấp"}' -SkipHttpErrorCheck` | `REJ-DATA` (`404 Not Found`); `OC-NO` (Q4, Q6) | HTTP 200: `{"message":"Category updated"}` \| **Trả về 200 OK dù `id=999999` không tồn tại!** | Giống Lần 1 | **Fail** | BUG-012 (PUT ID không tồn tại vẫn trả 200 OK) |
| **EP-TC28** | Chưa đăng nhập hoặc dùng tài khoản `role='user'` truy cập Quản lý Danh mục trên Web Admin | Playwright mở `http://localhost:5174` với trạng thái rỗng và với token của `test@eshop.com` (`role='user'`) | Bị chặn truy cập hoặc yêu cầu đăng nhập Admin; không hiển thị giao diện thêm/xóa danh mục (FR-12, SEC-03) | Khi có token `role='user'`, **Web Admin không kiểm tra role, cho phép mở toàn bộ tab Quản lý Danh mục và thao tác Thêm/Xóa!** | Giống Lần 1 | **Fail** | BUG-009 (LỖ HỔNG CRITICAL: Web Admin không chặn `role='user'`) |
| **EP-TC29** | Luồng Thêm và Xóa danh mục hợp lệ trên giao diện Web Admin | Playwright đăng nhập Admin $\rightarrow$ mở tab `Danh mục` $\rightarrow$ nhập `NAME_NOM` bấm `"Thêm mới"` $\rightarrow$ bấm `"Xóa"` | Danh mục mới xuất hiện trong bảng và CSDL sau khi Thêm; biến mất sau khi bấm Xóa (FR-14) | Thêm `"Thiết bị gia dụng thông minh"` xuất hiện ngay trên bảng và `GET /api/categories`; bấm `"Xóa"` xóa sạch khỏi bảng và CSDL | Giống Lần 1 | **Pass** |  |
| **EP-TC30** | Nhãn trường Tên danh mục (bắt buộc) có ký hiệu dấu `*` đi kèm | Playwright kiểm tra các thẻ `<label>` trên tab `Quản lý Danh mục` | Nhãn trường Tên danh mục bắt buộc có ký hiệu `*` (README 252, FR-22) | Form thêm danh mục **hoàn toàn không có thẻ `<label>` nào (`labelCount = 0`)** và không có ký hiệu `*` | Giống Lần 1 | **Fail** | BUG-013 (Giao diện thiếu `<label>` và dấu `*` FR-22) |
| **EP-TC31** | Để trống ô Tên danh mục trên UI rồi bấm `"Thêm mới"` | Playwright để trống ô `"Tên danh mục mới"` và bấm nút `"Thêm mới"` | Bị chặn hoặc hiển thị thông báo lỗi; `OC-NO` không tạo danh mục rỗng (FR-14, FR-22) | **Không chặn submit, không báo lỗi và tạo luôn dòng danh mục rỗng `#4` trên bảng UI và trong CSDL (từ 3 lên 4 bản ghi)!** | Giống Lần 1 | **Fail** | BUG-010 (UI & API cho phép tạo danh mục rỗng) |
| **EP-TC32** | Vị trí thông báo lỗi trên form Quản lý Danh mục hiển thị phía trên nút Submit | Playwright kích hoạt submit rỗng và tìm phần tử thông báo lỗi để đo `boundingBox` | Thông báo lỗi hiển thị phía trên nút Submit: `bottom(lỗi) <= top(nút)` (README 255, FR-22) | **Form hoàn toàn không hiển thị thông báo lỗi nào (`errorCount = 0`) khi gửi dữ liệu rỗng** | Giống Lần 1 | **Fail** | BUG-013 (Thiếu thông báo lỗi phía trên nút Submit FR-22) |
| **EP-TC33** | Màu sắc nút `"Thêm mới"` (xanh dương) và nút `"Xóa"` (đỏ) trên trang Quản lý Danh mục | Playwright lấy `computedStyle.backgroundColor` của nút `"Thêm mới"` và `"Xóa"` | Nút Thêm màu xanh dương (`B > R, B > G`); nút Xóa màu đỏ (`R > G, R > B`) (README 245, FR-21) | Nút `"Thêm mới"` màu xanh dương `rgb(37, 99, 235)` (`bg-blue-600`); nút `"Xóa"` màu đỏ `rgb(239, 68, 68)` (`bg-red-500`) | Giống Lần 1 | **Pass** |  |
| **EP-TC34** | Tiêu chuẩn 1 thẻ `<h1>`, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nhãn `"Đăng xuất"` | Playwright kiểm tra thẻ `<h1>`, thanh điều hướng bên trái và nhãn đăng xuất | Đúng 1 thẻ `<h1>`; toàn bộ giao diện tiếng Việt không lẫn tiếng Anh; mục Danh mục được highlight; nút đăng xuất ghi `"Đăng xuất"` | Có 1 thẻ `<h1>`, highlight `"Danh mục"` (`text-blue-400`) và nhãn `"Đăng xuất"`, **nhưng thanh điều hướng và trang Login lẫn tiếng Anh (`"Dashboard"`, `"Admin Login"`, `"Password"`, `"Login"`)** | Giống Lần 1 | **Fail** | BUG-013 (Giao diện pha trộn tiếng Anh vi phạm FR-21) |
| **BV-TC01** | BVA B01 $\text{LB}$: Thêm danh mục có độ dài tên = 1 ký tự (`"A"`) | `POST /api/categories` với `{"name":"A"}` | `OC-ADD-OK("A")`: HTTP 2xx; tạo đúng 1 danh mục `name="A"` (độ dài 1) | HTTP 200: `{"message":"Category created","id":4}` \| Số danh mục: trước=3, sau=4; `len(name)=1` | Giống Lần 1 | **Pass** |  |
| **BV-TC02** | BVA B01 $\text{LB}+\delta$: Thêm danh mục có độ dài tên = 2 ký tự (`"AB"`) | `POST /api/categories` với `{"name":"AB"}` | `OC-ADD-OK("AB")`: HTTP 2xx; tạo đúng 1 danh mục `name="AB"` (độ dài 2) | HTTP 200: `{"message":"Category created","id":4}` \| Số danh mục: trước=3, sau=4; `len(name)=2` | Giống Lần 1 | **Pass** |  |
| **BV-TC03** | BVA B01 $\text{UB}-\delta$: Thêm danh mục có độ dài tên = 254 ký tự (`'A'×254`) | `POST /api/categories` với `{"name":"AAAA...(254 ký tự)"}` | `OC-ADD-OK('A'×254)`: HTTP 2xx; lưu đủ 254 ký tự không bị cắt cụt (Q1) | HTTP 200: `{"message":"Category created","id":4}` \| Số danh mục: trước=3, sau=4; `len(name)=254` | Giống Lần 1 | **Pass** |  |
| **BV-TC04** | BVA B01 $\text{UB}$: Thêm danh mục có độ dài tên = 255 ký tự (`'A'×255`) | `POST /api/categories` với `{"name":"AAAA...(255 ký tự)"}` | `OC-ADD-OK('A'×255)`: HTTP 2xx; lưu đủ 255 ký tự không bị cắt cụt (Q1) | HTTP 200: `{"message":"Category created","id":4}` \| Số danh mục: trước=3, sau=4; `len(name)=255` | Giống Lần 1 | **Pass** |  |
| **BV-TC05** | BVA B01 $\text{UB}+\delta$: Thêm danh mục vượt biên trên = 256 ký tự (`'A'×256`, theo Q1/Q8) | `POST /api/categories` với `{"name":"AAAA...(256 ký tự)"}` | `REJ-DATA` (`400`); `OC-NO` (theo giả định kỹ thuật Q1/Q8) | HTTP 200: `{"message":"Category created","id":4}` \| Chấp nhận chuỗi 256 ký tự (trước=3, sau=4) | Giống Lần 1 | **Fail** | — *(Câu hỏi mở Q1/Q8)* |
| **BV-TC06** | BVA B02 $\text{LB}$: Xóa danh mục tại biên dưới `id = 1` trên fixture `P_BVA_ID` (`1..5`) | `DELETE /api/categories/1` trên fixture 5 danh mục độc lập | `OC-DEL-OK(1)`: HTTP 2xx; bản ghi `id=1` bị xóa, còn đúng 4 bản ghi `{2, 3, 4, 5}` | HTTP 200: `{"message":"Category deleted"}` \| Số danh mục: trước=5, sau=4 (`{2, 3, 4, 5}` giữ nguyên) | Giống Lần 1 | **Pass** |  |
| **BV-TC07** | BVA B02 $\text{LB}+\delta$: Xóa danh mục tại sát biên dưới `id = 2` trên fixture `P_BVA_ID` (`1..5`) | `DELETE /api/categories/2` trên fixture 5 danh mục độc lập | `OC-DEL-OK(2)`: HTTP 2xx; bản ghi `id=2` bị xóa, còn đúng 4 bản ghi `{1, 3, 4, 5}` | HTTP 200: `{"message":"Category deleted"}` \| Số danh mục: trước=5, sau=4 (`{1, 3, 4, 5}` giữ nguyên) | Giống Lần 1 | **Pass** |  |
| **BV-TC08** | BVA B02 $\text{UB}-\delta$: Xóa danh mục tại sát biên trên `id = 4` trên fixture `P_BVA_ID` (`1..5`) | `DELETE /api/categories/4` trên fixture 5 danh mục độc lập | `OC-DEL-OK(4)`: HTTP 2xx; bản ghi `id=4` bị xóa, còn đúng 4 bản ghi `{1, 2, 3, 5}` | HTTP 200: `{"message":"Category deleted"}` \| Số danh mục: trước=5, sau=4 (`{1, 2, 3, 5}` giữ nguyên) | Giống Lần 1 | **Pass** |  |
| **BV-TC09** | BVA B02 $\text{UB}$: Xóa danh mục tại biên trên `id = 5` ($ID_{\max}$) trên fixture `P_BVA_ID` (`1..5`) | `DELETE /api/categories/5` trên fixture 5 danh mục độc lập | `OC-DEL-OK(5)`: HTTP 2xx; bản ghi `id=5` bị xóa, còn đúng 4 bản ghi `{1, 2, 3, 4}` | HTTP 200: `{"message":"Category deleted"}` \| Số danh mục: trước=5, sau=4 (`{1, 2, 3, 4}` giữ nguyên) | Giống Lần 1 | **Pass** |  |
| **BV-TC10** | BVA B02 $\text{UB}+\delta$: Xóa danh mục vượt biên trên `id = 6` ($ID_{\max}+1$) trên fixture `P_BVA_ID` (`1..5`) | `DELETE /api/categories/6` trên fixture 5 danh mục độc lập | `REJ-DATA` (`404 Not Found`); `OC-NO` (cả 5 bản ghi `{1, 2, 3, 4, 5}` giữ nguyên) | HTTP 200: `{"message":"Category deleted"}` \| **Trả về 200 OK dù `id=6` vượt ngoài cận trên `ID_max=5`!** | Giống Lần 1 | **Fail** | BUG-012 (Xóa ID vượt biên trên vẫn trả 200 OK) |
| **OB-TC01** | Output BVA $\text{LB}_{\text{out}} = 0$: Xóa hết danh mục về 0 bản ghi, kiểm tra API và Empty State trên Web Admin | Xóa toàn bộ danh mục $\rightarrow$ gọi `GET /api/categories` và mở tab `Danh mục` trên Playwright | (1) API trả `200 OK` với `[]`; (2) Web Admin hiển thị **Empty State** có icon/hình minh họa và thông báo thân thiện (FR-24) | API trả `200 OK` với `[]`, **nhưng giao diện Web Admin chỉ hiển thị tiêu đề bảng trống trơn, không có thông báo Empty State và không có icon/hình minh họa (`FR-24`)!** | Giống Lần 1 | **Fail** | BUG-013 (Thiếu giao diện Empty State FR-24 khi danh sách trống) |
| **SR-TC01** | Chuẩn hóa khoảng trắng đầu/cuối (`trim`) và trùng tên khác chữ hoa/thường (`"  thiết bị gia dụng thông minh  "`) | Tạo `NAME_NOM`, sau đó gửi tiếp `POST /api/categories` với `{"name":"  thiết bị gia dụng thông minh  "}` | Tự động `trim()` và từ chối trùng tên không phân biệt hoa/thường (`400`/`409`); không lưu khoảng trắng thừa | HTTP 200: `{"message":"Category created","id":5}` \| **Lưu nguyên chuỗi chưa `trim()` và cho phép trùng tên khác hoa/thường!** | Giống Lần 1 | **Fail** | BUG-010 (Thiếu `trim()` và kiểm tra trùng tên) |
| **SR-TC02** | Tương thích chuỗi Unicode tiếng Việt, ký tự đặc biệt (`&`, `-`, `()`) và Emoji (`🍜`) trên API & UI | `POST /api/categories` với `{"name":"Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)"}` và kiểm tra trên Playwright | HTTP 2xx; lưu trữ nguyên vẹn 100% chuỗi UTF-8 trong CSDL và hiển thị đúng trên Web Admin | HTTP 200 \| Lưu trữ nguyên vẹn 39 ký tự UTF-8 trong SQLite và hiển thị chính xác trên bảng Web Admin | Giống Lần 1 | **Pass** |  |
| **SR-TC03** | *(Ca phạm vi mở rộng)* Phòng chống SQL Injection trong trường `name` và tham số `:id` (SEC-05) | `POST` với `"Điện tử'); DROP TABLE categories; --"` và `DELETE /api/categories/1%20OR%201=1` | Xử lý an toàn bằng Parameterized Query: không lỗi 500, bảng `categories` không bị xóa mất dữ liệu | HTTP 200 \| Dùng Parameterized Query (`?`), không lỗi 500, bảng `categories` giữ nguyên toàn bộ dữ liệu | Giống Lần 1 | **Pass** |  |
| **SR-TC04** | *(Ca phạm vi mở rộng)* Gửi đồng thời 2 request tạo cùng một danh mục (Double Submit / Race Condition) | Bắn song song (`Promise.all`) 2 request `POST /api/categories` cùng tên `"Danh mục đồng thời"` | Chỉ có đúng 1 danh mục `"Danh mục đồng thời"` trong CSDL; không sinh 2 bản ghi trùng lặp | Status `[200, 200]` \| **Tạo ra 2 bản ghi trùng hệt tên `"Danh mục đồng thời"` (`id=4` và `id=5`)!** | Giống Lần 1 | **Fail** | BUG-010 (Race Condition tạo bản ghi danh mục trùng lặp) |
| **SR-TC05** | *(Ca phạm vi mở rộng)* Tính toàn vẹn liên hệ thống giữa Danh mục (FR-14) và Sản phẩm (FR-05/FR-15) sau khi gọi `DELETE /api/categories/1` | Ghi nhận sản phẩm thuộc `category_id=1`, gọi `DELETE /api/categories/1` rồi kiểm tra `GET /api/products` | Mọi sản phẩm trong `GET /api/products` phải luôn trỏ tới `category_id` hợp lệ đang tồn tại trong `GET /api/categories` | HTTP 200 \| **Sau khi xóa `id=1`, có 2 sản phẩm (`#1 "iPhone 15 Pro Max"`, `#2 "Samsung Galaxy S24 Ultra"`) bị mồ côi danh mục (`category_id=1` không còn tồn tại)!** | Giống Lần 1 | **Fail** | BUG-011 (Vi phạm toàn vẹn khóa ngoại liên hệ thống) |

---

### 3.2 Tổng kết thực thi

| Chỉ số | Lần 1 (`run_api_1` & `run_ui_1`) | Lần 2 (`run_api_2` & `run_ui_2`) |
|---|---:|---:|
| **Tổng số test case đã thiết kế** | **50** | **50** |
| **Pass** | **20** (40.0%) | **20** (40.0%) |
| **Fail** | **30** (60.0%) | **30** (60.0%) |
| **Blocked** | **0** (0%) | **0** (0%) |
| **Not run** | **0** (0%) | **0** (0%) |

**Độ ổn định (Flakiness Verification):** 100% test case cho kết quả nhất quán tuyệt đối giữa Lần 1 và Lần 2:
- **20 ca Pass ổn định:**
  - *API & Bảo mật (18 ca):* `EP-TC01` (`GET /api/categories`), `EP-TC02` (`POST` hợp lệ), `EP-TC03` (`DELETE` hợp lệ), `EP-TC04` (`PUT` hợp lệ), `EP-TC05`–`EP-TC07` (từ chối khi thiếu/sai token JWT), `EP-TC18` (lưu và escape chuỗi XSS an toàn theo `SEC-04`), `BV-TC01`–`BV-TC04` (biên hợp lệ độ dài `name` tại $1, 2, 254, 255$ ký tự), `BV-TC06`–`BV-TC09` (biên hợp lệ mã `:id` tại $1, 2, 4, 5$), `SR-TC02` (Unicode/Emoji trên API & UI), `SR-TC03` (chống SQL Injection bằng Parameterized Query theo `SEC-05`).
  - *Giao diện Web Admin (2 ca):* `EP-TC29` (luồng Thêm và Xóa danh mục hợp lệ trên UI), `EP-TC33` (nút `"Thêm mới"` màu xanh dương và nút `"Xóa"` màu đỏ đúng chuẩn `FR-21`).
- **30 ca Fail ổn định:** Phát hiện chính xác 5 nhóm lỗi kỹ thuật cốt lõi (từ bảo mật phân quyền RBAC, thiếu kiểm tra rỗng/trùng tên, vi phạm khóa ngoại sản phẩm–danh mục, phản hồi sai mã HTTP `200 OK` khi xóa/sửa `:id` không tồn tại, đến các vi phạm tiêu chuẩn giao diện `FR-21`/`FR-22`/`FR-24`).
- **0 ca Flaky / 0 ca Blocked.**

---

### 3.3 Phân tích ca Fail (giai đoạn B — được đọc mã nguồn sau khi Fail, quy định §4)

Sau khi toàn bộ 50 ca kiểm thử đã thực thi thực tế và ghi nhận 30 ca Fail ổn định qua 2 lần chạy độc lập, theo đúng quy định kiểm thử hộp đen (§4), chúng tôi tiến hành rà soát mã nguồn SUT ([backend/server.js](file:///d:/KCPM/eshop-sut/backend/server.js), [backend/database.js](file:///d:/KCPM/eshop-sut/backend/database.js) và [frontend-admin/src/App.jsx](file:///d:/KCPM/eshop-sut/frontend-admin/src/App.jsx)) để xác định nguyên nhân gốc rễ (`file:line`):

#### 1. Lỗ hổng thiếu kiểm tra phân quyền Admin (Broken Access Control — RBAC) (`SEC-03`, `FR-12`)
- **Tệp:** [backend/server.js](file:///d:/KCPM/eshop-sut/backend/server.js#L104-L114), [backend/server.js](file:///d:/KCPM/eshop-sut/backend/server.js#L253-L282) và [frontend-admin/src/App.jsx](file:///d:/KCPM/eshop-sut/frontend-admin/src/App.jsx#L7-L59).
- **Đoạn mã gây lỗi trong `backend/server.js` (dòng 104–114 & 253–282):**
  ```javascript
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };
  // ...
  app.post("/api/categories", authenticateToken, (req, res) => { ... });
  app.put("/api/categories/:id", authenticateToken, (req, res) => { ... });
  app.delete("/api/categories/:id", authenticateToken, (req, res) => { ... });
  ```
- **Nguyên nhân gốc:**
  - Ở tầng Backend: Các route thay đổi dữ liệu danh mục (`POST`, `PUT`, `DELETE /api/categories`) chỉ gắn middleware `authenticateToken` (kiểm tra chữ ký JWT hợp lệ) mà **hoàn toàn thiếu bước kiểm tra vai trò `if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })`**. Bất kỳ tài khoản người dùng thường nào (`role = 'user'`, như `test@eshop.com`) đều có thể thêm mới, sửa tên hoặc xóa sạch toàn bộ danh mục của hệ thống (`EP-TC08`, `EP-TC09`, `EP-TC10`).
  - Ở tầng Giao diện Web Admin (`frontend-admin/src/App.jsx:7, 34-59`): Khi trang tải lại, ứng dụng chỉ đọc `const [token, setToken] = useState(localStorage.getItem("adminToken") || "")` và kiểm tra `if (!token)` ở dòng 188 mà không xác minh `role === 'admin'`. Kết hợp với việc các API `/api/admin/users` (`server.js:498`) và `/api/admin/orders` (`server.js:514`) cũng thiếu kiểm tra `role === 'admin'`, người dùng `role = 'user'` mở được toàn bộ giao diện Quản lý Danh mục trên Web Admin (`EP-TC28`).

#### 2. Lỗi thiếu toàn bộ kiểm tra hợp lệ trường `name` và không chặn trùng lặp danh mục (`FR-14`, `FR-22`, `Q2`, `Q3`, `Q7`)
- **Tệp:** [backend/server.js](file:///d:/KCPM/eshop-sut/backend/server.js#L253-L271), [backend/database.js](file:///d:/KCPM/eshop-sut/backend/database.js#L25-L28) và [frontend-admin/src/App.jsx](file:///d:/KCPM/eshop-sut/frontend-admin/src/App.jsx#L142-L151).
- **Đoạn mã gây lỗi trong `backend/server.js` (dòng 253–271) & `database.js` (dòng 25–28):**
  ```javascript
  // backend/database.js:25-28
  db.run(`CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
  )`);

  // backend/server.js:253-259
  app.post("/api/categories", authenticateToken, (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO categories (name) VALUES (?)", [name], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Category created", id: this.lastID });
    });
  });
  ```
- **Nguyên nhân gốc:**
  - Cả `POST /api/categories` lẫn `PUT /api/categories/:id` đều **không có bất kỳ dòng kiểm tra đầu vào nào** trước khi thực thi SQL: không kiểm tra `typeof name === 'string'` (`EP-TC15` cho phép số `12345`, `EP-TC12`/`EP-TC16` cho phép `undefined`/`null`), không gọi `.trim()` và không kiểm tra độ dài rỗng (`EP-TC11`, `EP-TC13`, `EP-TC25`, `EP-TC26`, `SR-TC01`), cũng không giới hạn độ dài tối đa (`EP-TC14`, `BV-TC05`).
  - Bảng `categories` trong `database.js:25-28` không khai báo `NOT NULL` và không khai báo `UNIQUE` cho cột `name`, đồng thời handler không kiểm tra tên đã tồn tại, dẫn đến việc tạo trùng lặp danh mục cùng tên hoặc tạo 2 bản ghi trùng hệt nhau khi Double Submit (`EP-TC17`, `SR-TC01`, `SR-TC04`).
  - Trên giao diện `frontend-admin/src/App.jsx:142-151, 298-307`, hàm `handleCategorySubmit` gửi thẳng `{ name: categoryName }` lên API mà không kiểm tra `categoryName.trim()`, và thẻ `<input>` (dòng 298) thiếu thuộc tính `required`, khiến người dùng bấm `"Thêm mới"` khi ô trống vẫn tạo ra dòng danh mục rỗng trên bảng (`EP-TC31`).

#### 3. Lỗi xóa danh mục đang có sản phẩm tham chiếu gây mồ côi dữ liệu sản phẩm (`FR-14`, `FR-15`, `R5`, `Q5`)
- **Tệp:** [backend/server.js](file:///d:/KCPM/eshop-sut/backend/server.js#L273-L282) và [backend/database.js](file:///d:/KCPM/eshop-sut/backend/database.js#L66-L73).
- **Đoạn mã gây lỗi trong `backend/server.js` (dòng 273–282):**
  ```javascript
  app.delete("/api/categories/:id", authenticateToken, (req, res) => {
    db.run(
      "DELETE FROM categories WHERE id = ?",
      [req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Category deleted" });
      },
    );
  });
  ```
- **Nguyên nhân gốc:**
  - Khi xóa danh mục, backend không truy vấn bảng `products` (`SELECT COUNT(*) FROM products WHERE category_id = ?`) để chặn xóa danh mục đang chứa sản phẩm; mặt khác bảng `products` trong `database.js:66-73` cũng không khai báo ràng buộc `FOREIGN KEY (category_id) REFERENCES categories(id)` và không bật `PRAGMA foreign_keys = ON`. Hệ quả là khi xóa danh mục `id = 1` (`"Điện thoại"`), 2 sản phẩm `#1 "iPhone 15 Pro Max"` và `#2 "Samsung Galaxy S24 Ultra"` bị mất danh mục cha và trở thành bản ghi mồ côi (`EP-TC23`, `SR-TC05`).

#### 4. Lỗi luôn trả về `200 OK` khi `DELETE` hoặc `PUT` trên `:id` không tồn tại / sai kiểu (`FR-14`, `Q6`, `Q7`)
- **Tệp:** [backend/server.js](file:///d:/KCPM/eshop-sut/backend/server.js#L261-L282).
- **Nguyên nhân gốc:**
  - Trong callback `function (err)` của `db.run("UPDATE categories SET name = ? WHERE id = ?", ...)` và `db.run("DELETE FROM categories WHERE id = ?", ...)`, lập trình viên bỏ quên kiểm tra `if (this.changes === 0) return res.status(404).json({ error: "Category not found" })` và không kiểm tra `:id` có phải số nguyên dương hay không. Do đó mọi thao tác xóa hoặc cập nhật trên `:id` không tồn tại (`999999`, `6`), ngoài miền (`0`, `-5`), sai kiểu (`"abc"`), hoặc xóa lặp lần 2 đều trả về `HTTP 200 OK` (`EP-TC19`, `EP-TC20`, `EP-TC21`, `EP-TC22`, `EP-TC24`, `EP-TC27`, `BV-TC10`).

#### 5. Lỗi giao diện Quản lý Danh mục vi phạm quy chuẩn UI/UX (`FR-21`, `FR-22`, `FR-24`)
- **Tệp:** [frontend-admin/src/App.jsx](file:///d:/KCPM/eshop-sut/frontend-admin/src/App.jsx#L195-L335).
- **Nguyên nhân gốc:**
  - Tại `App.jsx:297-308`, form thêm danh mục chỉ có thẻ `<input placeholder="Tên danh mục mới">` mà hoàn toàn không có thẻ `<label>` và không có ký hiệu dấu `*` cho trường bắt buộc (`EP-TC30`, vi phạm `FR-22` dòng 252); đồng thời không có vùng hiển thị thông báo lỗi phía trên nút Submit khi nhập liệu không hợp lệ (`EP-TC32`, vi phạm `FR-22` dòng 255).
  - Tại `App.jsx:195-211, 231, 278`, giao diện sử dụng tiếng Anh lẫn lộn với tiếng Việt (`"Dashboard"` trên thanh menu trái, `"Admin Login"`, `"Password"`, `"Login"` ở màn hình đăng nhập), vi phạm `FR-21` dòng 244 (`EP-TC34`).
  - Tại `App.jsx:309-333`, khi mảng `categories` rỗng (`0` phần tử), giao diện chỉ render bảng trống không có dòng nào mà không hiển thị trạng thái trống (**Empty State**) kèm icon/hình minh họa và thông báo hướng dẫn người dùng (`OB-TC01`, vi phạm `FR-24` dòng 269).

---

### 3.4 Bảng dữ kiện ứng viên bug (chuẩn bị cho Bug_Report.md)

Theo quy định môn học, bảng dưới đây tổng hợp các dữ kiện kỹ thuật khách quan của các nhóm lỗi Fail ổn định trên SUT đối với **FR-14** (đánh mã tiếp nối từ `BUG-009` đến `BUG-013`) để sinh viên trực tiếp sử dụng khi tự viết báo cáo lỗi trong [reports/Bug_Report.md](file:///d:/KCPM/eshop-sut/reports/Bug_Report.md):

| Bug ID ứng viên | Tên nhóm lỗi kỹ thuật | Mức độ nghiêm trọng | Các test case kích hoạt lỗi | Tệp & Dòng mã nguồn (Root Cause) | Dữ liệu đầu vào tái hiện | Lệnh tái hiện kiểm thử (cURL / PowerShell) |
|---|---|---|---|---|---|---|
| **BUG-009** | Lỗ hổng bảo mật Thiếu kiểm tra phân quyền Admin (Broken Access Control — RBAC) trên các API và giao diện Quản lý Danh mục (`SEC-03`, `FR-12`) | **Critical** (Bảo mật) | `EP-TC08`, `EP-TC09`, `EP-TC10`, `EP-TC28` | `backend/server.js:104-114, 253-282`<br>`frontend-admin/src/App.jsx:7, 34-59` | Đăng nhập tài khoản thường `test@eshop.com` (`role = 'user'`) rồi gọi `POST`/`PUT`/`DELETE /api/categories` hoặc mở Web Admin | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_user>" } -ContentType 'application/json' -Body '{"name":"Danh mục trái phép"}' -SkipHttpErrorCheck` |
| **BUG-010** | Thiếu toàn bộ kiểm tra hợp lệ trường `name` (rỗng, khoảng trắng, `null`, kiểu số) và cho phép tạo danh mục trùng lặp (`FR-14`, `FR-22`, `Q2`, `Q3`, `Q7`) | **High** (Nghiêm trọng) | `EP-TC11`, `EP-TC12`, `EP-TC13`, `EP-TC15`, `EP-TC16`, `EP-TC17`, `EP-TC25`, `EP-TC26`, `EP-TC31`, `SR-TC01`, `SR-TC04` *(EP-TC14 và BV-TC05 phụ thuộc giả định Q1/Q8 nên được ghi là câu hỏi mở, không tính là ca kích hoạt)* | `backend/server.js:253-271`<br>`backend/database.js:25-28`<br>`frontend-admin/src/App.jsx:142-151, 298-307` | Gửi `{"name": ""}`, `{}`, `{"name": "     "}`, `{"name": 12345}`, `{"name": null}` hoặc gửi trùng tên 2 lần | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{ Authorization = "Bearer <token_admin>" } -ContentType 'application/json' -Body '{"name":""}' -SkipHttpErrorCheck` |
| **BUG-011** | Cho phép xóa danh mục đang có sản phẩm tham chiếu gây mồ côi dữ liệu sản phẩm (Foreign Key Integrity Violation — `FR-14`, `FR-15`, `R5`) | **High** (Toàn vẹn dữ liệu) | `EP-TC23`, `SR-TC05` | `backend/server.js:273-282`<br>`backend/database.js:66-73` | Gọi `DELETE /api/categories/1` khi danh mục `id = 1` đang có 2 sản phẩm tham chiếu | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/1" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` $\rightarrow$ kiểm tra `GET /api/products` thấy 2 sản phẩm mồ côi danh mục |
| **BUG-012** | Thao tác `DELETE` và `PUT` trên `:id` không tồn tại hoặc sai kiểu dữ liệu vẫn trả về `200 OK` thay vì `400`/`404` (`FR-14`, `Q6`, `Q7`) | **Medium** (Hợp đồng API) | `EP-TC19`, `EP-TC20`, `EP-TC21`, `EP-TC22`, `EP-TC24`, `EP-TC27`, `BV-TC10` | `backend/server.js:261-282` | Gọi `DELETE` hoặc `PUT` với `:id = 999999`, `6`, `0`, `-5`, `"abc"` hoặc xóa lặp lần 2 | `Invoke-WebRequest -Uri "http://localhost:3000/api/categories/999999" -Method DELETE -Headers @{ Authorization = "Bearer <token_admin>" } -SkipHttpErrorCheck` |
| **BUG-013** | Giao diện Quản lý Danh mục trên Web Admin thiếu nhãn `*`, thiếu vùng thông báo lỗi phía trên nút Submit, pha trộn tiếng Anh và thiếu Empty State (`FR-21`, `FR-22`, `FR-24`) | **Medium** (UI/UX) | `EP-TC30`, `EP-TC32`, `EP-TC34`, `OB-TC01` | `frontend-admin/src/App.jsx:195-211, 231, 297-333` | Mở tab `Quản lý Danh mục` trên `http://localhost:5174`, kiểm tra form, menu `"Dashboard"` và xóa hết danh mục về 0 | Mở `http://localhost:5174` $\rightarrow$ quan sát ô nhập không có `<label>`/`*`, không hiện lỗi khi bấm `"Thêm mới"` rỗng, menu ghi `"Dashboard"` và bảng trống không có Empty State. |

---

## 4. AI Gap Analysis — FR-14: Quản lý Danh mục (Category CRUD)

### 4.1. Cách phát hiện khoảng trống

- **So sánh bộ test case ban đầu với bộ sau Human Review:** Bộ AI sinh ban đầu có **45 ca duy nhất**, gồm 34 ca EP (`EP-TC01`–`EP-TC34`), 10 ca BVA đầu vào mới (`BV-TC01`–`BV-TC10`, kết hợp 3 vector tái sử dụng từ EP) và 1 ca BVA biên đầu ra (`OB-TC01`). Sau Human Review, sinh viên bổ sung **5 ca chuyên sâu (`SR-TC01`–`SR-TC05`)**, nâng tổng số ca FR-14 lên **50 ca**.
- **So sánh bug thực tế với phạm vi AI dự đoán:** Bộ 45 ca của AI đã bao phủ đầy đủ và phát hiện trực tiếp cả 5 nhóm lỗi chính của FR-14 (`BUG-009` đến `BUG-013`: thiếu phân quyền RBAC trên API & UI, thiếu kiểm tra hợp lệ `name` và trùng tên nguyên văn, cho phép xóa danh mục đang có sản phẩm, trả `200 OK` khi xóa/sửa `:id` không tồn tại, và vi phạm tiêu chuẩn giao diện `FR-21`/`FR-22`/`FR-24`). Tuy nhiên, 3 ca `SR-TC01`, `SR-TC04` và `SR-TC05` do sinh viên bổ sung đã phát hiện thêm **3 khía cạnh lỗi chiều sâu** của `BUG-010` và `BUG-011` mà bộ AI ban đầu chưa bao quát:
  - `SR-TC01`: Hệ thống không `trim()` khoảng trắng đầu/cuối và không kiểm tra trùng tên khác chữ hoa/thường (`"  thiết bị gia dụng thông minh  "`).
  - `SR-TC04`: Lỗi xung đột đồng thời (Race Condition / Double Submit) khi gửi 2 request `POST /api/categories` song song tạo ra 2 bản ghi trùng hệt tên (`id = 4` và `id = 5`).
  - `SR-TC05`: Hậu quả lan truyền liên thành phần sang endpoint `GET /api/products` (FR-05/FR-15) khi xóa danh mục `id = 1` khiến 2 sản phẩm `#1 "iPhone 15 Pro Max"` và `#2 "Samsung Galaxy S24 Ultra"` trở thành bản ghi mồ côi danh mục.
- **Đối chiếu bài giảng và đặc tả:** Rà soát lại toàn bộ các lớp đầu ra (`EC29`–`EC34`), biên ngoài miền (`0` ký tự, `256` ký tự, `id = 0`, `id = 6`), biên đầu ra (`OB-TC01` với `0` danh mục), chế độ BVA Robustness ($6n+1 = 13$) và số âm (`EP-TC21` với `:id = -5`). Bộ AI ban đầu đã đáp ứng trọn vẹn các tiêu chí hình thức của bài giảng Bài 4; các khoảng trống còn lại tập trung ở chuẩn hóa biến thể chuỗi kết hợp, tương tác đồng thời và kiểm tra toàn vẹn dữ liệu liên endpoint.

### 4.2. Bảng khoảng trống

| STT | Test case / Bug AI bỏ sót | Cách phát hiện | Nhóm (A/B/C) | Vì sao AI bỏ sót | Bài học / Cải tiến prompt |
|---|---|---|---|---|---|
| 1 | `SR-TC01` (khía cạnh chuẩn hóa `trim` + case-insensitive của `BUG-010`): gửi `"  thiết bị gia dụng thông minh  "` trùng với `"Thiết bị gia dụng thông minh"` | Sinh viên rà soát tổ hợp hai biến thể chuỗi của `EC11`/`EC15` và đối chiếu `Q2`, `Q3` | **B** (Giới hạn công cụ AI) | AI chia lớp tương đương đơn chiều (`EC11` chỉ gồm khoảng trắng `"     "`, `EC15` trùng nguyên văn `NAME_NOM`), nhưng chưa tự động tổ hợp khoảng trắng bao quanh đầu/cuối với việc đổi chữ hoa/thường để kiểm tra chuẩn hóa trước khi so khớp trùng lặp. | Yêu cầu AI khi kiểm tra tính duy nhất của chuỗi văn bản phải luôn sinh thêm ca kết hợp khoảng trắng đầu/cuối (`leading/trailing spaces`) và khác biệt hoa/thường (`case-insensitive`). |
| 2 | `SR-TC02`: chuỗi tên danh mục chứa tiếng Việt tổ hợp, ký tự phân cách hợp lệ (`&`, `-`, `()`) và Emoji (`🍜`) trên cả API lẫn UI | Sinh viên rà soát khả năng tương thích UTF-8 đa byte và hiển thị ký tự `&` trên bảng DOM Web Admin | **A** (Chất lượng prompt) | Prompt thiết kế ban đầu chỉ yêu cầu chuỗi hợp lệ danh định (`NAME_NOM`), chuỗi quá dài và chuỗi XSS (`<img ...>`), chưa nêu rõ yêu cầu kiểm tra các ký tự phân cách thương mại hợp lệ (`&`, `/`, `-`) và biểu tượng Emoji trong tên danh mục. | Trong prompt thiết kế EP, liệt kê rõ các nhóm chuỗi hợp lệ đặc thù của nghiệp vụ thương mại điện tử: tiếng Việt có dấu, ký tự `&`, `/`, `-`, `()` và Emoji. |
| 3 | `SR-TC03`: phòng chống SQL Injection trong trường `name` và tham số `:id` (`SEC-05`) | Sinh viên đối chiếu mục 9 `README.md` (`SEC-05` dòng 282) với các câu lệnh SQL `INSERT` và `DELETE` trên bảng `categories` | **A** (Chất lượng prompt) | Ở bước thiết kế EP/BVA thuần túy, AI ưu tiên `SEC-02`, `SEC-03` (phân quyền RBAC) và `SEC-04` (XSS trên UI) nên chưa tách riêng test case kiểm chứng Parameterized Query cho `SEC-05`. | Yêu cầu AI lập bảng truy vết đầy đủ toàn bộ các điều khoản bảo mật (`SEC-01`–`SEC-07`) có liên quan tới từng biến đầu vào văn bản và tham số URL. |
| 4 | `SR-TC04` (khía cạnh Race Condition của `BUG-010`): gửi đồng thời 2 request `POST /api/categories` cùng tên tạo ra 2 bản ghi trùng lặp (`id=4, 5`) | Sinh viên rà soát hành vi bấm đúp nút `"Thêm mới"` hoặc gửi 2 request song song (`Promise.all`) trong cùng mili-giây | **C** (Độ phức tạp tính năng) | `EP-TC17` của AI chỉ gửi 2 request tuần tự (request 1 hoàn tất mới gửi request 2). Phân tích hộp đen tĩnh theo từng request rời rạc không mô hình hóa được tranh chấp đồng thời (concurrency) khi thiếu khóa `UNIQUE` dưới SQLite. | Yêu cầu AI bổ sung kịch bản kiểm thử đồng thời (`Promise.all`) cho mọi thao tác khởi tạo tài nguyên có ràng buộc duy nhất. |
| 5 | `SR-TC05` (khía cạnh lan truyền liên thành phần của `BUG-011`): xóa danh mục `id=1` làm 2 sản phẩm `#1` và `#2` trong `GET /api/products` bị mồ côi danh mục | Sinh viên mở rộng phạm vi Oracle từ bảng `categories` sang endpoint `GET /api/products` (FR-05/FR-15) sau khi gọi `DELETE /api/categories/1` | **C** (Độ phức tạp tính năng) | Trong `EP-TC23`, AI đã kiểm tra việc xóa `id = 1` đang có sản phẩm tham chiếu, nhưng Oracle của AI chỉ dừng ở trạng thái của bảng `categories`, chưa kiểm tra tác động dây chuyền sang danh sách sản phẩm ở endpoint liên thông `GET /api/products`. | Với các thực thể cha–con có quan hệ khóa ngoại (Danh mục – Sản phẩm), yêu cầu AI thiết lập Oracle liên endpoint để kiểm tra tính toàn vẹn của thực thể con sau khi xóa/sửa thực thể cha. |

*Chú giải: **A** — chất lượng prompt · **B** — giới hạn công cụ AI · **C** — độ phức tạp của tính năng.*

### 4.3. Thống kê

- **Số ca AI sinh ban đầu:** 45 ca duy nhất (34 EP + 10 BVA đầu vào mới + 1 BVA biên đầu ra).
- **Số ca sinh viên bổ sung sau Human Review:** 5 ca (`SR-TC01`–`SR-TC05`), tương đương 10,0% tổng bộ 50 ca.
- **Tổng số ca đã thực thi:** 50 ca; 20 Pass (40,0%), 30 Fail (60,0%), 0 Blocked, 0 Not run; hai lần chạy độc lập cho kết quả nhất quán 100% (0% flakiness).
- **Số nhóm ứng viên bug của FR-14:** 5 nhóm (`BUG-009`–`BUG-013`).
- **Bug / Khía cạnh lỗi do Human Review phát hiện thêm:** Cả 5 nhóm lỗi chính đều đã được bộ 45 ca của AI phát hiện, trong đó 3 ca `SR-TC01`, `SR-TC04` và `SR-TC05` của sinh viên phát hiện thêm 3 cơ chế lỗi chiều sâu (thiếu `trim()` + trùng tên khác hoa/thường trong `BUG-010`, Race Condition tạo bản ghi trùng lặp trong `BUG-010`, và sản phẩm mồ côi danh mục trên `GET /api/products` trong `BUG-011`).
- **Phân bố nguyên nhân của 5 khoảng trống:** A = 2, B = 1, C = 2.

### 4.4. Cải tiến prompt cho lần sau

1. **Yêu cầu tổ hợp chuẩn hóa chuỗi khi kiểm tra tính duy nhất (`UNIQUE`):** Không chỉ gửi lại đúng chuỗi nguyên văn vừa tạo, mà phải kiểm tra thêm biến thể có khoảng trắng đầu/cuối (`"  ...  "`) và biến thể đổi chữ hoa/thường.
2. **Yêu cầu kiểm thử đồng thời (Concurrency / Double Submit) cho thao tác tạo mới:** Với các chức năng thêm mới danh mục, sản phẩm hoặc mã giảm giá, luôn yêu cầu thêm kịch bản bắn song song 2 request (`Promise.all`) để xác minh ràng buộc toàn vẹn ở tầng CSDL.
3. **Yêu cầu thiết lập Oracle liên endpoint cho quan hệ khóa ngoại:** Khi kiểm thử thao tác xóa/cập nhật thực thể cha (`categories`), bắt buộc kiểm tra trạng thái thực thể con (`GET /api/products`) để phát hiện dữ liệu mồ côi.
4. **Lập bảng đối chiếu đầy đủ các điều khoản bảo mật (`SEC-01`–`SEC-07`) và họ ký tự Unicode:** Đảm bảo mọi trường văn bản và tham số định danh đều được kiểm tra rõ ràng với cả XSS (`SEC-04`), SQL Injection (`SEC-05`) và chuỗi Unicode/Emoji hợp lệ.

### 4.5. Kết luận

Bộ kiểm thử ban đầu gồm 45 ca do AI thiết kế cho FR-14 đã bao phủ rất chặt chẽ các lớp tương đương hợp lệ/không hợp lệ, phân quyền RBAC đối xứng trên cả 3 phương thức ghi (`POST`, `PUT`, `DELETE`), 13 vector biên BVA Robustness ($6n+1$), biên đầu ra Empty State (`OB-TC01`) và các tiêu chuẩn giao diện Web Admin (`FR-12`, `FR-21`–`FR-24`). Nhờ vậy, bộ ca của AI đã phát hiện đầy đủ cả 5 nhóm lỗi cốt lõi (`BUG-009`–`BUG-013`). Khoảng trống chỉ xuất hiện ở các kịch bản đòi hỏi sự kết hợp nhiều phép biến đổi chuỗi (`trim` + hoa/thường), tương tác đồng thời (`Promise.all`) và truy vết tác động chéo sang mô-đun sản phẩm (`GET /api/products`). Quá trình Human Review bổ sung 5 ca `SR-TC01`–`SR-TC05` đã lấp đầy trọn vẹn các khoảng trống này và cung cấp bằng chứng kỹ thuật sâu sắc hơn cho báo cáo lỗi.





