# HW02 — Domain Testing — 23120199 — Huỳnh Đức Thịnh

## 1. Phạm vi hiện có

| Pool | Tính năng | Trạng thái |
|---|---|---|
| A | FR-03 — Quên mật khẩu và đặt lại mật khẩu | Đã hoàn thành đặc tả, EP, BVA, thực thi, bug và AI Gap |
| B | FR-08 — Thanh toán (Checkout) | Đã hoàn thành đặc tả, EP, BVA, thực thi, bug và AI Gap |
| C | Chưa chọn | **Thiếu — cần sinh viên chọn tính năng không trùng thành viên nhóm** |
| D | Chưa chọn tính năng Mobile | **Thiếu — cần sinh viên chọn tính năng không trùng thành viên nhóm** |

> Bài nộp hoàn chỉnh theo đề phải có đúng một tính năng ở mỗi Pool A/B/C/D. Không được nộp bản hiện tại như hồ sơ hoàn chỉnh vì còn thiếu Pool C và D.

## 2. Bảng tự chấm tạm thời theo sản phẩm hiện có

| STT | Tiêu chí | Điểm tối đa | Điểm tự chấm tạm thời |
|---:|---|---:|---:|
| 1 | Feature A — FR-03 (Domain + Boundary) | 25 | 25 |
| 2 | Feature B — FR-08 (Domain + Boundary) | 25 | 25 |
| 3 | Feature C (Domain + Boundary) | 25 | 0 |
| 4 | Feature D — Mobile (Domain + Boundary) | 15 | 0 |
| 5 | Agent Skills + video demo YouTube | 10 | 0 |
| | **Tổng tạm thời** | **100** | **50** |

Điểm trên chỉ phản ánh hồ sơ đang có, chưa phải điểm nộp cuối. Khi hoàn thành Pool C, Pool D và video, cần tự đánh giá lại theo rubric.

## 3. Test Summary

| Chỉ số | FR-03 | FR-08 | Tổng hiện có |
|---|---:|---:|---:|
| Số tính năng | 1 | 1 | **2** |
| Test case thiết kế | 45 | 43 | **88** |
| Đã chạy | 45 | 43 | **88** |
| Pass | 24 | 5 | **29** |
| Fail | 20 | 38 | **58** |
| Blocked | 1 | 0 | **1** |
| Not run | 0 | 0 | **0** |
| Bug chính thức | 3 | 5 | **8** |

Nguồn đối chiếu: `Main_Report.md`, `Bug_Report.md`, nhật ký API/UI trong `evidence/FR-03/` và `evidence/FR-08/`.

## 4. GitHub Issues

- FR-03: BUG-001–BUG-003, GitHub Issues #2–#4.
- FR-08: BUG-004–BUG-008, GitHub Issues #5–#9.
- BUG-008 gộp khiếm khuyết địa chỉ xuyên tầng: UI không có trường địa chỉ và backend vẫn chấp nhận địa chỉ thiếu/không hợp lệ.

## 5. Video demo Agent Skill

**Trạng thái:** Chưa có link YouTube. Sinh viên phải tự quay video có giọng nói và điền link trước khi nộp.

Link: *(chưa cung cấp)*

## 6. Hồ sơ AI

- `AI_Audit_Report.md`: nhật ký prompt và sản phẩm AI theo nguyên tắc append-only.
- `AI_Disclosure.md`: khai báo công cụ, giai đoạn và đóng góp của AI.
- `AI_Critique.md`: bài phản biện 286 từ, được AI hỗ trợ hoàn thiện theo ngoại lệ giảng viên ngày 13/10/2026.

## 7. Việc còn thiếu trước khi đóng gói

- [ ] Chọn và hoàn thành một tính năng Pool C.
- [ ] Chọn và hoàn thành một tính năng Pool D — Mobile.
- [ ] Quay video demo Agent Skill bằng giọng nói của sinh viên và thêm link YouTube.
- [ ] Xác thực lại GitHub CLI nếu cần cập nhật tiêu đề/nội dung Issue #9.
- [ ] Ký `AI_Disclosure.md` bằng chữ ký thật.
- [ ] Tạo đủ commit theo từng bước kiểm thử và xuất lại `git_commit_log.txt`.
- [ ] Xuất lại toàn bộ PDF sau khi hoàn thành Pool C và D.
- [ ] Cập nhật điểm tự chấm, tên file ZIP và kiểm tra giới hạn Moodle.
