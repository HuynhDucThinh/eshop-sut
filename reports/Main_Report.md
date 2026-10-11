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

**Giải thích:** dùng cả bốn dạng điều kiện — *dải* (độ dài OTP, độ dài mật khẩu → 2 lớp lỗi dưới/trên), *giá trị đơn* (khớp mã, V5 = V4), *tập giá trị* (ký tự đặc biệt ∈ 7 ký tự), *boolean/kiểu* (định dạng email, ký tự số). Mỗi nhóm ký tự mật khẩu tách lớp riêng vì lỗi nghiệp vụ khác nhau (cô lập 1 lỗi/ca). Ba ràng buộc chéo R1, R2, R3 được sinh lớp riêng (EC25, EC11, EC12). Chưa tách “khoảng trắng”, “chữ hoa/thường của email” vì đặc tả không nêu → xem mục *Ca bổ sung* bên dưới.

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

**Giải thích:** hai ca hợp lệ (TC01 cho bước 1; TC02 gộp mọi lớp hợp lệ của bước 2 và chạy qua UI vì V5 chỉ tồn tại trên UI). Mọi ca âm chỉ sai **đúng một** điều kiện (OTP chuẩn `OTP_T`, mk và email hợp lệ cho các biến còn lại). Ca EP-TC12 cần thao tác 2 lần để tạo trạng thái “OTP đã dùng”. Ca API hợp lệ của bước 2 được thay bằng `BV-TC01` (nominal) để tránh trùng input.

### Truy vết EC → Test case

| EC ID | Test case phủ | EC ID | Test case phủ | EC ID | Test case phủ |
|---|---|---|---|---|---|
| EC01 | TC01, TC02 | EC11 | TC11 | EC21 | TC19 |
| EC02 | TC03 | EC12 | TC12 | EC22 | TC20 |
| EC03 | TC04 | EC13 | TC02 | EC23 | TC21 |
| EC04 | TC05 | EC14 | TC13 | EC24 | TC02 |
| EC05 | TC02 | EC15 | TC02 | EC25 | TC22 |
| EC06 | TC06 | EC16 | TC14 | EC26 | TC23 |
| EC07 | TC07 | EC17 | TC15 | EC27 | TC01, TC02 |
| EC08 | TC08 | EC18 | TC16 | EC28 | TC03–TC05 |
| EC09 | TC09 | EC19 | TC17 | EC29 | TC02 |
| EC10 | TC10 | EC20 | TC18 | EC30 | TC06–TC23 |

### Báo cáo độ phủ

- Số điều kiện đã phân tích: 5 biến (V1–V5) + 3 ràng buộc chéo (R1–R3) + 4 lớp đầu ra
- Lớp EP: **5 hợp lệ + 21 không hợp lệ + 4 lớp đầu ra = 30**
- Lớp đã phủ: 30 / 30 (các EC *đã biết*; không đồng nghĩa phủ toàn bộ hành vi)
- Số test case EP: **23** (API 20, UI 3); đã loại trùng: 0
- Câu hỏi mở / mơ hồ: Q1 (max 128), Q2 (tập ký tự), Q3 (thời hạn OTP **chưa** có ca vì thiếu giá trị), Q4 (mã lỗi); route UI = `TBD`

---

## 2. Boundary Value Analysis — FR-03: Quên mật khẩu & Đặt lại mật khẩu

**Chế độ BVA:** Robustness (6n + 1)
**Lý do chọn chế độ:** theo yêu cầu của sinh viên và mặc định của skill: cần cả biên hợp lệ lẫn ngoài miền. Chỉ có n = 2 biến *có thứ tự* (độ dài mật khẩu, độ dài OTP) và hai biến này không tương tác nên Worst-case (5² = 25) là không cần thiết. Email và xác nhận mật khẩu không có thứ tự → chỉ dùng EP.
**Ngày thiết kế:** 2026-10-11

### Bước 1 — Xác định phân vùng có thứ tự và các cận

| B ID | Biến | Ràng buộc (trích đặc tả) | LB | UB | Loại cận LB | Loại cận UB | δ | Nominal | Nguồn |
|---|---|---|---|---|---|---|---|---|---|
| B01 | Độ dài `newPassword` | ≥ 8 ký tự; max `unspecified` → giả định 128 (Q1) | 8 | 128 *(giả định)* | Đóng | Đóng | 1 ký tự | 11 (`NewPass123!`) | README 34; Q1 |
| B02 | Độ dài `resetToken` | đúng 6 chữ số | 6 | 6 | Đóng | Đóng | 1 ký tự | 6 (`OTP_T`) | README 51 |

**Giải thích:** độ dài chuỗi nên δ = 1 ký tự; “tối thiểu 8” là cận đóng (8 hợp lệ, 7 không). B02 có LB = UB nên miền co thành một điểm. Mật khẩu thử đều chứa đủ 4 nhóm ký tự (hoa, thường, số, `!`) để chỉ độ dài là yếu tố thay đổi.

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

Đặc tả không nêu quan hệ định lượng input → output (không có ngưỡng) nên **không** có biên đầu ra để sinh ca. Không bịa thêm.

### Bước 5 — Ca bổ sung do sinh viên (sau Human Review)

| TC ID | Lý do bổ sung | Dữ liệu vào | Kết quả mong đợi |
|---|---|---|---|
| **SR-TC01** | Kiểm tra xử lý OTP có chữ số `0` ở đầu (Leading zero): phòng ngừa lỗi backend parse OTP dạng số nguyên `Number(otp)` khiến chuỗi `012345` bị biến thành `12345` dẫn tới sai độ dài. | `email=test@eshop.com`, `resetToken="012345"`, `newPassword="NewPass123!"` | Hệ thống xử lý đúng chuỗi 6 ký tự số; nếu OTP do hệ thống sinh có số 0 đầu thì vẫn chấp nhận thành công; nếu không khớp thì từ chối hợp lệ (không lỗi server 500). |
| **SR-TC02** | Vô hiệu hóa OTP cũ khi sinh OTP mới (Re-issue OTP invalidation): kiểm tra tính duy nhất và an toàn khi người dùng bấm xin mã lần 2. | Bước 1: Yêu cầu OTP cho `test@eshop.com` lấy `OTP_1`. Bước 2: Yêu cầu tiếp OTP cho `test@eshop.com` lấy `OTP_2`. Bước 3: Dùng `OTP_1` để reset mật khẩu. | `OTP_1` phải bị vô hiệu hóa ngay khi `OTP_2` được tạo; request dùng `OTP_1` bị từ chối (`REJ`), chỉ `OTP_2` mới hợp lệ. |
| **SR-TC03** | Mật khẩu mới chứa ký tự khoảng trắng (Whitespace boundary): kiểm tra hệ thống có xử lý khoảng trắng như ký tự hợp lệ hay trim bỏ. | `email=test@eshop.com`, `resetToken=OTP_T`, `newPassword="New Pass123!"` (có space ở giữa) | Hệ thống chấp nhận (hoặc từ chối đồng nhất giữa UI & Backend); không gây lỗi parse chuỗi. |
| **SR-TC04** | Email không phân biệt chữ hoa/chữ thường (Case-insensitivity): kiểm tra chuẩn RFC và độ tương thích khi người dùng gõ hoa/thường lẫn lộn giữa bước 1 và bước 2. | Bước 1: Yêu cầu OTP với `TEST@ESHOP.COM`. Bước 2: Đặt lại mật khẩu với `test@eshop.com`, `resetToken=OTP_T`. | Bước 1 chấp nhận và sinh OTP; Bước 2 nhận diện cùng một tài khoản và đổi mật khẩu thành công (`2xx`). |

### Tổng kết

- Chế độ: Robustness; n = 2
- Số ca theo công thức: **13**
- Số ca thực tế duy nhất: **9**
- Số ca đã loại trùng: **4** (OTP=6 từ LB và UB trùng nominal BV-TC01; OTP=5 từ UB−δ trùng LB−δ; OTP=7 từ LB+δ trùng UB+δ)
- Vấn đề oracle / mơ hồ chưa giải quyết: cận trên 128 (Q1) là giả định; mã lỗi `unspecified`; OTP ngẫu nhiên nên nominal `OTP_T` phải lấy động ở lúc chạy.

---

## Tổng hợp số lượng test case đã thiết kế (chưa chạy)

| Nhóm | Số ca | Trạng thái |
|---|---:|---|
| EP (EP-TC01…23) | 23 | Not run |
| BVA (BV-TC01…09) | 9 | Not run |
| Ca bổ sung sinh viên (SR-TC01…04) | 4 | Not run |
| **Tổng** | **36** | Not run |
