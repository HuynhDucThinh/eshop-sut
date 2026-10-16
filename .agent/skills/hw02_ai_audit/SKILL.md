---
name: hw02_ai_audit
description: Ghi nhật ký tương tác AI, lập AI Audit Report theo mẫu AI-02, phân tích khoảng trống AI (AI Gap Analysis), hỗ trợ Disclosure và gợi ý cho AI Critique của HW02. Dùng sau mỗi lượt AI tạo ra sản phẩm (test case, báo cáo, script), khi cần kiểm toán đầu ra AI với nhãn VALID/INVALID/INCOMPLETE, khi cần tổng kết độ chính xác của AI, hoặc khi cần phân tích vì sao AI bỏ sót test case/bug.
---

# AI Audit, AI Gap Analysis, Critique

> Bắt buộc theo đề bài (mục 9, 10) và AI-01 (mục 8): mọi bài có AI hỗ trợ phải kèm **AI Audit Report**, **nhật ký prompt có dấu thời gian**, **Disclosure**, **AI Critique**.

## 1. Tự động ghi log sau mỗi lượt (AI phải tự làm)

Sau mỗi lượt xử lý có sản phẩm, AI **tự thêm một dòng** vào `AI_Audit_Report.md`, không chờ nhắc.

### Các bước

1. Đọc `AI_Audit_Report.md`, đếm số mục hiện có, đánh số tiếp (`Artifact #N+1`).
2. Ghi **thời gian thực** (ngày giờ), tên công cụ AI và mô hình nếu biết.
3. Trích **prompt nguyên văn** của sinh viên (không diễn giải lại).
4. Ghi **đầu ra AI**: nguyên văn nếu ngắn, nếu dài thì ghi tóm tắt cấu trúc + đường dẫn tới đầu ra đầy đủ (ví dụ vị trí trong `Main_Report.md` hoặc `evidence/`).
5. Để **trống** cột **Verdict** và **Sinh viên sửa** (ghi chú *"Sinh viên tự điền"*). AI **không điền nháp, không đề xuất nhãn**; AI chỉ điền dữ kiện khách quan (công cụ, thời gian, prompt, đường dẫn đầu ra).
6. Ghi nhớ: chưa có `AI_Audit_Report.md` thì tạo theo khuôn `references/audit_template.md`.
7. **QUY TẮC BẮT BUỘC (APPEND-ONLY):** Khi ghi thêm artifact mới, **CHỈ ĐƯỢC CHÈN THÊM (APPEND)** dòng mới vào cuối bảng mục 2 (sau `Artifact #N`). **TUYỆT ĐỐI CẤM ghi đè, xóa hoặc thay thế** các dòng `Artifact #1, #2...` đã có từ trước nhằm bảo toàn 100% lịch sử audit qua các bước. Sau đó cập nhật lại số lượng tổng kết tại mục 3 tương ứng với toàn bộ các artifact hiện có.
8. **Ngôn ngữ:** tiếng Việt có dấu theo `rules/hw02_course_rules.md` §5; trích nguồn (slide, ISTQB, đặc tả) phải thật, không bịa.

### Chỉ tính là một "artifact" khi

AI tạo ra một sản phẩm cụ thể: bảng EC, bộ test case, script, báo cáo, phân tích. Câu hỏi/đáp ngắn không phải artifact.

## 2. Bảng kiểm toán (5 cột — đúng mẫu AI-02)

| (1) Prompt + Công cụ | (2) Đầu ra AI | (3) Kết luận | (4) Lý do (ISTQB / bài giảng) | (5) Sinh viên sửa |
|---|---|---|---|---|

- **(1)** Công cụ, thời gian, prompt nguyên văn.
- **(2)** Đầu ra nguyên văn (hoặc ảnh chụp có nhãn).
- **(3)** Nhãn: `VALID` (đúng, chấp nhận nguyên) · `INVALID` (sai, loại bỏ) · `INCOMPLETE` (chấp nhận được sau khi chỉnh sửa).
- **(4)** Lý do **phải trích dẫn** nguồn: slide bài giảng, mục ISTQB Foundation, hoặc đặc tả. Không bịa nguồn.
- **(5)** Phần sinh viên đã sửa, nêu rõ điểm thay đổi (ví dụ thêm ca `UB+1`).

Nhãn `VALID/INVALID/INCOMPLETE` và cột (4)–(5) do **sinh viên quyết định và tự điền** (nghiêm cấm AI điền thay, kể cả dưới dạng nháp). AI có thể đưa **câu hỏi gợi ý** (ví dụ "đầu ra này có đúng đặc tả mục X không?") để sinh viên tự kiểm tra.

## 3. Tổng kết độ chính xác AI

| Chỉ số | Số lượng | Tỉ lệ |
|---|---:|---:|
| Tổng artifact đã kiểm toán | | |
| VALID | | % |
| INVALID | | % |
| INCOMPLETE | | % |

AI chỉ **tính số liệu** từ các nhãn mà sinh viên đã điền; chưa có nhãn thì để trống ô tương ứng. Không làm tròn cho đẹp.

## 4. Kết luận 80–150 từ (mẫu AI-02 mục 5)

Câu hỏi: AI làm tốt ở đâu? Sai ở đâu? Khuyến nghị dùng AI cho loại việc này? **Sinh viên tự viết.** AI chỉ gợi ý câu hỏi.

## 5. AI Gap Analysis (theo từng feature)

Yêu cầu đề bài: *nếu AI bỏ sót test case hoặc bug, phải báo cáo và giải thích vì sao.*

### Cách phát hiện khoảng trống

1. So sánh **bộ test case AI sinh** với **bộ sau Human Review** của sinh viên. Phần sinh viên **thêm vào** là ứng viên khoảng trống.
2. So sánh **bug phát hiện** với **bug AI dự đoán** (nếu AI có dự đoán).
3. So với danh sách trong bài giảng: lớp đầu ra đã đủ chưa? biên ngoài miền đã đủ chưa? chế độ BVA đã đúng chưa?

### Phân loại nguyên nhân (theo đề bài)

| Nhóm | Ý nghĩa | Ví dụ |
|---|---|---|
| **A. Chất lượng đầu vào (prompt)** | Prompt thiếu thông tin, thiếu ràng buộc | Không nêu cận đóng/mở nên AI chia sai |
| **B. Giới hạn công cụ AI** | Hạn chế của mô hình | Tính sai số học với số âm; bỏ lớp đầu ra; sao chép sai từ ví dụ |
| **C. Độ phức tạp của tính năng** | Quy tắc ngầm, trạng thái, phụ thuộc thời gian | Khóa tài khoản theo thời gian, ràng buộc liên biến |

### Bảng khoảng trống

| STT | Test case / Bug AI bỏ sót | Cách phát hiện | Nhóm nguyên nhân (A/B/C) | Giải thích vì sao bỏ sót | Cải tiến prompt / Bài học |
|---|---|---|---|---|---|

Đặt trong `Main_Report.md`, mục `AI Gap Analysis — <Tính năng>`. Nếu thật sự không có khoảng trống, **nói rõ** và nêu cách đã kiểm tra, không bịa cho đủ.

## 6. AI Critique (200–300 từ, bắt buộc)

**Sinh viên tự viết** (quy định §3). AI chỉ đưa câu hỏi gợi ý:

- AI sai/thiên lệch/thiếu ở chỗ nào? (nêu ví dụ cụ thể từ bài của bạn)
- Vì sao AI không phát hiện ra? (prompt, giới hạn công cụ, độ phức tạp)
- Bạn rút ra nguyên tắc gì khi phối hợp với AI?

Đếm từ: 200–300. Lưu vào `AI_Critique.md`.

## 7. Disclosure và đoạn cam kết

- Chuẩn bị **khung trống** `AI_Disclosure.md` theo mẫu AI-03 (`references/disclosure_template.md`) và liệt kê **dữ kiện khách quan** (công cụ, thời gian, đường dẫn nhật ký). **Sinh viên tự điền nội dung khai báo và tự ký.**
- Cuối báo cáo thêm **Mandatory Disclosure** nguyên văn theo AI-02 mục 6 (sinh viên điền nội dung cụ thể).
- Nếu không dùng AI: *"I do not use any AI help in this exercise."*

## Cổng chất lượng

- [ ] Mỗi sản phẩm AI đã có một dòng trong bảng kiểm toán
- [ ] Prompt và đầu ra là **nguyên văn** hoặc có ảnh/đường dẫn rõ ràng
- [ ] Mỗi Verdict có lý do có nguồn
- [ ] Mỗi INCOMPLETE/INVALID có Student Fix
- [ ] Bảng tổng kết khớp với bảng kiểm toán
- [ ] Gap Analysis có nhóm nguyên nhân A/B/C
- [ ] Critique do sinh viên viết, 200–300 từ
- [ ] Có Mandatory Disclosure ở cuối báo cáo

> [!CAUTION]
> ### CÁC ĐIỀU KHOẢN NGHIÊM CẤM (STRICT PROHIBITIONS)
> - **[NGHIÊM CẤM]** Bịa prompt/đầu ra để nhật ký trông đầy đủ.
> - **[NGHIÊM CẤM]** Điền hoặc đề xuất Verdict (`VALID`/`INVALID`/`INCOMPLETE`), cột Sinh viên sửa, thay sinh viên.
> - **[NGHIÊM CẤM]** Viết thay AI Critique, nội dung AI Disclosure, chữ ký hoặc tuyên bố trung thực.
> - **[NGHIÊM CẤM]** Bịa nguồn trích dẫn trong cột Lý do.

## Tham chiếu

- `references/audit_template.md` — khuôn `AI_Audit_Report.md`
- `references/gap_template.md` — khuôn AI Gap Analysis
- `references/critique_template.md` — khung gợi ý Critique
- `references/disclosure_template.md` — khung Disclosure
