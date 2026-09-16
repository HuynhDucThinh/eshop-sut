# Triển khai EShop bằng Docker Compose

Cấu hình dành cho bản SUT/demo. Các lỗi nghiệp vụ và phân quyền có sẵn vẫn được giữ.
Web và admin chỉ bind localhost trên VPS; chưa cấu hình public domain/HTTPS.
Mobile không nằm trong Compose.

## Chuẩn bị

- Docker Engine và Docker Compose; chạy lệnh tại thư mục gốc repo.
- Cổng host 8280 và 8281 còn trống. Backend không publish cổng host 3000.
- Các package-lock.json phải đi cùng source; Dockerfile sử dụng npm ci.
- Database có sẵn trong repo không được COPY vào image. Volume mới dùng dữ liệu mẫu.
- Trên VPS ít RAM, build tuần tự từng service như dưới đây.

## Tạo secret trên VPS (Bash)

Chỉ chạy khi chưa có .env; giữ nguyên secret khi cập nhật để token không mất hiệu lực.

```bash
cd /opt/eshop-sut
if [ -e .env ]; then
  echo '.env đã tồn tại; giữ nguyên file hiện có'
else
  (umask 077; printf 'JWT_SECRET=%s\n' "$(openssl rand -hex 32)" > .env)
fi
docker compose config --quiet
```

Không commit .env. .env.example chỉ chứa tên biến, không chứa secret.

## Build và chạy

```bash
docker compose build backend
docker compose build web
docker compose build admin
docker compose up -d
docker compose ps
docker compose logs --tail=100 backend web admin
curl -fsS http://127.0.0.1:8280/api/products
curl -fsS http://127.0.0.1:8281/api/products
curl -I http://127.0.0.1:8280/profile
```

Backend cần healthy, API trả mảng JSON và /profile trả HTTP 200.
Không sử dụng run_servers.sh cũ trên VPS: script đó dành cho đường dẫn máy khác
và có lệnh killall node.

## Truy cập từ Windows

Trong terminal riêng trên máy Windows, thay IP_VPS bằng IP thật:

```powershell
ssh -N -L 8280:127.0.0.1:8280 -L 8281:127.0.0.1:8281 root@IP_VPS
```

Giữ terminal mở. Web: http://localhost:8280; admin: http://localhost:8281.
Nginx bên trong từng frontend phục vụ React và proxy /api đến backend.
Nginx hiện có trên VPS không bị thay đổi. Khi có domain, cấu hình virtual host
riêng trỏ đến 127.0.0.1:8280 và 127.0.0.1:8281, rồi thiết lập HTTPS.

## Dữ liệu và cập nhật

SQLite nằm ở /app/data/database.sqlite, trong volume eshop-sut_eshop_data.
Khởi tạo chỉ chạy khi chưa có bảng users. Đây không phải công cụ migration:
nếu thay đổi schema, cần migration riêng. Không dùng database đang khởi tạo dở.

Kiểm tra lưu dữ liệu: tạo một tài khoản demo, chạy docker compose restart backend,
sau đó đăng nhập lại tài khoản đó. Không kiểm tra trên dữ liệu thật.

```bash
docker compose restart backend
docker compose ps
```

Khi cập nhật source, build lại tuần tự rồi docker compose up -d.
docker compose down giữ named volume; không thêm -v trừ khi cố ý xóa dữ liệu.
Không chạy docker system prune --volumes trên VPS dùng chung.

## Chạy development không dùng Docker

Dùng Node.js 24. Tại gốc repo, sao chép .env.example thành .env và tự đặt
JWT_SECRET đủ dài, ngẫu nhiên. Chạy backend từ thư mục backend:

```bash
npm ci
node --env-file=../.env server.js
```

Hai frontend vẫn chạy npm ci rồi npm run dev ở thư mục tương ứng.
Vite proxy /api đến localhost:3000. node server.js không tự đọc .env;
cần --env-file hoặc biến môi trường do shell cung cấp.

Script kiểm tra hồ sơ dùng cùng secret:

```bash
node --env-file=../.env test_profile.js
```

Không in hoặc gửi nội dung .env khi yêu cầu hỗ trợ.
