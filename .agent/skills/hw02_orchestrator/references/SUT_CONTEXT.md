# Bối cảnh SUT — EShop

> Nguồn: đề bài HW02 và repo `https://github.com/ttbhanh/eshop-sut`. **Luôn đối chiếu với README của repo** (đặc tả SRS chính thức) vì thông tin cổng, tài khoản có thể thay đổi giữa các phiên bản.

## 1. Thành phần

| Thành phần | Thư mục (trong repo SUT) | Cổng/URL thường dùng |
|---|---|---|
| Backend API | `backend` | `http://localhost:3000` (API: `/api/...`) |
| Web người dùng | `frontend-web` | `http://localhost:5173` |
| Web Admin | `frontend-admin` | `http://localhost:5174` |
| Mobile App | `frontend-mobile` (React Native Expo) | Expo, cần IP LAN của máy chạy backend |

Pool A, B kiểm thử qua Web + API. Pool C qua Web Admin + API. Pool D qua Mobile + API.

## 2. Khởi chạy (Windows PowerShell, mỗi thành phần một cửa sổ)

```powershell
# Backend (bắt buộc)
cd backend
npm install
node database.js     # lần đầu hoặc khi cần reset dữ liệu (XÓA dữ liệu cũ)
node server.js

# Web người dùng
cd frontend-web ; npm install ; npm run dev

# Web Admin
cd frontend-admin ; npm install ; npm run dev

# Mobile
cd frontend-mobile ; npm install ; npx expo start
```

Kiểm tra backend: `Invoke-RestMethod http://localhost:3000/api/products` phải trả danh sách JSON.

Nếu cổng bị chiếm:

```powershell
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

## 3. Mobile

- **Không dùng `localhost`** trên điện thoại thật. Dùng IPv4 của máy chạy backend (lấy bằng `ipconfig`), ví dụ `http://192.168.1.3:3000/api`.
- Android Emulator dùng `http://10.0.2.2:3000/api`.
- Biến `API_URL` nằm trong `frontend-mobile/App.js`. Sau khi sửa phải reload Expo.

## 4. Tài khoản test (xác nhận lại trong README của SUT)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@eshop.com` | `Admin123!` |
| User | `test@eshop.com` | `Test1234!` |

Đây là tài khoản demo công khai của bài thực hành, được phép dùng. Không dùng dữ liệu thật của người khác.

## 5. Danh sách tính năng (FR)

| Pool | ID | Tính năng |
|---|---|---|
| A | FR-01 | Đăng ký tài khoản |
| A | FR-02 | Đăng nhập và khóa tài khoản |
| A | FR-03 | Quên mật khẩu và đặt lại (2 bước) |
| A | FR-04 | Quản lý hồ sơ cá nhân |
| A | FR-05 | Danh sách và tìm kiếm sản phẩm |
| A | FR-06 | Xem chi tiết sản phẩm |
| B | FR-07 | Giỏ hàng |
| B | FR-08 | Thanh toán |
| B | FR-09 | Mã giảm giá (coupon) |
| B | FR-10 | Máy trạng thái đơn hàng |
| B | FR-11 | Lịch sử đơn hàng (người dùng) |
| C | FR-12 | Kiểm soát truy cập |
| C | FR-13 | Dashboard |
| C | FR-14 | Quản lý danh mục (CRUD) |
| C | FR-15 | Quản lý sản phẩm (CRUD) |
| C | FR-16 | Nhập sản phẩm từ CSV |
| C | FR-17 | Quản lý coupon (CRUD) |
| C | FR-18 | Quản lý đơn hàng (admin) |
| C | FR-19 | Quản lý người dùng (admin) |
| D | — | Chức năng trên Mobile App |

## 6. Quy ước kiểm thử

- Lấy **đặc tả** của FR từ README SUT; điền vào `SRS_extract.md` rồi cho sinh viên xác nhận.
- Mọi test API ghi lệnh chạy thật (PowerShell `Invoke-RestMethod` hoặc `curl`).
- Reset dữ liệu giữa các nhóm ca có trạng thái (khóa tài khoản, giỏ hàng, import) bằng `hw02_test_executor/scripts/reset_state.ps1` **sau khi sinh viên đồng ý** (lệnh xóa dữ liệu).
- Không chạy test phá hủy trên dữ liệu không phải của SUT demo.
