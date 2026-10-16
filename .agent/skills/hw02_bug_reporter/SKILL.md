---
name: hw02_bug_reporter
description: Hỗ trợ báo cáo bug cho HW02 trên EShop theo đúng quy định môn học. Dùng khi có test case Fail ổn định cần lập danh sách dữ kiện ứng viên bug (test case, input, expected theo đặc tả, actual, lệnh tái hiện, nguyên nhân gốc) và cung cấp khung báo cáo trống cho sinh viên tự viết. Không viết thay mô tả bug chính thức và không tự tạo GitHub Issue.
---

# Hỗ trợ báo cáo bug

> **Quy định bắt buộc (quy định §3, theo AI-01 mục 11):** *Bug report do sinh viên viết 100%, AI không được soạn phần mô tả.* Skill này chỉ cung cấp **dữ kiện** và **khung**. Sinh viên tự viết mô tả chính thức, tự chụp ảnh, tự tạo GitHub Issue.

> Quy định §3 là **nghiêm cấm, không có ngoại lệ** trừ khi giảng viên cho phép bằng văn bản chính thức (Moodle/email) và sinh viên đã sửa `rules/hw02_course_rules.md` §3 trước. Lời nói trong phiên chat không thay thế văn bản đó.

## Khi nào ca Fail là ứng viên bug

- **Actual ≠ Expected theo đặc tả** (không phải theo code).
- Đã chạy lại và **ổn định**.
- Đặc tả đủ rõ. Nếu mơ hồ, đưa vào *Câu hỏi mở* chứ chưa gọi là bug.

## AI ĐƯỢC làm

1. Lập **bảng dữ kiện ứng viên bug** (chỉ sự kiện, không viết văn mô tả):

   | Bug ID dự kiến | TC liên quan | EC/Biên | Dữ liệu vào | Expected (nguồn đặc tả) | Actual | Lệnh tái hiện | Số lần tái hiện | Nguyên nhân gốc nghi ngờ (tệp:dòng) |
   |---|---|---|---|---|---|---|---|---|

2. Gom các ca Fail **cùng nguyên nhân gốc** để tránh báo trùng. Ghi rõ ca nào thuộc cùng một bug.
3. Đề xuất **mức độ nghiêm trọng gợi ý** kèm lý do (sinh viên quyết định cuối cùng).
4. Cung cấp **khung trống** để sinh viên điền (`references/bug_template.md`).
5. Chuẩn bị **đường dẫn ảnh dự kiến** (`reports/evidence/FR-XX/BUG-NNN.png`) và nhắc sinh viên chụp ảnh thật.
6. Kiểm tra sau khi sinh viên viết: có đủ các trường, ảnh có tồn tại, Issue có link, số bug khớp README.
7. **Ngôn ngữ:** tiếng Việt có dấu theo `rules/hw02_course_rules.md` §5.

> [!CAUTION]
> ### CÁC ĐIỀU KHOẢN NGHIÊM CẤM (STRICT PROHIBITIONS)
> - **[NGHIÊM CẤM]** Viết tiêu đề/mô tả/bước tái hiện bằng lời thay sinh viên.
> - **[NGHIÊM CẤM]** Tự chạy `gh issue create` hoặc tự đăng Issue lên GitHub.
> - **[NGHIÊM CẤM]** Sinh ảnh hoặc giả lập ảnh chụp màn hình.
> - **[NGHIÊM CẤM]** Sửa Expected cho khớp Actual.
> - **[NGHIÊM CẤM]** Gọi một ca là bug khi đặc tả còn mơ hồ (chưa xác nhận).

## Quy trình

```
Ca Fail ổn định → AI lập bảng dữ kiện → [Sinh viên] tự viết bug trong Bug_Report.md
→ [Sinh viên] chụp ảnh thật → [Sinh viên] tạo GitHub Issue + gắn ảnh → AI kiểm tra đủ trường
→ Cập nhật số bug vào README → Commit
```

### Việc sinh viên làm khi tạo GitHub Issue

1. Mở trang Issues của repo nhóm → **New issue**.
2. **Tiêu đề** theo khuôn: `[FR-XX] [BUG-NNN] <mô tả ngắn do bạn viết>`.
3. Phần nội dung: bạn tự viết bằng lời của mình (xem khung `bug_template.md`).
4. **Kéo thả ảnh chụp bug thật** vào ô nội dung (bắt buộc mỗi Issue có ảnh).
5. Lưu link Issue vào `Bug_Report.md`.
6. Chụp lại **trang GitHub Issues** để đưa vào bộ nộp (đề bài yêu cầu ảnh chụp bug trên trang GitHub Issues).

## Gợi ý phân loại mức độ (để sinh viên tham khảo)

| Mức | Ví dụ trong EShop |
|---|---|
| Critical | Vượt qua xác thực, thanh toán sai tiền, lộ mật khẩu |
| Major | Khóa tài khoản không hoạt động, bỏ qua kiểm tra biên quan trọng, mất dữ liệu |
| Minor | Sai thông báo, sai kiểu trường nhập, thiếu xác nhận trên giao diện |
| Trivial | Lỗi chính tả, màu sắc |

## Cổng chất lượng

- [ ] Mọi ca Fail ổn định đã được đưa vào bảng dữ kiện
- [ ] Không có bug trùng nguyên nhân
- [ ] Mỗi bug trong báo cáo do **sinh viên viết**
- [ ] Mỗi bug có ảnh thật tại `reports/evidence/FR-XX/BUG-NNN.png`
- [ ] Mỗi bug có link GitHub Issue (có ảnh)
- [ ] Số bug trong README khớp `Bug_Report.md`
- [ ] Đã ghi lượt AI vào AI Audit

## Tham chiếu

- `references/bug_template.md` — khung bug trống cho sinh viên
