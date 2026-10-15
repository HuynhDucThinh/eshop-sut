# Phiếu khai báo sử dụng AI — HW02

| Mục | Nội dung |
|---|---|
| **Môn học** | CS423 / CSC13003 – Kiểm thử phần mềm |
| **Giảng viên hướng dẫn** | ThS. Hồ Tuấn Thanh |
| **Mã bài tập** | HW02-AI |
| **Tên bài tập** | Domain Testing trên EShop SUT |
| **Nhóm sử dụng AI (1–5)** | Category 4 — AI hỗ trợ sản xuất (AI-assisted content creation with human oversight) |
| **Ngày cập nhật** | 13/10/2026 |
| **Họ và tên sinh viên** | Huỳnh Đức Thịnh |
| **MSSV** | 23120199 |
| **Lớp / Khóa** | CQ2023/31 |

---

## 1. Công cụ AI đã dùng

1. **Google Gemini 3.8 Flash** (Antigravity Agent, Google DeepMind) — Hỗ trợ trích xuất đặc tả SRS, phân tích các biến đầu vào/đầu ra và các ràng buộc nghiệp vụ (Bước 1).
2. **Anthropic Claude Sonnet 5.5** (Antigravity Agent) — Hỗ trợ thiết kế phân hoạch tương đương (EP), phân tích giá trị biên (BVA $6n+1$), tạo script thực thi tự động và rà soát nguyên nhân gốc (Bước 2, Bước 3, Bước 4).
3. **OpenAI Codex (GPT-5)** — Hỗ trợ đối chiếu FR-08 với FR-03, tổng hợp AI Gap Analysis, cập nhật dữ kiện Disclosure và câu hỏi gợi ý AI Critique (Bước 4).

---

## 2. Giai đoạn đã dùng AI

- [x] **brainstorming** (phát hiện các điểm mơ hồ của FR-03 và FR-08 trong đặc tả SRS)
- [x] **drafting** (soạn dự thảo bảng EC, bộ test case sơ khởi và khung báo cáo)
- [x] **feedback** (đề xuất điểm cần Human Review và câu hỏi gợi ý Critique)
- [x] **revision** (hoàn thiện AI Gap Analysis sau Human Review và thực thi)
- [x] **coding** (viết script kiểm thử tự động Node.js cho API và Playwright CLI cho UI; FR-03 có 45 ca, FR-08 có 43 ca)
- [x] **data analysis** (phân tích nhật ký thực thi, đối chiếu Pass/Fail, khoảng trống AI và nguyên nhân gốc)
- [ ] khác: *(không)*

---

## 3. Các prompt chính tác động nhất (trích nguyên văn)

Toàn bộ nhật ký prompt và đối chiếu chi tiết được lưu trữ tại [reports/AI_Audit_Report.md](file:///d:/KCPM/eshop-sut/reports/AI_Audit_Report.md). Dưới đây là 3 prompt có tính định hình và tác động lớn nhất:

1. **Prompt thiết kế test case FR-03 (Bước 2)**:
   > `"/hw02_2_design_tests Đặc tả FR-03 đã được duyệt. Hãy áp dụng kỹ thuật Domain Testing (Phân hoạch tương đương EP 3 bước) chia các lớp EC valid/invalid cho từng biến và ràng buộc chéo (mật khẩu khớp nhau, OTP đúng email đã yêu cầu). Sau đó áp dụng BVA chế độ Robustness (6n+1) cho độ dài mật khẩu mới (min 8) và độ dài OTP (6 chữ số). Tính toán Expected result độc lập từ SRS và ghi toàn bộ vào reports/Main_Report.md. Dừng lại để tôi Human Review."`

2. **Prompt phân tích đặc tả FR-08 (Bước 1)**:
   > `"/hw02_1_analyze_feature tiến hành thực hiện phân tích yêu cầu cho fr-08. Nội dung cần làm đúng trong workflow đã quy định và cần làm chi tiết, kĩ càng"`

3. **Prompt thực thi FR-08 (Bước 3)**:
   > `"/hw02_3_execute_and_report Tiến hành làm chuẩn chỉnh như fr-03 giúp tôi"`

---

## 4. Phần việc AI đã đóng góp

- **Trích xuất dữ liệu**: AI trích xuất 5 biến đầu vào ($V_1$–$V_5$), 6 kết quả đầu ra ($O_{1.1}$–$O_{2.4}$) và 5 câu hỏi mở nghiệp vụ (Q1–Q5) trong `Main_Report.md`.
- **Thiết kế kiểm thử ban đầu**: AI sinh 37 lớp tương đương (`EC01`–`EC37`) bao phủ đầy đủ các điều kiện dữ liệu và ràng buộc DOM giao diện; thiết kế các ca EP (`EP-TC01`–`EP-TC31`) và 9 ca biên `BV-TC01`–`BV-TC09` theo công thức Robustness $6n+1$.
- **Tự động hóa thực thi**: AI tạo script `run_fr03.js` cho kiểm thử API và kịch bản Playwright CLI `fr03_ui.spec.js` cho kiểm thử giao diện; thực thi tự động 2 lần độc lập, ghi log và chụp ảnh màn hình lưu vào `reports/evidence/FR-03/`.
- **FR-08 — Phân tích và thiết kế**: AI trích xuất 4 biến đầu vào, 5 đầu ra, các ràng buộc R1–R6; sinh 32 ca EP và 6 ca BVA mới. Sau Human Review, sinh viên bổ sung 5 ca `SR-TC01`–`SR-TC05`, nâng tổng số lên 43 ca.
- **FR-08 — Thực thi và phân tích khoảng trống**: AI tạo script API/UI, chạy 43 ca qua 2 lượt độc lập (5 Pass, 38 Fail), tổng hợp dữ kiện kỹ thuật và hoàn thiện mục AI Gap Analysis.
- **Ngoại lệ giảng viên ngày 13/10/2026**: Theo xác nhận trực tiếp của sinh viên, AI được phép hoàn thiện các yêu cầu còn lại. AI đã mở rộng BUG-008 bằng dữ kiện backend không xác thực địa chỉ, chuẩn hóa Audit/Verdict và hoàn thiện bài AI Critique 286 từ. Toàn bộ thay đổi được ghi trong `AI_Audit_Report.md`.
- **Phần sinh viên trực tiếp thực hiện**:
  - Sinh viên trực tiếp thẩm định và bổ sung 4 ca biên chất lượng cao (`SR-TC01` đến `SR-TC04`).
  - Sinh viên tự thao tác kiểm thử trên trình duyệt Google Chrome thật.
  - Sinh viên viết các báo cáo BUG-001–BUG-008 ban đầu; AI chỉ mở rộng BUG-008 theo ngoại lệ mới và bằng chứng đã chạy.
  - Sinh viên tự đăng nhập GitHub và tạo 3 Issues cho FR-03 (#2–#4), 5 Issues cho FR-08 (#5–#9) trên kho mã nguồn cá nhân.
  - Sinh viên cung cấp xác nhận về ngoại lệ mới của giảng viên và chịu trách nhiệm đọc lại nội dung hoàn thiện trước khi nộp.

---

## 5. Cách sinh viên kiểm tra, sửa và xác minh đầu ra của AI

1. **Đối chiếu độc lập với đặc tả (SRS)**: Kiểm tra lại từng giá trị Expected Result mà AI tính toán; kiên quyết giữ Expected tính từ SRS thay vì sửa theo code khi test Fail (tuân thủ nguyên tắc kiểm thử hộp đen §4).
2. **Thẩm định Human Review**: Nhận diện các khoảng trống AI bỏ sót (vòng đời token, số 0 ở đầu, ký tự khoảng trắng) để tự bổ sung 4 ca `SR-TC01`–`SR-TC04`.
3. **Kiểm chứng lặp lại (Reproducibility)**: Chạy lại 2 lần độc lập để xác minh 15 ca Fail đều tái hiện ổn định 100%, không phải do lỗi môi trường hay trạng thái rác.
4. **Kiểm tra trực quan trên giao diện thực tế**: Trực tiếp mở Chrome tại `http://localhost:5173/forgot-password` để phát hiện lỗi giao diện thiếu trường "Xác nhận mật khẩu" mà kiểm thử API ban đầu chưa thấy.
5. **Rà soát FR-08 sau đầu ra AI**: Bổ sung `SR-TC01`–`SR-TC05` để kiểm tra thay đổi giá theo thời điểm, double submit, Unicode, SQL Injection và quyền sở hữu đơn hàng; `SR-TC05` phát hiện lỗi IDOR `BUG-007` mà bộ AI ban đầu bỏ sót.
6. **Đối chứng kết quả FR-08**: Chạy lại độc lập toàn bộ API và UI hai lần; hai lượt đều cho 5 Pass, 38 Fail, không có ca Flaky hoặc Blocked.

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
| **Ngày** | *(Sinh viên điền khi ký)* |
| **Chữ ký** | (Sinh viên ký) |
