# Kết quả Thực thi Playwright CLI UI Automation — FR-03

**Ngày chạy:** 2026-10-13  
**Công cụ:** `@playwright/test` v1.64.0 (Trình duyệt: Chromium Headless)  
**URL Frontend:** `http://localhost:5173/forgot-password`  
**URL Backend:** `http://localhost:3000`  
**Log JSON:** `reports/evidence/FR-03/run_ui_1.json`  
**Ảnh chụp màn hình bằng chứng:** `reports/evidence/FR-03/screenshots/`  
**Playwright Artifacts:** `reports/evidence/FR-03/playwright-artifacts/run_ui_1/`

---

## 1. Bảng Kết quả Thực thi 6 ca UI trên Trình duyệt

| TC ID | Mô tả ca kiểm thử | Kết quả mong đợi (Oracle Đặc tả) | Kết quả thực tế trên Playwright (Actual) | Trạng thái | Minh chứng ảnh | Bug ID |
|---|---|---|---|:---:|---|---|
| **EP-TC02** | Luồng hợp lệ end-to-end trên UI (có chỉ báo bước, OTP 6 số, xác nhận mật khẩu) | Hiển thị "Bước 1 / 2" rồi "Bước 2 / 2"; OTP 6 số; form có trường Xác nhận mật khẩu; đổi thành công chuyển về `/login` | Không có chỉ báo bước; OTP hiển thị 4 số; form **thiếu hẳn trường Xác nhận mật khẩu**; không chuyển về `/login` | **Fail** | `screenshots/run_ui_1_EP-TC02.png` | BUG-001, BUG-003 |
| **EP-TC22** | Nhập Mật khẩu mới và Xác nhận mật khẩu khác nhau ($V_4 \ne V_5$) | Báo lỗi không khớp trên UI; không cho đổi mật khẩu; mật khẩu cũ vẫn đăng nhập được (OC-NO) | Form Bước 2 **không có trường Xác nhận mật khẩu** để nhập giá trị khác nhau | **Fail** | `screenshots/run_ui_1_EP-TC22.png` | BUG-003 |
| **EP-TC23** | Để trống trường Xác nhận mật khẩu ($V_5 = \text{rỗng}$) | Báo lỗi bắt buộc nhập xác nhận mật khẩu; không cho đổi mật khẩu | Form Bước 2 **không có trường Xác nhận mật khẩu** để để trống | **Fail** | `screenshots/run_ui_1_EP-TC23.png` | BUG-003 |
| **EP-TC29** | Chỉ báo tiến trình (Step Indicator "Bước 1 / 2", "Bước 2 / 2") và nút "Quay lại đăng nhập" | Hiển thị rõ ràng chỉ báo "Bước 1 / 2", "Bước 2 / 2" và có liên kết quay lại trang đăng nhập | Không tìm thấy phần tử thể hiện "Bước 1 / 2" hay "Bước 2 / 2" trên giao diện | **Fail** | `screenshots/run_ui_1_EP-TC29.png` | BUG-003 |
| **EP-TC30** | Ô email sử dụng HTML5 `type="email"` và kích hoạt validation khi sai định dạng | Thẻ input có `type="email"`; nhập `testeshop.com` thì trình duyệt chặn submit và kích hoạt `:invalid` | Input khai báo `type="text"` (không phải `type="email"`); `validity.valid = true`; request vẫn bị gửi tới API | **Fail** | `screenshots/run_ui_1_EP-TC30.png` | BUG-003 (Form Validation) |
| **EP-TC31** | Các ô nhập mật khẩu ở Bước 2 đều phải che ký tự (`type="password"`) | Cả ô Mật khẩu mới và ô Xác nhận mật khẩu đều có thuộc tính `type="password"` | Ô Mật khẩu mới có `type="password"`, nhưng **hoàn toàn không có ô Xác nhận mật khẩu** trên DOM | **Fail** | `screenshots/run_ui_1_EP-TC31.png` | BUG-003 |

---

## 2. Tổng kết Độ ổn định (Stability & Flakiness Verification)
- **Lần chạy 1 (`run_ui_1`)**: 6/6 ca Fail (100% phát hiện đúng các thiếu sót và lỗi giao diện của SUT so với đặc tả).
- **Lần chạy 2 (`run_ui_2`)**: 6/6 ca Fail với cùng nguyên nhân và vị trí assert.
- **Kết luận:** Lỗi giao diện người dùng trên SUT mang tính tất định (deterministic), không có hiện tượng flakiness.
