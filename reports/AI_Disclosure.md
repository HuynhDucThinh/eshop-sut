# Phiếu khai báo sử dụng AI — HW02

| Mục | Nội dung |
|---|---|
| **Môn học** | CS423 / CSC13003 – Kiểm thử phần mềm |
| **Giảng viên hướng dẫn** | ThS. Hồ Tuấn Thanh |
| **Mã bài tập** | HW02-AI |
| **Tên bài tập** | Domain Testing & BVA trên EShop SUT |
| **Nhóm sử dụng AI (1–5)** | Category 4 — AI hỗ trợ sản xuất (AI-assisted content creation with human oversight) |
| **Ngày cập nhật** | 16/10/2026 |
| **Họ và tên sinh viên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Lớp / Khóa** | CQ2023/31 |

---

## 1. Công cụ AI đã dùng

1. **Google Gemini 3.8 Flash** (Antigravity Agent, Google DeepMind) — Hỗ trợ trích xuất đặc tả SRS, phân tích các biến đầu vào/đầu ra, thiết kế EP/BVA, tạo script thực thi tự động và lập báo cáo kỹ thuật cho FR-03, FR-08, FR-14 và FR-20 (Bước 1–4).
2. **Anthropic Claude Sonnet 5.5** (Antigravity Agent) — Hỗ trợ phân tích phân hoạch tương đương (EP), phân tích giá trị biên (BVA $6n+1$), rà soát nguyên nhân gốc lỗi mã nguồn và đối chiếu checklist bài giảng Bài 4 (Bước 2, Bước 3, Bước 4).
3. **OpenAI Codex (GPT-5)** — Hỗ trợ tổng hợp bảng ma trận truy vết, cấu trúc dữ liệu AI Gap Analysis và đồng bộ biểu mẫu kiểm toán AI Audit (Bước 4).

---

## 2. Giai đoạn đã dùng AI

- [x] **brainstorming** (phát hiện các điểm mơ hồ, mâu thuẫn và giả định ngầm định trong đặc tả SRS của FR-03, FR-08, FR-14, FR-20)
- [x] **drafting** (soạn thảo bảng phân lớp tương đương EC, bộ test case sơ khởi và khung báo cáo theo mẫu chuẩn)
- [x] **feedback** (đề xuất các ca biên, trường hợp góc cần Human Review và câu hỏi định hướng cho bài AI Critique)
- [x] **revision** (hoàn thiện bảng phân tích khoảng trống AI Gap Analysis sau Human Review và thực thi)
- [x] **coding** (viết script kiểm thử tự động Node.js cho API và Playwright CLI cho giao diện Web / Web Admin / Mobile `390×844`; FR-03 có 45 ca, FR-08 có 43 ca, FR-14 có 50 ca, FR-20.3 có 54 ca — tổng 192 ca)
- [x] **data analysis** (phân tích log kết quả thực thi 2 lượt độc lập, tính toán tỷ lệ Pass/Fail, phân loại nguyên nhân gốc Phase B)
- [ ] khác: *(không)*

---

## 3. Các prompt chính tác động nhất (trích nguyên văn)

Toàn bộ 20 lượt tương tác (Artifact #1 đến #20) được lưu trữ đầy đủ tại [AI_Audit_Report.md](./AI_Audit_Report.md). Dưới đây là các prompt có tính định hình và tác động lớn nhất:

1. **Prompt thiết kế test case FR-03 (Bước 2)**:
   > `"/hw02_2_design_tests Đặc tả FR-03 đã được duyệt. Hãy áp dụng kỹ thuật Domain Testing (Phân hoạch tương đương EP 3 bước) chia các lớp EC valid/invalid cho từng biến và ràng buộc chéo (mật khẩu khớp nhau, OTP đúng email đã yêu cầu). Sau đó áp dụng BVA chế độ Robustness (6n+1) cho độ dài mật khẩu mới (min 8) và độ dài OTP (6 chữ số). Tính toán Expected result độc lập từ SRS và ghi toàn bộ vào reports/Main_Report.md. Dừng lại để tôi Human Review."`

2. **Prompt phân tích đặc tả FR-08 (Bước 1)**:
   > `"/hw02_1_analyze_feature tiến hành thực hiện phân tích yêu cầu cho fr-08. Nội dung cần làm đúng trong workflow đã quy định và cần làm chi tiết, kĩ càng"`

3. **Prompt thiết kế test case FR-14 (Bước 2)**:
   > `"Tui xác nhận các thông tin bạn gợi ý là đúng, tui đã commit rồi. Bạn tiến hành /hw02_2_design_tests thật đầy đủ, chi tiết. Tham khảo format của FR-03 và FR-08 để trình bày cho chính xác"`

4. **Prompt thực thi và báo cáo lỗi FR-14 (Bước 3)**:
   > `"/hw02_3_execute_and_report tiến hành thực hiện tiếp tục cho nội dung này giúp tôi. làm xong báo cáo kết quả, cần trình bày tương tự fr-03 và fr-08"`

5. **Prompt phân tích đặc tả FR-20.3 Mobile Checkout & Coupon (Bước 1)**:
   > `"/hw02_1_analyze_feature Tính năng: FR-20.3 — Mobile: Thanh toán (Checkout) và Áp mã giảm giá. Phân hệ / Pool: Pool D (Mobile React Native kết hợp nghiệp vụ FR-08 Checkout và FR-09 Coupon). Hãy đọc tài liệu đặc tả, trích xuất bảng SRS Extract (đầu vào, đầu ra, ràng buộc, điều kiện tiên quyết, 5 điều kiện coupon C1–C5) theo nguyên tắc kiểm thử hộp đen (§4: chưa đọc mã nguồn). Liệt kê các câu hỏi mở và nêu giả định đề xuất, sau đó dừng lại chờ tôi xác nhận."`

6. **Prompt thực thi và báo cáo lỗi FR-20.3 (Bước 3)**:
   > `"/hw02_3_execute_and_report Làm đầy đủ giúp tôi, tuân theo format của tất cả các testcase đã có sẵn. Không được tự ý thêm giao diện cho terminal hay bịa dữ liệu. Làm xong báo cáo kết quả các việc đã làm để tôi nắm và hiểu"`

---

## 4. Phần việc AI đã đóng góp

- **FR-03 — Quên mật khẩu (Pool A)**: AI trích xuất 5 biến đầu vào ($V_1$–$V_5$), 6 kết quả đầu ra ($O_{1.1}$–$O_{2.4}$) và 5 câu hỏi mở (Q1–Q5); thiết kế 30 lớp tương đương, 31 ca EP, 9 ca BVA Robustness $6n+1$ và 1 ca OB (tổng 45 ca cùng 4 ca `SR-TC01`–`SR-TC04` của sinh viên); tạo script `run_fr03.js` và `fr03_ui.spec.js` thực thi tự động 2 lượt độc lập (24 Pass, 20 Fail, 1 Blocked), lập bảng dữ kiện 3 lỗi `BUG-001`–`BUG-003`.
- **FR-08 — Thanh toán (Pool B)**: AI trích xuất 4 biến đầu vào, 5 đầu ra, các ràng buộc R1–R6; thiết kế 32 ca EP và 6 ca BVA Robustness (cùng 5 ca `SR-TC01`–`SR-TC05` của sinh viên = 43 ca); tạo script API/UI chạy 43 ca qua 2 lượt độc lập (5 Pass, 38 Fail), tổng hợp dữ kiện 5 lỗi `BUG-004`–`BUG-008` và phân tích khoảng trống AI Gap Analysis.
- **FR-14 — Quản lý Danh mục (Pool C)**: AI trích xuất 4 biến đầu vào ($V_1$–$V_4$), 7 kết quả đầu ra ($O_1$–$O_7$), 6 ràng buộc nghiệp vụ ($R_1$–$R_6$) và 9 câu hỏi mở; thiết kế 42 lớp tương đương, 34 ca EP, 10 ca BVA đầu vào và 1 ca BVA đầu ra (tổng 50 ca cùng 5 ca `SR-TC01`–`SR-TC05` sau Human Review); sinh bộ kiểm thử tự động `run_fr14.js` và `fr14_ui.spec.js` chạy 2 lượt độc lập (20 Pass, 30 Fail, 0% flakiness), lập bảng dữ kiện 5 lỗi `BUG-009` đến `BUG-013`.
- **FR-20.3 — Mobile Thanh toán & Áp mã giảm giá (Pool D)**: AI trích xuất bảng đặc tả SRS Extract gồm 5 biến đầu vào ($V_1$–$V_5$), 5 đầu ra ($O_1$–$O_5$), bảng phân tích 5 điều kiện coupon `C1`–`C5`, 8 ràng buộc nghiệp vụ và 9 câu hỏi mở; thiết kế 42 lớp tương đương, 30 ca EP, 17 ca BVA đầu vào ($6n+1$ với $n=4$) và 2 ca BVA biên đầu ra/thời gian (tổng 54 ca cùng 5 ca `SR-TC01`–`SR-TC05` sau Human Review); sinh bộ kiểm thử tự động `run_fr20_3.js` và `fr20_3_ui.spec.js` (trên Mobile `390×844`) chạy 2 lượt độc lập (21 Pass, 33 Fail, 0% flakiness), lập bảng dữ kiện 6 lỗi `BUG-014` đến `BUG-019` và phân tích khoảng trống AI Gap Analysis.
- **Hỗ trợ chuẩn hóa quản trị và báo cáo**: Hỗ trợ chuẩn hóa cấu trúc báo cáo [Main_Report.md](./Main_Report.md), ghi nhật ký kiểm toán [AI_Audit_Report.md](./AI_Audit_Report.md) (20 Artifacts VALID) và hỗ trợ khung phản biện trong [AI_Critique.md](./AI_Critique.md).
- **Phần sinh viên trực tiếp thực hiện**:
  - Trực tiếp kiểm tra, điều chỉnh và duyệt các giả định mở (Q1–Q9) trước khi sang bước thiết kế test case.
  - Trực tiếp thực hiện **Human Review**, phát hiện các khoảng trống AI bỏ sót và định hướng ý tưởng kiểm thử cho các ca bổ sung: 4 ca cho FR-03 (`SR-TC01`–`SR-TC04`), 5 ca cho FR-08 (`SR-TC01`–`SR-TC05`), 5 ca cho FR-14 (`SR-TC01`–`SR-TC05`) và 5 ca cho FR-20.3 (`SR-TC01`–`SR-TC05`). Đối với các ca `SR-TC`, sinh viên trực tiếp chỉ định kịch bản và rủi ro nghiệp vụ cần rà soát; AI đóng vai trò hỗ trợ soạn thảo câu chữ và cấu trúc bảng; sau đó sinh viên trực tiếp thẩm định, phê duyệt và chịu trách nhiệm học thuật hoàn toàn.
  - Tự tay kiểm chứng các lỗi trên hệ thống thực tế (trên Web người dùng `http://localhost:5173`, Web Admin `http://localhost:5174` và môi trường Mobile `frontend-mobile/App.js`).
  - Rà soát và hoàn thiện báo cáo lỗi trong [Bug_Report.md](./Bug_Report.md) (`BUG-001` đến `BUG-019`), tạo GitHub Issues kèm bằng chứng ảnh thật.
  - Tự viết bài phản biện cá nhân [AI_Critique.md](./AI_Critique.md) (251 từ) và phần kết luận trong [AI_Audit_Report.md](./AI_Audit_Report.md).

---

## 5. Cách sinh viên kiểm tra, sửa và xác minh đầu ra của AI

1. **Đối chiếu độc lập với đặc tả (SRS)**: Kiểm tra từng giá trị kết quả mong đợi (Expected Result) mà AI tính toán; kiên quyết giữ Expected tính từ SRS thay vì sửa theo code khi test Fail (tuân thủ nguyên tắc kiểm thử hộp đen §4).
2. **Thẩm định Human Review**: Nhận diện các khoảng trống AI bỏ sót ở từng tính năng để bổ sung các ca `SR-TC`: vòng đời OTP và số `0` ở đầu (FR-03); thay đổi giá theo thời điểm, double submit và IDOR đơn hàng (FR-08); chuẩn hóa khoảng trắng kết hợp hoa/thường (`SR-TC01`), double submit danh mục (`SR-TC04`) và toàn vẹn khóa ngoại liên hệ thống với danh sách sản phẩm (`SR-TC05`) ở FR-14; giới hạn lượt dùng coupon C5 và gian lận giá client-side ở FR-20.
3. **Kiểm chứng lặp lại (Reproducibility)**: Chạy lại 2 lần độc lập trên CSDL SQLite sạch cho tất cả các tính năng để xác minh 100% ca Pass/Fail đều tái hiện tất định (0% flakiness).
4. **Kiểm tra trực quan trên giao diện thực tế**: Đối chiếu kết quả chụp màn hình tự động và kiểm tra trực tiếp trên trình duyệt tại `http://localhost:5173` (Web người dùng), `http://localhost:5174` (Web Admin) và phân hệ Mobile.

---

## 6. Trích dẫn (Phong cách IEEE)

1. Google DeepMind, "Gemini 3.8 Flash Large Language Model," Google AI, 2026. [Online]. Available: https://deepmind.google/technologies/gemini/
2. Anthropic, "Claude 3.5 Sonnet / 3.7 Sonnet Model Family," Anthropic Research, 2025–2026. [Online]. Available: https://www.anthropic.com/claude
3. International Software Testing Qualifications Board, "Standard Glossary of Terms used in Software Testing (ISTQB Foundation Level Syllabus v4.0)," ISTQB, 2023.

---

## Tuyên bố trung thực

Em xác nhận toàn bộ nội dung khai báo trên là chính xác và trung thực. Em hiểu rằng việc khai báo thiếu hoặc sai lệch về việc sử dụng AI là vi phạm liêm chính học thuật và có thể bị xử lý theo quy định của môn học.

| Mục | Nội dung |
|---|---|
| **Họ và tên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Ngày** | 16/10/2026 |
| **Chữ ký** | Huỳnh Đức Thịnh |

