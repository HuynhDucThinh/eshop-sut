# Kết quả Thực thi Playwright CLI UI Automation — FR-14

**Ngày chạy:** 2026-10-15  
**Công cụ:** `@playwright/test` v1.64.0 (Trình duyệt: Chromium Headless)  
**URL Frontend Web Admin:** `http://localhost:5174` (tab `Quản lý Danh mục`)  
**URL Backend:** `http://localhost:3000` (chạy trên CSDL cô lập `.hw02_fr14_ui.sqlite`)  
**Log JSON:** `reports/evidence/FR-14/run_ui_1.json` và `reports/evidence/FR-14/run_ui_2.json`  
**Ảnh chụp màn hình bằng chứng:** `reports/evidence/FR-14/screenshots/`  
**Playwright Artifacts:** `reports/evidence/FR-14/playwright-artifacts/run_ui_1/`

---

## 1. Bảng Kết quả Thực thi 10 ca UI & API+UI trên Trình duyệt

| TC ID | Mô tả ca kiểm thử | Kết quả mong đợi (Oracle Đặc tả) | Kết quả thực tế trên Playwright (Actual) | Trạng thái | Minh chứng ảnh | Bug ID ứng viên |
|---|---|---|---|:---:|---|---|
| **EP-TC28** | Chưa đăng nhập hoặc dùng tài khoản `role='user'` truy cập Quản lý Danh mục trên Web Admin | Bị chặn truy cập hoặc yêu cầu đăng nhập Admin; không lộ giao diện thêm/xóa danh mục (README 176, FR-12; SEC-03) | Khi chưa có token thì hiện form Login; nhưng khi có token của tài khoản thường (`test@eshop.com`, `role='user'`), Web Admin **không kiểm tra role**, cho phép mở toàn bộ trang Quản lý Danh mục và thao tác Thêm/Xóa | **Fail** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC28.png` | BUG-009 (Lỗ hổng phân quyền RBAC trên UI & API) |
| **EP-TC29** | Luồng Thêm và Xóa danh mục hợp lệ trên giao diện Web Admin | Nhập `NAME_NOM` bấm `"Thêm mới"` $\rightarrow$ xuất hiện trong bảng và CSDL; bấm `"Xóa"` $\rightarrow$ biến mất khỏi bảng và CSDL (README 188–189) | Danh mục `"Thiết bị gia dụng thông minh"` xuất hiện ngay trên bảng UI và trong `GET /api/categories`; bấm `"Xóa"` xóa sạch khỏi bảng và CSDL | **Pass** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC29.png` |  |
| **EP-TC30** | Nhãn trường Tên danh mục (bắt buộc) có ký hiệu dấu `*` | Nhãn trường bắt buộc có dấu `*` đi kèm (README 252, FR-22) | Form thêm danh mục **không có thẻ `<label>` nào** (`labelCount = 0`) và không có ký hiệu dấu `*` bên cạnh ô nhập `"Tên danh mục mới"` | **Fail** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC30.png` | BUG-013 (Thiếu nhãn `<label>` và dấu `*` FR-22) |
| **EP-TC31** | Để trống ô Tên danh mục trên UI rồi bấm `"Thêm mới"` | Hệ thống chặn submit hoặc hiển thị thông báo lỗi; `OC-NO` không tạo danh mục rỗng (README 189, 252) | Ô `<input>` không có thuộc tính `required` và hàm `handleCategorySubmit` không kiểm tra rỗng; bấm `"Thêm mới"` tạo luôn 1 dòng danh mục rỗng (`#4 \| ""`) trong bảng và trong CSDL (tăng từ 3 lên 4 bản ghi) | **Fail** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC31.png` | BUG-010 (Cho phép tạo danh mục rỗng trên UI & API) |
| **EP-TC32** | Vị trí thông báo lỗi hiển thị phía TRÊN nút Submit | Khi nhập không hợp lệ, thông báo lỗi xuất hiện phía trên nút Submit: `bottom(lỗi) <= top(nút)` (README 255, FR-22) | Form hoàn toàn không có vùng hiển thị thông báo lỗi (`errorCount = 0`) khi gửi dữ liệu rỗng/không hợp lệ | **Fail** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC32.png` | BUG-013 (Thiếu thông báo lỗi phía trên nút Submit FR-22) |
| **EP-TC33** | Màu sắc nút `"Thêm mới"` (xanh dương) và nút `"Xóa"` (đỏ) | Nút hành động tích cực màu xanh dương; nút nguy hiểm màu đỏ (README 245, FR-21) | Nút `"Thêm mới"` có màu nền xanh dương `rgb(37, 99, 235)` (`bg-blue-600`); nút `"Xóa"` có màu nền đỏ `rgb(239, 68, 68)` (`bg-red-500`) | **Pass** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC33.png` |  |
| **EP-TC34** | Đúng 1 thẻ `<h1>`, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nhãn `"Đăng xuất"` | Có 1 thẻ `<h1>`; toàn bộ giao diện tiếng Việt không lẫn tiếng Anh; mục Danh mục được highlight; nút đăng xuất ghi `"Đăng xuất"` (FR-21, FR-23) | Có 1 thẻ `<h1>` (`"EShop Admin"`), mục `"Danh mục"` được highlight màu xanh `text-blue-400` và mục đăng xuất ghi `"Đăng xuất"`, **nhưng thanh điều hướng và màn hình đăng nhập lẫn tiếng Anh** (`"Dashboard"`, `"Admin Login"`, `"Password"`, `"Login"`) vi phạm FR-21 dòng 244 | **Fail** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC34.png` | BUG-013 (Giao diện pha trộn tiếng Anh vi phạm FR-21) |
| **EP-TC18 (UI)** | Chuỗi XSS `<img src=x onerror=alert(1)>` hiển thị dạng văn bản thuần, không thực thi script | Hiển thị nguyên văn dạng text trên bảng, không chèn `<img onerror>` vào DOM và không chạy `alert(1)` (README 281, SEC-04) | React JSX tự động escape chuỗi tên danh mục trong `<td>{c.name}</td>`; hiển thị nguyên văn chuỗi văn bản, `injectedImgCount = 0` và `alertTriggered = false` | **Pass** | `reports/evidence/FR-14/screenshots/run_ui_1_EP-TC18.png` |  |
| **OB-TC01 (UI)** | Khi xóa hết danh mục (`0` bản ghi), giao diện hiển thị Empty State có icon/hình minh họa | Không crash; hiển thị trạng thái trống (**Empty State**) kèm icon/hình minh họa và thông báo thân thiện (README 269, FR-24) | Khi `categories` rỗng (`[]`), bảng chỉ hiển thị phần tiêu đề cột (`ID \| Tên Danh Mục \| Hành động`) với `<tbody>` trống trơn, **không có thông báo Empty State và không có icon/hình minh họa** (`emptyStateMsg = 0`, `emptyStateIcon = 0`) | **Fail** | `reports/evidence/FR-14/screenshots/run_ui_1_OB-TC01.png` | BUG-013 (Thiếu trạng thái trống Empty State FR-24) |
| **SR-TC02 (UI)** | Hiển thị chuỗi danh mục tiếng Việt có dấu, ký tự đặc biệt (`&`, `-`, `()`) và Emoji | Hiển thị nguyên vẹn `"Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)"` trên bảng Web Admin | Hiển thị chính xác 100% chuỗi tiếng Việt, ký tự `&` và biểu tượng `🍜` trên bảng danh mục | **Pass** | `reports/evidence/FR-14/screenshots/run_ui_1_SR-TC02.png` |  |

---

## 2. Tổng kết Độ ổn định (Stability & Flakiness Verification)
- **Lần chạy 1 (`run_ui_1`)**: 4 Pass (`EP-TC29`, `EP-TC33`, `EP-TC18`, `SR-TC02`) / 6 Fail (`EP-TC28`, `EP-TC30`, `EP-TC31`, `EP-TC32`, `EP-TC34`, `OB-TC01`).
- **Lần chạy 2 (`run_ui_2`)**: 4 Pass / 6 Fail với cùng nguyên nhân, cùng giá trị DOM đo đạc và cùng vị trí assert.
- **Kết luận:** Kết quả kiểm thử giao diện Web Admin cho FR-14 hoàn toàn tất định (deterministic 100%, 0% flakiness).
