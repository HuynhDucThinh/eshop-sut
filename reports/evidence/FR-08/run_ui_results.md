# Kết quả Thực thi Playwright CLI UI Automation — FR-08

**Ngày chạy:** 2026-10-13  
**Công cụ:** `@playwright/test` v1.64.0 (Trình duyệt: Chromium Headless)  
**URL Frontend:** `http://localhost:5173/checkout`  
**URL Backend:** `http://localhost:3000`  
**Log JSON:** `reports/evidence/FR-08/run_ui_1.json` và `reports/evidence/FR-08/run_ui_2.json`  
**Ảnh chụp màn hình bằng chứng:** `reports/evidence/FR-08/screenshots/`  
**Playwright Artifacts:** `reports/evidence/FR-08/playwright-artifacts/run_ui_1/`

---

## 1. Bảng Kết quả Thực thi 12 ca UI trên Trình duyệt

| TC ID | Mô tả ca kiểm thử | Kết quả mong đợi (Oracle Đặc tả) | Kết quả thực tế trên Playwright (Actual) | Trạng thái | Minh chứng ảnh | Bug ID ứng viên |
|---|---|---|---|:---:|---|---|
| **EP-TC21** | Chưa đăng nhập truy cập trang Thanh toán (`/checkout`) | Bị chặn hoặc chuyển hướng về `/login`; không hiển thị nút đặt hàng (README 104; SEC-02) | Cho phép truy cập tự do, không chuyển hướng; form và nút xác nhận thanh toán vẫn hiển thị đầy đủ | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC21.png` | BUG-004 (Lỗ hổng truy cập trái phép) |
| **EP-TC22** | Luồng đặt hàng danh định hợp lệ trên UI | Form có trường Địa chỉ giao hàng; đặt hàng thành công; giỏ rỗng; đơn mới `pending` | Form **thiếu hẳn trường Địa chỉ giao hàng**; không thể gửi địa chỉ lên API | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC22.png` | BUG-005 (Lỗi giao diện thiếu trường địa chỉ) |
| **EP-TC23** | Hiển thị đầy đủ danh sách sản phẩm đặt mua | Danh sách sản phẩm hiển thị đủ tên, số lượng, thành tiền khớp giỏ hàng (README 106) | Danh sách sản phẩm hiển thị được tên sản phẩm, nhưng bị ảnh hưởng bởi lỗi tính tổng tiền | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC23.png` | BUG-006 (Giao diện đặt hàng) |
| **EP-TC24** | Tổng tiền tự động tính, không có ô cho người dùng sửa trực tiếp | Tổng tiền tính tự động từ giỏ hàng; không có ô nhập cho phép sửa trực tiếp (README 105) | Tồn tại trường `<input type="number">` cho phép người dùng **tự do gõ sửa số tiền thanh toán** | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC24.png` | BUG-006 (LỖ HỔNG BẢO MẬT GIAN LẬN GIÁ) |
| **EP-TC25** | Nhãn trường Địa chỉ giao hàng bắt buộc có dấu `*` | Nhãn trường bắt buộc có dấu `*` (README 252, FR-22) | Form **hoàn toàn không có trường Địa chỉ giao hàng** để hiển thị nhãn và dấu `*` | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC25.png` | BUG-005 (Thiếu trường địa chỉ) |
| **EP-TC26** | Để trống ô địa chỉ trên UI bấm đặt hàng bị chặn/báo lỗi | Hệ thống chặn submit hoặc báo lỗi bắt buộc nhập địa chỉ (README 252; O4) | Không có trường địa chỉ; bấm đặt hàng hệ thống vẫn gửi request checkout lên backend thành công | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC26.png` | BUG-005 (Thiếu trường địa chỉ) |
| **EP-TC27** | Vị trí thông báo lỗi hiển thị phía TRÊN nút submit | Thông báo lỗi nằm phía trên nút submit: `bottom(lỗi) ≤ top(nút)` (README 255, FR-22) | Thông báo lỗi mã giảm giá nằm phía trên nút submit (`y_lỗi < y_nút`) | **Pass** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC27.png` |  |
| **EP-TC28** | Có Breadcrumb điều hướng ở trang Thanh toán | Có Breadcrumb dạng "Trang chủ › Giỏ hàng › Thanh toán" (README 263, FR-23) | Giao diện hoàn toàn không có thanh điều hướng Breadcrumb | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC28.png` | BUG-007 (Lỗi giao diện thiếu Breadcrumb) |
| **EP-TC29** | Trang có đúng một thẻ `<h1>` | Mỗi trang có duy nhất một thẻ `<h1>` (README 247, FR-21) | Trang không có thẻ `<h1>` nào (chỉ sử dụng thẻ `<h2>` và `<h3>`) | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC29.png` | BUG-007 (Lỗi chuẩn ngữ nghĩa HTML5) |
| **EP-TC30** | Số tiền có ký hiệu `₫` và phân cách hàng nghìn | Số tiền hiển thị kèm ký hiệu `₫` và có dấu phân cách hàng nghìn (README 246, FR-21) | Ô nhập tổng tiền `<input>` hiển thị số thô không có dấu phân cách hàng nghìn | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC30.png` | BUG-007 (Lỗi định dạng tiền tệ) |
| **EP-TC31** | Nút xác nhận đặt hàng có màu nền xanh dương | Nút submit có màu nền xanh dương (README 245, FR-21) | Nút xác nhận đặt hàng có màu xanh lá cây `rgb(22, 163, 74)` (`bg-green-600`) | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC31.png` | BUG-007 (Lỗi màu sắc giao diện FR-21) |
| **EP-TC32** | Ô địa chỉ được tự động điền sẵn từ hồ sơ người dùng | Địa chỉ trong profile tự động điền sẵn vào ô địa chỉ (Giả định Q4) | Form không có ô địa chỉ giao hàng để tự động điền sẵn dữ liệu profile | **Fail** | `reports/evidence/FR-08/screenshots/run_ui_1_EP-TC32.png` | BUG-005 (Thiếu trường địa chỉ) |

---

## 2. Tổng kết Độ ổn định (Stability & Flakiness Verification)
- **Lần chạy 1 (`run_ui_1`)**: 1 Pass / 11 Fail.
- **Lần chạy 2 (`run_ui_2`)**: 1 Pass / 11 Fail với cùng nguyên nhân và vị trí assert.
- **Kết luận:** Lỗi giao diện người dùng trên SUT mang tính tất định (deterministic 100%), không có hiện tượng flakiness.
