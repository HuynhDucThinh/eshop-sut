# Khung báo cáo bug (để SINH VIÊN tự điền)

> Các mục dưới đây **do sinh viên tự viết**. AI chỉ được điền phần *dữ kiện* đã đánh dấu **(dữ kiện)**, không viết phần mô tả.

```markdown
# Bug Report

## FR-XX — [Tên tính năng]

### BUG-001: [Sinh viên tự viết tiêu đề]

| Mục | Nội dung |
|---|---|
| Test case liên quan **(dữ kiện)** | EP-TC03 / BV-TC07 |
| EC / Biên **(dữ kiện)** | EC02 / B01 |
| Mức độ nghiêm trọng | Critical / Major / Minor / Trivial — (sinh viên chọn) |
| Mức độ ưu tiên | High / Medium / Low — (sinh viên chọn) |
| Thành phần | Web / Admin / Mobile / API |
| Môi trường | Hệ điều hành, trình duyệt, phiên bản SUT, ngày giờ chạy |
| Yêu cầu liên quan | (trích đặc tả, ghi nguồn) |

#### Các bước tái hiện (sinh viên tự viết bằng lời)

1. …
2. …

**Lệnh chạy thật (dữ kiện, nếu là API):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/..." -Method Post -ContentType "application/json" -Body '{"..."}'
```

#### Kết quả mong đợi (theo đặc tả)

- (Sinh viên viết; ghi nguồn đặc tả)

#### Kết quả thực tế

- (Sinh viên viết; dán nguyên văn thông báo/phản hồi)

#### Nguyên nhân gốc (tùy chọn)

- (Sinh viên viết, có thể dựa trên gợi ý của AI nhưng phải tự kiểm chứng)

#### Bằng chứng

![BUG-001](./evidence/FR-XX/BUG-001.png)

(Ảnh chụp thật do sinh viên thực hiện)

#### GitHub Issue

- Tiêu đề: `[FR-XX] [BUG-001] …`
- Link: …
- Trạng thái: Open

---
```

## Danh sách kiểm tra của sinh viên trước khi đóng bug

- [ ] Tôi tự viết mô tả bằng lời của mình
- [ ] Tôi đã chạy lại và lỗi tái hiện ổn định
- [ ] Ảnh là ảnh thật tôi chụp
- [ ] Issue có ảnh và link đã ghi vào báo cáo
- [ ] Expected dựa trên đặc tả (không phải suy đoán từ code)
