# Phiếu khai báo sử dụng AI — HW02

| Mục | Nội dung |
|---|---|
| **Môn học** | CS423 / CSC13003 – Kiểm thử phần mềm |
| **Giảng viên hướng dẫn** | ThS. Hồ Tuấn Thanh |
| **Mã bài tập** | HW02-AI |
| **Tên bài tập** | Domain Testing trên EShop SUT |
| **Nhóm sử dụng AI (1–5)** | Category 4 — AI hỗ trợ sản xuất (AI-assisted content creation with human oversight) |
| **Ngày cập nhật** | 15/10/2026 |
| **Họ và tên sinh viên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Lớp / Khóa** | CQ2023/31 |

---

## 1. Công cụ AI đã dùng

1. **Google Gemini 3.8 Flash** (Antigravity Agent, Google DeepMind) — Hỗ trợ trích xuất đặc tả SRS, phân tích các biến đầu vào/đầu ra, thiết kế EP/BVA, tạo script thực thi tự động và lập báo cáo cho FR-03, FR-08 và FR-14 (Bước 1–4).
2. **Anthropic Claude Sonnet 5.5** (Antigravity Agent) — Hỗ trợ thiết kế phân hoạch tương đương (EP), phân tích giá trị biên (BVA $6n+1$), tạo script thực thi tự động và rà soát nguyên nhân gốc (Bước 2, Bước 3, Bước 4).
3. **OpenAI Codex (GPT-5)** — Hỗ trợ đối chiếu FR-08 với FR-03, tổng hợp AI Gap Analysis, cập nhật dữ kiện Disclosure và câu hỏi gợi ý AI Critique (Bước 4).

---

## 2. Giai đoạn đã dùng AI

- [x] **brainstorming** (phát hiện các điểm mơ hồ của FR-03, FR-08 và FR-14 trong đặc tả SRS)
- [x] **drafting** (soạn dự thảo bảng EC, bộ test case sơ khởi và khung báo cáo)
- [x] **feedback** (đề xuất điểm cần Human Review và câu hỏi gợi ý Critique)
- [x] **revision** (hoàn thiện AI Gap Analysis sau Human Review và thực thi)
- [x] **coding** (viết script kiểm thử tự động Node.js cho API và Playwright CLI cho UI; FR-03 có 36 ca, FR-08 có 43 ca, FR-14 có 50 ca)
- [x] **data analysis** (phân tích nhật ký thực thi, đối chiếu Pass/Fail, khoảng trống AI và nguyên nhân gốc)
- [ ] khác: *(không)*

---

## 3. Các prompt chính tác động nhất (trích nguyên văn)

Toàn bộ nhật ký prompt và đối chiếu chi tiết được lưu trữ tại [reports/AI_Audit_Report.md](file:///d:/KCPM/eshop-sut/reports/AI_Audit_Report.md). Dưới đây là các prompt có tính định hình và tác động lớn nhất:

1. **Prompt thiết kế test case FR-03 (Bước 2)**:
   > `"/hw02_2_design_tests Đặc tả FR-03 đã được duyệt. Hãy áp dụng kỹ thuật Domain Testing (Phân hoạch tương đương EP 3 bước) chia các lớp EC valid/invalid cho từng biến và ràng buộc chéo (mật khẩu khớp nhau, OTP đúng email đã yêu cầu). Sau đó áp dụng BVA chế độ Robustness (6n+1) cho độ dài mật khẩu mới (min 8) và độ dài OTP (6 chữ số). Tính toán Expected result độc lập từ SRS và ghi toàn bộ vào reports/Main_Report.md. Dừng lại để tôi Human Review."`

2. **Prompt phân tích đặc tả FR-08 (Bước 1)**:
   > `"/hw02_1_analyze_feature tiến hành thực hiện phân tích yêu cầu cho fr-08. Nội dung cần làm đúng trong workflow đã quy định và cần làm chi tiết, kĩ càng"`

3. **Prompt thiết kế test case FR-14 (Bước 2)**:
   > `"Tui xác nhận các thông tin bạn gợi ý là đúng, tui đã commit rồi. Bạn tiến hành /hw02_2_design_tests thật đầy đủ, chi tiết. Tham khảo format của FR-03 và FR-08 để trình bày cho chính xác"`

4. **Prompt thực thi và báo cáo FR-14 (Bước 3)**:
   > `"/hw02_3_execute_and_report tiến hành thực hiện tiếp tục cho nội dung này giúp tôi. làm xong báo cáo kết quả, cần trình bày tương tự fr-03 và fr-08"`

---

## 4. Phần việc AI đã đóng góp

- **FR-03 — Phân tích, thiết kế và thực thi**: AI trích xuất 5 biến đầu vào ($V_1$–$V_5$), 6 kết quả đầu ra ($O_{1.1}$–$O_{2.4}$) và 5 câu hỏi mở (Q1–Q5); sinh 30 lớp tương đương, 23 ca EP và 9 ca biên BVA Robustness $6n+1$; tạo script `run_fr03.js` và `fr03_ui.spec.js` thực thi tự động 2 lần độc lập trên 36 ca (cùng 4 ca `SR-TC01`–`SR-TC04` của sinh viên).
- **FR-08 — Phân tích, thiết kế và thực thi**: AI trích xuất 4 biến đầu vào, 5 đầu ra, các ràng buộc R1–R6; sinh 32 ca EP và 6 ca BVA mới (cùng 5 ca `SR-TC01`–`SR-TC05` của sinh viên = 43 ca); tạo script API/UI chạy 43 ca qua 2 lượt độc lập (5 Pass, 38 Fail), tổng hợp dữ kiện kỹ thuật và hoàn thiện mục AI Gap Analysis.
- **FR-14 — Phân tích, thiết kế, thực thi và AI Gap Analysis**: AI trích xuất 4 biến đầu vào ($V_1$–$V_4$), 7 kết quả đầu ra ($O_1$–$O_7$), 6 ràng buộc nghiệp vụ ($R_1$–$R_6$) và 8 câu hỏi mở (Q1–Q8); thiết kế 42 lớp tương đương (`EC01`–`EC42`), 34 ca EP (`EP-TC01`–`EP-TC34`), 10 ca BVA đầu vào (`BV-TC01`–`BV-TC10`) và 1 ca BVA biên đầu ra (`OB-TC01`). Sau khi sinh viên bổ sung 5 ca `SR-TC01`–`SR-TC05` (tổng 50 ca), AI tạo bộ kiểm thử tự động `run_fr14.js` và `fr14_ui.spec.js` thực thi 2 lượt độc lập (20 Pass, 30 Fail, 0% flakiness), lập bảng dữ kiện 5 ứng viên lỗi (`BUG-009`–`BUG-013`) và mục AI Gap Analysis.
- **Ngoại lệ giảng viên ngày 13/10/2026**: Theo xác nhận trực tiếp của sinh viên, AI được phép hoàn thiện các yêu cầu còn lại. AI đã mở rộng BUG-008 bằng dữ kiện backend không xác thực địa chỉ, chuẩn hóa Audit/Verdict và hoàn thiện bài AI Critique 286 từ. Toàn bộ thay đổi được ghi trong `AI_Audit_Report.md`.
- **Phần sinh viên trực tiếp thực hiện**:
  - Sinh viên trực tiếp thẩm định và bổ sung các ca kiểm thử chuyên sâu sau Human Review: 4 ca cho FR-03 (`SR-TC01`–`SR-TC04`), 5 ca cho FR-08 (`SR-TC01`–`SR-TC05`) và 5 ca cho FR-14 (`SR-TC01`–`SR-TC05`).
  - Sinh viên tự thao tác kiểm thử trên trình duyệt Google Chrome thật.
  - Sinh viên viết các báo cáo lỗi trong `Bug_Report.md` và tự đăng nhập GitHub tạo Issues trên kho mã nguồn cá nhân.
  - Sinh viên chịu trách nhiệm kiểm tra, xác nhận Verdict kiểm toán và đọc lại toàn bộ nội dung trước khi nộp.

---

## 5. Cách sinh viên kiểm tra, sửa và xác minh đầu ra của AI

1. **Đối chiếu độc lập với đặc tả (SRS)**: Kiểm tra lại từng giá trị Expected Result mà AI tính toán; kiên quyết giữ Expected tính từ SRS thay vì sửa theo code khi test Fail (tuân thủ nguyên tắc kiểm thử hộp đen §4).
2. **Thẩm định Human Review**: Nhận diện các khoảng trống AI bỏ sót ở từng tính năng để bổ sung các ca `SR-TC`: vòng đời OTP và số `0` ở đầu (FR-03); thay đổi giá theo thời điểm, double submit và IDOR đơn hàng (FR-08); chuẩn hóa khoảng trắng kết hợp hoa/thường (`SR-TC01`), double submit danh mục (`SR-TC04`) và toàn vẹn khóa ngoại liên hệ thống với danh sách sản phẩm (`SR-TC05`) ở FR-14.
3. **Kiểm chứng lặp lại (Reproducibility)**: Chạy lại 2 lần độc lập trên CSDL SQLite sạch cho cả 3 tính năng (FR-03, FR-08, FR-14) để xác minh 100% ca Pass/Fail đều tái hiện tất định (0% flakiness).
4. **Kiểm tra trực quan trên giao diện thực tế**: Đối chiếu kết quả chụp màn hình tự động và kiểm tra trực tiếp trên trình duyệt tại `http://localhost:5173` (Web người dùng) và `http://localhost:5174` (Web Admin).

---

## 6. Trích dẫn (Phong cách IEEE)

1. Google DeepMind, "Gemini 3.8 Flash Large Language Model," Google AI, 2026. [Online]. Available: https://deepmind.google/technologies/gemini/
2. Anthropic, "Claude 3.5 Sonnet / 3.7 Sonnet Model Family," Anthropic Research, 2025–2026. [Online]. Available: https://www.anthropic.com/claude
3. International Software Testing Qualifications Board, "Standard Glossary of Terms used in Software Testing (ISTQB Foundation Level Syllabus v4.0)," ISTQB, 2023.

---

## Tuyên bố trung thực

Tôi xác nhận toàn bộ nội dung khai báo trên là chính xác và trung thực. Tôi hiểu rằng việc khai báo thiếu hoặc sai lệch về việc sử dụng AI là vi phạm liêm chính học thuật và có thể bị xử lý theo quy định của môn học.

| Mục | Nội dung |
|---|---|
| **Họ và tên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Ngày** | 15/10/2026 |
| **Chữ ký** | Huỳnh Đức Thịnh |
