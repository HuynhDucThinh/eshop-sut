<!-- Sinh tự động bởi run_fr03.js lúc 2026-10-13T01:45:40.611Z -->
**Tổng:** 45 · **Pass:** 24 · **Fail:** 20 · **Blocked:** 1 · **Not run:** 0

| TC ID | Mong đợi | Thực tế | Trạng thái | Ghi chú / Lý do |
|---|---|---|---|---|
| EP-TC01 | 200; resetToken khớp ^\d{6}$ | HTTP 200: {"message":"Mã đặt lại mật khẩu đã được tạo","resetToken":"5156"} | **Fail** | resetToken "5156" không khớp ^\d{6}$ (độ dài 4) |
| EP-TC02 | (Ca UI kiểm thử qua trình duyệt) |  | **Fail** | Ca UI kiểm thử qua trình duyệt — ghi nhận kết quả từ Playwright / UI runner |
| EP-TC03 | REJ (4xx); không có resetToken | HTTP 404: {"error":"User not found"} | **Pass** |  |
| EP-TC04 | REJ (4xx); không có resetToken | HTTP 404: {"error":"User not found"} | **Pass** |  |
| EP-TC05 | REJ (4xx); không có resetToken | HTTP 404: {"error":"User not found"} | **Pass** |  |
| EP-TC06 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC07 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC08 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC09 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC10 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC11 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC12 | REJ (4xx); mật khẩu vẫn NewPass123! | HTTP 400: {"error":"Invalid token or email"} \| login "NewPass123!" → 200; login "Another456@" → 401 | **Pass** |  |
| EP-TC13 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC14 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC15 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC16 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC17 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC18 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC19 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC20 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC21 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC22 | (Ca UI kiểm thử qua trình duyệt) |  | **Fail** | Ca UI kiểm thử qua trình duyệt — ghi nhận kết quả từ Playwright / UI runner |
| EP-TC23 | (Ca UI kiểm thử qua trình duyệt) |  | **Fail** | Ca UI kiểm thử qua trình duyệt — ghi nhận kết quả từ Playwright / UI runner |
| EP-TC24 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC25 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC26 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC27 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| EP-TC28 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| EP-TC29 | (Ca UI kiểm thử qua trình duyệt) |  | **Fail** | Ca UI kiểm thử qua trình duyệt — ghi nhận kết quả từ Playwright / UI runner |
| EP-TC30 | (Ca UI kiểm thử qua trình duyệt) |  | **Fail** | Ca UI kiểm thử qua trình duyệt — ghi nhận kết quả từ Playwright / UI runner |
| EP-TC31 | (Ca UI kiểm thử qua trình duyệt) |  | **Fail** | Ca UI kiểm thử qua trình duyệt — ghi nhận kết quả từ Playwright / UI runner |
| BV-TC01 | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | **Pass** |  |
| BV-TC02 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| BV-TC03 | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | **Pass** |  |
| BV-TC04 | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | **Pass** |  |
| BV-TC05 | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | **Pass** |  |
| BV-TC06 | 2xx; OC-OK | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | **Pass** |  |
| BV-TC07 | REJ (4xx); OC-NO | HTTP 200: {"message":"Password reset successfully"} \| OC-NO: login "Test1234!" → 401 | **Fail** | Status 200 không thuộc mã lỗi 4xx; OC-NO Thất bại: Mật khẩu cũ không đăng nhập được (HTTP 401) → Mật khẩu đã bị đổi! |
| BV-TC08 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| BV-TC09 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| OB-TC01 | Độ dài = 6; khớp ^\d{6}$ ở mọi lần | HTTP 200: {"message":"Mã đặt lại mật khẩu đã được tạo","resetToken":"8346"} | **Fail** | Lần 1: OTP "8346" có độ dài 4 ≠ 6 |
| SR-TC01 | 2xx; OC-OK (dùng OTP thật bắt đầu bằng 0) | HTTP 200: {"message":"Mã đặt lại mật khẩu đã được tạo","resetToken":"1421"} | **Blocked** | Không sinh được OTP bắt đầu bằng 0 sau 100 lần xin mã (SUT chỉ sinh 1000-9999) |
| SR-TC02 | REJ (4xx); OC-NO | HTTP 400: {"error":"Invalid token or email"} \| OC-NO: login "Test1234!" → 200 | **Pass** |  |
| SR-TC03 | Nhất quán: (2xx và OC-OK) hoặc (4xx và OC-NO) | HTTP 200: {"message":"Password reset successfully"} \| OC-OK: login mật khẩu mới → 200; login mật khẩu cũ → 401 | **Pass** |  |
| SR-TC04 | 2xx ở cả hai bước; OC-OK | HTTP 404: {"error":"User not found"} | **Fail** | Bước 1 với TEST@ESHOP.COM trả về HTTP 404, không có OTP |
