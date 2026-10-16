# HW02 — Domain Testing — 23120199 — Huỳnh Đức Thịnh

## 1. Phạm vi hiện có

| Pool | Tính năng | Trạng thái |
|---|---|---|
| A | FR-03 — Quên mật khẩu và đặt lại mật khẩu | Đã hoàn thành đặc tả, EP, BVA, thực thi 2 lượt, bug và AI Gap |
| B | FR-08 — Thanh toán (Checkout) | Đã hoàn thành đặc tả, EP, BVA, thực thi 2 lượt, bug và AI Gap |
| C | FR-14 — Quản lý Danh mục (Category CRUD) | Đã hoàn thành đặc tả, EP, BVA, thực thi 2 lượt, bug và AI Gap |
| D | FR-20.3 — Mobile: Thanh toán (Checkout) và Áp mã giảm giá | Đã hoàn thành đặc tả, EP, BVA, thực thi 2 lượt, bug và AI Gap |

> Bài nộp đã hoàn thành đầy đủ cả 4 Pool tính năng (A, B, C, D).

## 2. Bảng tự chấm tạm thời theo sản phẩm hiện có

| STT | Tiêu chí | Điểm tối đa | Điểm tự chấm tạm thời |
|---:|---|---:|---:|
| 1 | Feature A — FR-03 (Domain + Boundary) | 25 | 25 |
| 2 | Feature B — FR-08 (Domain + Boundary) | 25 | 25 |
| 3 | Feature C — FR-14 (Domain + Boundary) | 25 | 25 |
| 4 | Feature D — FR-20.3 Mobile (Domain + Boundary) | 15 | 15 |
| 5 | Agent Skills + video demo YouTube | 10 | 0 |
| | **Tổng tạm thời** | **100** | **90** |

Điểm trên phản ánh 4 tính năng đã hoàn thiện (90/90 điểm phần kiểm thử 4 Pool); phần Agent Skills + video demo (10 điểm) sẽ được cộng sau khi sinh viên cập nhật link YouTube.

## 3. Test Summary

| Chỉ số | FR-03 | FR-08 | FR-14 | FR-20.3 | Tổng cộng (4 tính năng) |
|---|---:|---:|---:|---:|---:|
| Số tính năng | 1 | 1 | 1 | 1 | **4** |
| Test case thiết kế | 45 | 43 | 50 | 54 | **192** |
| Đã chạy | 45 | 43 | 50 | 54 | **192** |
| Pass | 24 | 5 | 20 | 21 | **70** |
| Fail | 20 | 38 | 30 *(28 ca gắn bug + 2 ca Q1/Q8)* | 33 *(31 ca gắn bug + 2 ca Q1/Q8)* | **121** |
| Blocked | 1 | 0 | 0 | 0 | **1** |
| Not run | 0 | 0 | 0 | 0 | **0** |
| Bug chính thức | 3 | 5 | 5 | 6 | **19** |

Nguồn đối chiếu: `Main_Report.md`, `Bug_Report.md`, nhật ký API/UI trong `evidence/FR-03/`, `evidence/FR-08/`, `evidence/FR-14/` và `evidence/FR-20.3/`.

## 4. GitHub Issues & Hồ sơ lỗi

- FR-03: `BUG-001`–`BUG-003`, GitHub Issues #2–#4.
- FR-08: `BUG-004`–`BUG-008`, GitHub Issues #5–#9.
- FR-14: `BUG-009`–`BUG-013`, GitHub Issues #10–#14.
- FR-20.3: `BUG-014`–`BUG-019`, GitHub Issues #15–#20.

## 5. Video demo Agent Skill

**Trạng thái:** Chưa có link YouTube. Sinh viên phải tự quay video có giọng nói và điền link trước khi nộp.

Link: *(chưa cung cấp)*

## 6. Hồ sơ AI

- `AI_Audit_Report.md`: nhật ký 20 prompt và sản phẩm AI (`Artifact #1`–`#20`) theo nguyên tắc append-only.
- `AI_Disclosure.md`: khai báo công cụ, giai đoạn và đóng góp của AI cho cả 4 tính năng.
- `AI_Critique.md`: bài phản biện 251 từ, đạt chuẩn liêm chính học thuật.

## 7. Việc còn thiếu trước khi đóng gói

- [x] Chọn và hoàn thành tính năng Pool A (FR-03: Quên mật khẩu).
- [x] Chọn và hoàn thành tính năng Pool B (FR-08: Thanh toán Checkout).
- [x] Chọn và hoàn thành tính năng Pool C (FR-14: Quản lý Danh mục Category CRUD).
- [x] Chọn và hoàn thành tính năng Pool D — Mobile (FR-20.3: Mobile Thanh toán & Áp mã giảm giá).
- [x] Tạo đầy đủ 19 GitHub Issues (#2–#20) cho toàn bộ `BUG-001`–`BUG-019` của 4 tính năng trên kho lưu trữ cá nhân.
- [ ] Quay video demo Agent Skill bằng giọng nói của sinh viên và thêm link YouTube.
- [ ] Ký `AI_Disclosure.md` bằng chữ ký thật.
- [x] Tạo đủ commit theo từng bước kiểm thử và xuất lại `git_commit_log.txt`.
- [x] Xuất lại toàn bộ PDF sau khi hoàn thành tất cả các mục.
- [ ] Cập nhật điểm tự chấm, tên file ZIP và kiểm tra giới hạn Moodle.
